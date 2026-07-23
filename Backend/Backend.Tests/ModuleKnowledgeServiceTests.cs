using Backend.Configurations;
using Backend.Data;
using Backend.Entities;
using Backend.Enums;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Tests;

public sealed class ModuleKnowledgeServiceTests
{
    [Fact]
    public async Task BuildContext_IncludesOnlyActiveReadyResources()
    {
        await using var db = CreateDb();
        Seed(db);
        db.TrainingModuleResources.AddRange(
            Resource(1, "Active", "connaissance alpha", true, TrainingModuleResourceStatus.Ready),
            Resource(2, "Inactive", "secret beta", false, TrainingModuleResourceStatus.Ready),
            Resource(3, "Failed", "secret gamma", true, TrainingModuleResourceStatus.Failed));
        await db.SaveChangesAsync();
        var sources = await Service(db).BuildContextAsync(1, 10, false, "alpha", default);
        Assert.Contains(sources, source => source.SourceTitle == "Active");
        Assert.DoesNotContain(sources, source => source.SourceTitle is "Inactive" or "Failed");
    }

    [Fact]
    public async Task BuildContext_ExcludesUnpublishedModulesForLearner()
    {
        await using var db = CreateDb(); Seed(db); db.TrainingModules.Add(new TrainingModule { Id = 11, TrainingId = 1, Title = "Prive", Content = "secret prive", OrderIndex = 2, IsPublished = false }); await db.SaveChangesAsync();
        var sources = await Service(db).BuildContextAsync(1, null, false, "secret", default);
        Assert.DoesNotContain(sources, source => source.ModuleId == 11);
    }

    [Fact]
    public async Task BuildContext_PrioritizesSelectedModule()
    {
        await using var db = CreateDb(); Seed(db); db.TrainingModules.Add(new TrainingModule { Id = 11, TrainingId = 1, Title = "Autre", Content = "alpha alpha alpha", OrderIndex = 2, IsPublished = true }); await db.SaveChangesAsync();
        var sources = await Service(db).BuildContextAsync(1, 10, false, "alpha", default);
        Assert.True(sources.First().IsPrimary);
    }

    private static ApplicationDbContext CreateDb() => new(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private static ModuleKnowledgeService Service(ApplicationDbContext db) => new(db, Options.Create(new ModuleResourceOptions { MaxSelectedChunks = 8, MaxContextCharacters = 10000, ContextChunkCharacters = 500 }));
    private static void Seed(ApplicationDbContext db) { db.Trainings.Add(new Training { Id = 1, CategoryId = 1, Title = "Formation", Slug = "formation", DurationHours = 1 }); db.TrainingModules.Add(new TrainingModule { Id = 10, TrainingId = 1, Title = "Cible", Content = "contenu cible", OrderIndex = 1, IsPublished = true }); db.SaveChanges(); }
    private static TrainingModuleResource Resource(int id, string title, string text, bool active, TrainingModuleResourceStatus status) => new() { Id = id, TrainingModuleId = 10, Title = title, ResourceType = TrainingModuleResourceType.Text, TextContent = text, ExtractedText = text, IsActive = active, ProcessingStatus = status };
}
