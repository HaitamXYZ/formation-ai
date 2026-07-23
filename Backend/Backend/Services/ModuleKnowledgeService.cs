using System.Text.RegularExpressions;
using Backend.Configurations;
using Backend.Data;
using Backend.Enums;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed partial class ModuleKnowledgeService : IModuleKnowledgeService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ModuleResourceOptions _options;

    public ModuleKnowledgeService(ApplicationDbContext dbContext, IOptions<ModuleResourceOptions> options)
    {
        _dbContext = dbContext;
        _options = options.Value;
    }

    public async Task<IReadOnlyCollection<ModuleKnowledgeSource>> BuildContextAsync(
        int trainingId, int? selectedModuleId, bool canAccessUnpublishedModules, string question, CancellationToken cancellationToken = default)
    {
        if (!selectedModuleId.HasValue)
        {
            return Array.Empty<ModuleKnowledgeSource>();
        }

        var module = await _dbContext.TrainingModules.AsNoTracking()
            .FirstOrDefaultAsync(item =>
                item.Id == selectedModuleId.Value &&
                item.TrainingId == trainingId &&
                (canAccessUnpublishedModules || item.IsPublished), cancellationToken);
        if (module is null)
        {
            return Array.Empty<ModuleKnowledgeSource>();
        }

        var terms = Tokenize(question);
        var chunks = await _dbContext.ModuleContentChunks.AsNoTracking()
            .Include(chunk => chunk.TrainingModuleResource)
            .Where(chunk =>
                chunk.TrainingModuleId == module.Id &&
                chunk.TrainingModuleResource.IsActive &&
                chunk.TrainingModuleResource.ProcessingStatus == TrainingModuleResourceStatus.Ready)
            .ToArrayAsync(cancellationToken);

        var selected = chunks
            .Select(chunk => new
            {
                Chunk = chunk,
                Score = Score(chunk.Content, terms)
            })
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.Chunk.TrainingModuleResourceId)
            .ThenBy(item => item.Chunk.ChunkIndex)
            .Take(Math.Max(1, _options.MaxSelectedChunks));

        var result = new List<ModuleKnowledgeSource>();
        var usedCharacters = 0;
        foreach (var item in selected)
        {
            if (usedCharacters + item.Chunk.Content.Length > _options.MaxContextCharacters) continue;
            result.Add(new ModuleKnowledgeSource(
                module.Id,
                module.Title,
                item.Chunk.TrainingModuleResource.Title,
                item.Chunk.TrainingModuleResource.ResourceType.ToString(),
                item.Chunk.Content,
                true));
            usedCharacters += item.Chunk.Content.Length;
        }

        return result;
    }

    private static int Score(string content, HashSet<string> terms)
    {
        if (terms.Count == 0) return 1;
        var normalized = content.ToLowerInvariant();
        return terms.Sum(term => CountOccurrences(normalized, term));
    }

    private static HashSet<string> Tokenize(string text) => WordRegex().Matches(text.ToLowerInvariant())
        .Select(match => match.Value)
        .Where(word => word.Length >= 3)
        .ToHashSet(StringComparer.Ordinal);

    private static int CountOccurrences(string value, string term)
    {
        var count = 0;
        var index = 0;
        while ((index = value.IndexOf(term, index, StringComparison.Ordinal)) >= 0)
        {
            count++;
            index += term.Length;
        }
        return count;
    }

    [GeneratedRegex(@"[\p{L}\p{N}]+")]
    private static partial Regex WordRegex();
}
