using System.Text;
using Backend.Configurations;
using Backend.Data;
using Backend.DTOs.TrainingModuleResources;
using Backend.Entities;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed class TrainingModuleResourceService : ITrainingModuleResourceService
{
    private static readonly IReadOnlyDictionary<string, (TrainingModuleResourceType Type, string[] MimeTypes)> AllowedFiles =
        new Dictionary<string, (TrainingModuleResourceType, string[])>(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = (TrainingModuleResourceType.Pdf, ["application/pdf"]),
            [".docx"] = (TrainingModuleResourceType.Docx, ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"]),
            [".txt"] = (TrainingModuleResourceType.Txt, ["text/plain", "application/octet-stream"]),
            [".md"] = (TrainingModuleResourceType.Markdown, ["text/markdown", "text/plain", "application/octet-stream"])
        };

    private readonly ApplicationDbContext _dbContext;
    private readonly ITrainingAccessService _trainingAccess;
    private readonly IFileStorageService _storage;
    private readonly IReadOnlyCollection<IDocumentTextExtractor> _extractors;
    private readonly ModuleResourceOptions _options;

    public TrainingModuleResourceService(
        ApplicationDbContext dbContext,
        ITrainingAccessService trainingAccess,
        IFileStorageService storage,
        IEnumerable<IDocumentTextExtractor> extractors,
        IOptions<ModuleResourceOptions> options)
    {
        _dbContext = dbContext;
        _trainingAccess = trainingAccess;
        _storage = storage;
        _extractors = extractors.ToArray();
        _options = options.Value;
    }

    public async Task<IReadOnlyCollection<TrainingModuleResourceResponse>> GetAllAsync(
        int trainingId, int moduleId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        await EnsureManageAccessAsync(trainingId, moduleId, userId, roles, cancellationToken);
        return await _dbContext.TrainingModuleResources.AsNoTracking()
            .Where(resource => resource.TrainingModuleId == moduleId)
            .OrderByDescending(resource => resource.CreatedAt)
            .Select(resource => Map(resource))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<TrainingModuleResourceResponse> GetByIdAsync(
        int trainingId, int moduleId, int resourceId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        await EnsureManageAccessAsync(trainingId, moduleId, userId, roles, cancellationToken);
        return Map(await FindResourceAsync(moduleId, resourceId, false, cancellationToken));
    }

    public async Task<TrainingModuleResourceResponse> CreateTextAsync(
        int trainingId, int moduleId, CreateTextResourceRequest request, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        await EnsureManageAccessAsync(trainingId, moduleId, userId, roles, cancellationToken);
        await EnsureCapacityAsync(moduleId, cancellationToken);
        var title = NormalizeTitle(request.Title);
        var text = NormalizeText(request.TextContent);
        if (text.Length == 0) throw new InvalidOperationException("Le contenu texte est requis.");
        if (text.Length > _options.MaxTextCharacters) throw new InvalidOperationException($"Le contenu texte ne peut pas depasser {_options.MaxTextCharacters} caracteres.");

        var resource = new TrainingModuleResource
        {
            TrainingModuleId = moduleId,
            Title = title,
            ResourceType = TrainingModuleResourceType.Text,
            TextContent = text,
            ExtractedText = text,
            ProcessingStatus = TrainingModuleResourceStatus.Ready,
            IsActive = true
        };

        _dbContext.TrainingModuleResources.Add(resource);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await ReplaceChunksAsync(resource, text, cancellationToken);
        return Map(resource);
    }

    public async Task<TrainingModuleResourceResponse> UploadAsync(
        int trainingId, int moduleId, UploadResourceRequest request, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        await EnsureManageAccessAsync(trainingId, moduleId, userId, roles, cancellationToken);
        await EnsureCapacityAsync(moduleId, cancellationToken);
        var title = NormalizeTitle(request.Title);
        var file = request.File ?? throw new InvalidOperationException("Un fichier est requis.");
        if (file.Length <= 0) throw new InvalidOperationException("Le fichier est vide.");
        if (file.Length > _options.MaxFileSizeBytes) throw new InvalidOperationException($"Le fichier depasse la limite de {_options.MaxFileSizeBytes / 1024 / 1024} Mo.");

        var originalName = Path.GetFileName(file.FileName);
        if (string.IsNullOrWhiteSpace(originalName) || originalName.Length > 255) throw new InvalidOperationException("Le nom du fichier est invalide.");
        var extension = Path.GetExtension(originalName);
        if (!AllowedFiles.TryGetValue(extension, out var allowed)) throw new InvalidOperationException("Format non autorise. Formats acceptes : PDF, DOCX, TXT et MD.");
        if (!allowed.MimeTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase)) throw new InvalidOperationException("Le type MIME du fichier ne correspond pas au format attendu.");

        await using (var validationStream = file.OpenReadStream())
            await ValidateSignatureAsync(validationStream, allowed.Type, cancellationToken);

        StoredFileResult stored;
        await using (var uploadStream = file.OpenReadStream())
            stored = await _storage.SaveAsync(uploadStream, extension, cancellationToken);

        var resource = new TrainingModuleResource
        {
            TrainingModuleId = moduleId,
            Title = title,
            ResourceType = allowed.Type,
            OriginalFileName = originalName,
            StoredFileName = stored.StoredFileName,
            StoragePath = stored.StoragePath,
            MimeType = file.ContentType,
            FileSize = file.Length,
            ProcessingStatus = TrainingModuleResourceStatus.Pending,
            IsActive = true
        };

        _dbContext.TrainingModuleResources.Add(resource);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await ProcessAsync(resource, cancellationToken);
        return Map(resource);
    }

    public async Task<TrainingModuleResourceResponse> UpdateStatusAsync(
        int trainingId, int moduleId, int resourceId, UpdateResourceStatusRequest request, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        await EnsureManageAccessAsync(trainingId, moduleId, userId, roles, cancellationToken);
        var resource = await FindResourceAsync(moduleId, resourceId, true, cancellationToken);
        resource.IsActive = request.IsActive;
        resource.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(resource);
    }

    public async Task<TrainingModuleResourceResponse> ReprocessAsync(
        int trainingId, int moduleId, int resourceId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        await EnsureManageAccessAsync(trainingId, moduleId, userId, roles, cancellationToken);
        var resource = await FindResourceAsync(moduleId, resourceId, true, cancellationToken);
        if (resource.ResourceType == TrainingModuleResourceType.Text) throw new ConflictException("Une ressource texte ne necessite pas de retraitement.");
        await ProcessAsync(resource, cancellationToken);
        return Map(resource);
    }

    public async Task DeleteAsync(
        int trainingId, int moduleId, int resourceId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        await EnsureManageAccessAsync(trainingId, moduleId, userId, roles, cancellationToken);
        var resource = await FindResourceAsync(moduleId, resourceId, true, cancellationToken);
        if (!string.IsNullOrWhiteSpace(resource.StoragePath)) await _storage.DeleteAsync(resource.StoragePath, cancellationToken);
        _dbContext.TrainingModuleResources.Remove(resource);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ProcessAsync(TrainingModuleResource resource, CancellationToken cancellationToken)
    {
        resource.ProcessingStatus = TrainingModuleResourceStatus.Processing;
        resource.ProcessingError = null;
        resource.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            var extractor = _extractors.FirstOrDefault(item => item.CanExtract(resource.ResourceType))
                ?? throw new InvalidOperationException("Aucun extracteur n'est disponible pour ce format.");
            await using var stream = await _storage.OpenReadAsync(resource.StoragePath!, cancellationToken);
            var extracted = NormalizeText(await extractor.ExtractAsync(stream, cancellationToken));
            if (string.IsNullOrWhiteSpace(extracted))
                throw new InvalidOperationException(resource.ResourceType == TrainingModuleResourceType.Pdf
                    ? "Aucun texte extractible n'a ete trouve. Ce PDF est peut-etre scanne ou protege."
                    : "Aucun texte extractible n'a ete trouve dans ce document.");
            if (extracted.Length > _options.MaxTextCharacters)
                throw new InvalidOperationException($"Le texte extrait depasse la limite de {_options.MaxTextCharacters} caracteres.");

            resource.ExtractedText = extracted;
            resource.ProcessingStatus = TrainingModuleResourceStatus.Ready;
            await ReplaceChunksAsync(resource, extracted, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            resource.ExtractedText = null;
            RemoveChunks(resource.Id);
            resource.ProcessingStatus = TrainingModuleResourceStatus.Failed;
            resource.ProcessingError = exception.Message.Length > 1000 ? exception.Message[..1000] : exception.Message;
        }

        resource.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureManageAccessAsync(int trainingId, int moduleId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken)
    {
        if (!roles.Contains(ApplicationRoles.Admin))
            throw new ForbiddenException("Seul un administrateur peut gerer les ressources de ce module.");
        await _trainingAccess.EnsureModuleAccessAsync(trainingId, moduleId, userId, roles, cancellationToken);
    }

    private async Task EnsureCapacityAsync(int moduleId, CancellationToken cancellationToken)
    {
        var count = await _dbContext.TrainingModuleResources.CountAsync(resource => resource.TrainingModuleId == moduleId, cancellationToken);
        if (count >= _options.MaxResourcesPerModule) throw new ConflictException($"Ce module contient deja la limite de {_options.MaxResourcesPerModule} ressources.");
    }

    private async Task<TrainingModuleResource> FindResourceAsync(int moduleId, int resourceId, bool tracked, CancellationToken cancellationToken)
    {
        var query = tracked ? _dbContext.TrainingModuleResources : _dbContext.TrainingModuleResources.AsNoTracking();
        return await query.FirstOrDefaultAsync(resource => resource.Id == resourceId && resource.TrainingModuleId == moduleId, cancellationToken)
            ?? throw new NotFoundException("La ressource pedagogique est introuvable.");
    }

    private async Task ReplaceChunksAsync(TrainingModuleResource resource, string content, CancellationToken cancellationToken)
    {
        RemoveChunks(resource.Id);
        var chunkSize = Math.Max(500, _options.ContextChunkCharacters);
        var chunks = Chunk(content, chunkSize).Select((chunk, index) => new ModuleContentChunk
        {
            TrainingModuleResourceId = resource.Id,
            TrainingModuleId = resource.TrainingModuleId,
            ChunkIndex = index + 1,
            Content = chunk,
            CharacterCount = chunk.Length,
            CreatedAt = DateTime.UtcNow
        });
        _dbContext.ModuleContentChunks.AddRange(chunks);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private void RemoveChunks(int resourceId)
    {
        _dbContext.ModuleContentChunks.RemoveRange(_dbContext.ModuleContentChunks.Where(chunk => chunk.TrainingModuleResourceId == resourceId));
    }

    private static IEnumerable<string> Chunk(string content, int maxLength)
    {
        var paragraphs = content.Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace('\r', '\n')
            .Split("\n\n", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var builder = new StringBuilder();
        foreach (var paragraph in paragraphs)
        {
            var value = paragraph.Trim();
            while (value.Length > maxLength)
            {
                if (builder.Length > 0)
                {
                    yield return builder.ToString();
                    builder.Clear();
                }
                yield return value[..maxLength];
                value = value[maxLength..];
            }

            if (builder.Length + value.Length + 2 > maxLength && builder.Length > 0)
            {
                yield return builder.ToString();
                builder.Clear();
            }

            if (builder.Length > 0) builder.AppendLine().AppendLine();
            builder.Append(value);
        }

        if (builder.Length > 0) yield return builder.ToString();
    }

    private static string NormalizeTitle(string title)
    {
        var value = title.Trim();
        if (value.Length == 0 || value.Length > 200) throw new InvalidOperationException("Le titre doit contenir entre 1 et 200 caracteres.");
        return value;
    }

    private static string NormalizeText(string text) => text.Replace("\r\n", "\n", StringComparison.Ordinal).Replace('\r', '\n').Trim();

    private static async Task ValidateSignatureAsync(Stream stream, TrainingModuleResourceType type, CancellationToken cancellationToken)
    {
        var header = new byte[8];
        var read = await stream.ReadAsync(header, cancellationToken);
        if (type == TrainingModuleResourceType.Pdf && (read < 5 || Encoding.ASCII.GetString(header, 0, 5) != "%PDF-"))
            throw new InvalidOperationException("La signature du fichier PDF est invalide.");
        if (type == TrainingModuleResourceType.Docx && (read < 4 || header[0] != 0x50 || header[1] != 0x4B || header[2] != 0x03 || header[3] != 0x04))
            throw new InvalidOperationException("La signature du fichier DOCX est invalide.");
        if (type is TrainingModuleResourceType.Txt or TrainingModuleResourceType.Markdown && header.Take(read).Any(value => value == 0))
            throw new InvalidOperationException("Le fichier texte contient des donnees binaires.");
    }

    private static TrainingModuleResourceResponse Map(TrainingModuleResource resource) => new(
        resource.Id, resource.TrainingModuleId, resource.Title, resource.ResourceType,
        resource.OriginalFileName, resource.MimeType, resource.FileSize, resource.TextContent,
        resource.ExtractedText, resource.ProcessingStatus, resource.ProcessingError,
        resource.IsActive, resource.CreatedAt, resource.UpdatedAt);
}
