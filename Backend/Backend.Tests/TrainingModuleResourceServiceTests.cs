using System.Text;
using Backend.Configurations;
using Backend.Data;
using Backend.DTOs.TrainingModuleResources;
using Backend.Entities;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Tests;

public sealed class TrainingModuleResourceServiceTests : IDisposable
{
    private readonly ApplicationDbContext _db;
    private readonly MemoryStorage _storage = new();
    private readonly ModuleResourceOptions _options = new() { MaxFileSizeBytes = 1024, MaxResourcesPerModule = 20, MaxTextCharacters = 1000 };
    private readonly TrainingModuleResourceService _service;
    private static readonly string[] Admin = [ApplicationRoles.Admin];

    public TrainingModuleResourceServiceTests()
    {
        var dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        _db = new ApplicationDbContext(dbOptions);
        _db.Trainings.Add(new Training { Id = 1, CategoryId = 1, Title = "Formation", Slug = "formation", DurationHours = 1 });
        _db.TrainingModules.Add(new TrainingModule { Id = 10, TrainingId = 1, Title = "Module", OrderIndex = 1, IsPublished = true });
        _db.SaveChanges();
        _service = CreateService(new FakeExtractor("contenu extrait"));
    }

    [Fact] public async Task CreateText_CreatesReadyActiveResource()
    {
        var result = await _service.CreateTextAsync(1, 10, new() { Title = "Cours", TextContent = "Contenu" }, "admin", Admin);
        Assert.Equal(TrainingModuleResourceStatus.Ready, result.ProcessingStatus); Assert.True(result.IsActive); Assert.Equal("Contenu", result.ExtractedText);
    }

    [Fact] public async Task CreateText_NormalizesWhitespace()
    {
        var result = await _service.CreateTextAsync(1, 10, new() { Title = "  Cours  ", TextContent = "  Ligne\r\nDeux  " }, "admin", Admin);
        Assert.Equal("Cours", result.Title); Assert.Equal("Ligne\nDeux", result.TextContent);
    }

    [Fact] public async Task CreateText_RejectsEmptyContent() =>
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateTextAsync(1, 10, new() { Title = "Cours", TextContent = " " }, "admin", Admin));

    [Fact] public async Task CreateText_RejectsTooLongContent()
    {
        _options.MaxTextCharacters = 3;
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateTextAsync(1, 10, new() { Title = "Cours", TextContent = "quatre" }, "admin", Admin));
    }

    [Fact] public async Task CreateText_RejectsTooLongTitle() =>
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateTextAsync(1, 10, new() { Title = new string('x', 201), TextContent = "ok" }, "admin", Admin));

    [Fact] public async Task CreateText_EnforcesResourceLimit()
    {
        _options.MaxResourcesPerModule = 1;
        await _service.CreateTextAsync(1, 10, new() { Title = "Un", TextContent = "ok" }, "admin", Admin);
        await Assert.ThrowsAsync<ConflictException>(() => _service.CreateTextAsync(1, 10, new() { Title = "Deux", TextContent = "ok" }, "admin", Admin));
    }

    [Fact] public async Task Upload_RejectsUnsupportedExtension() =>
        await Assert.ThrowsAsync<InvalidOperationException>(() => UploadAsync("bad.exe", "application/octet-stream", "MZ"u8.ToArray()));

    [Fact] public async Task Upload_RejectsOversizedFile() =>
        await Assert.ThrowsAsync<InvalidOperationException>(() => UploadAsync("large.txt", "text/plain", new byte[1025]));

    [Fact] public async Task Upload_RejectsMismatchedMime() =>
        await Assert.ThrowsAsync<InvalidOperationException>(() => UploadAsync("file.pdf", "text/plain", "%PDF-"u8.ToArray()));

    [Fact] public async Task Upload_RejectsInvalidPdfSignature() =>
        await Assert.ThrowsAsync<InvalidOperationException>(() => UploadAsync("file.pdf", "application/pdf", "notpdf"u8.ToArray()));

    [Fact] public async Task Upload_RejectsInvalidDocxSignature() =>
        await Assert.ThrowsAsync<InvalidOperationException>(() => UploadAsync("file.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "notzip"u8.ToArray()));

    [Fact] public async Task Upload_RejectsBinaryText() =>
        await Assert.ThrowsAsync<InvalidOperationException>(() => UploadAsync("file.txt", "text/plain", [0, 1, 2]));

    [Fact] public async Task Upload_ValidTxtBecomesReady()
    {
        var result = await UploadAsync("cours.txt", "text/plain", "texte"u8.ToArray());
        Assert.Equal(TrainingModuleResourceType.Txt, result.ResourceType); Assert.Equal(TrainingModuleResourceStatus.Ready, result.ProcessingStatus); Assert.Equal("contenu extrait", result.ExtractedText);
    }

    [Fact] public async Task Upload_EmptyExtractionBecomesFailed()
    {
        var service = CreateService(new FakeExtractor(" "));
        var result = await UploadAsync("cours.txt", "text/plain", "texte"u8.ToArray(), service);
        Assert.Equal(TrainingModuleResourceStatus.Failed, result.ProcessingStatus); Assert.NotNull(result.ProcessingError);
    }

    [Fact] public async Task UpdateStatus_TogglesActiveFlag()
    {
        var created = await _service.CreateTextAsync(1, 10, new() { Title = "Cours", TextContent = "ok" }, "admin", Admin);
        var updated = await _service.UpdateStatusAsync(1, 10, created.Id, new(false), "admin", Admin);
        Assert.False(updated.IsActive);
    }

    [Fact] public async Task Delete_RemovesDatabaseAndStoredFile()
    {
        var created = await UploadAsync("cours.txt", "text/plain", "texte"u8.ToArray());
        await _service.DeleteAsync(1, 10, created.Id, "admin", Admin);
        Assert.False(await _db.TrainingModuleResources.AnyAsync()); Assert.True(_storage.DeleteCalled);
    }
    [Fact] public async Task AdminWithLearnerRole_CanManageDraftModuleResources()
    {
        _db.TrainingModules.Add(new TrainingModule { Id = 11, TrainingId = 1, Title = "Draft", OrderIndex = 2, IsPublished = false });
        await _db.SaveChangesAsync();

        var result = await _service.CreateTextAsync(1, 11, new() { Title = "Cours", TextContent = "Contenu" }, "admin", [ApplicationRoles.Admin, ApplicationRoles.Learner]);

        Assert.Equal(TrainingModuleResourceStatus.Ready, result.ProcessingStatus);
    }

    [Fact] public async Task Learner_CannotManageResources() =>
        await Assert.ThrowsAsync<ForbiddenException>(() => _service.GetAllAsync(1, 10, "learner", [ApplicationRoles.Learner]));

    [Fact] public async Task CreateText_CreatesContentChunks()
    {
        await _service.CreateTextAsync(1, 10, new() { Title = "Cours", TextContent = "Premier paragraphe.\n\nDeuxieme paragraphe." }, "admin", Admin);
        Assert.True(await _db.ModuleContentChunks.AnyAsync(chunk => chunk.TrainingModuleId == 10));
    }

    private TrainingModuleResourceService CreateService(IDocumentTextExtractor extractor) => new(
        _db, new TrainingAccessService(_db), _storage, [extractor], Options.Create(_options));

    private Task<TrainingModuleResourceResponse> UploadAsync(string name, string mime, byte[] bytes, TrainingModuleResourceService? service = null)
    {
        var stream = new MemoryStream(bytes);
        IFormFile file = new FormFile(stream, 0, bytes.Length, "file", name) { Headers = new HeaderDictionary(), ContentType = mime };
        return (service ?? _service).UploadAsync(1, 10, new UploadResourceRequest { Title = "Document", File = file }, "admin", Admin);
    }

    public void Dispose() => _db.Dispose();

    private sealed class FakeExtractor(string result) : IDocumentTextExtractor
    {
        public bool CanExtract(TrainingModuleResourceType resourceType) => true;
        public Task<string> ExtractAsync(Stream stream, CancellationToken cancellationToken = default) => Task.FromResult(result);
    }

    private sealed class MemoryStorage : IFileStorageService
    {
        private readonly Dictionary<string, byte[]> _files = [];
        public bool DeleteCalled { get; private set; }
        public async Task<StoredFileResult> SaveAsync(Stream source, string extension, CancellationToken cancellationToken = default)
        {
            using var buffer = new MemoryStream(); await source.CopyToAsync(buffer, cancellationToken); var path = $"test/{Guid.NewGuid():N}{extension}"; _files[path] = buffer.ToArray(); return new(Path.GetFileName(path), path);
        }
        public Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default) => Task.FromResult<Stream>(new MemoryStream(_files[storagePath]));
        public Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default) { DeleteCalled = true; _files.Remove(storagePath); return Task.CompletedTask; }
    }
}


