using Backend.Data;
using Backend.DTOs.TrainingModules;
using Backend.Entities;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public sealed class TrainingModuleService : ITrainingModuleService
{
    private readonly ApplicationDbContext _dbContext;

    public TrainingModuleService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<TrainingModuleListItemResponse>> GetAllAsync(int trainingId, string currentUserId, bool isAdmin)
    {
        await EnsureCanReadTrainingAsync(trainingId, currentUserId, isAdmin);

        var modules = await _dbContext.TrainingModules
            .AsNoTracking()
            .Where(module => module.TrainingId == trainingId)
            .OrderBy(module => module.OrderIndex)
            .ToArrayAsync();

        return modules.Select(MapToListItem).ToArray();
    }

    public async Task<TrainingModuleResponse> GetByIdAsync(int trainingId, int moduleId, string currentUserId, bool isAdmin)
    {
        await EnsureCanReadTrainingAsync(trainingId, currentUserId, isAdmin);
        return MapToResponse(await FindModuleAsync(trainingId, moduleId));
    }

    public async Task<TrainingModuleResponse> CreateAsync(int trainingId, CreateTrainingModuleRequest request)
    {
        await EnsureTrainingExistsAsync(trainingId);
        var title = NormalizeRequiredText(request.Title, "Module title is required.");
        var now = DateTime.UtcNow;
        var nextOrder = await _dbContext.TrainingModules
            .Where(module => module.TrainingId == trainingId)
            .MaxAsync(module => (int?)module.OrderIndex) ?? 0;

        var module = new TrainingModule
        {
            TrainingId = trainingId,
            Title = title,
            Description = NormalizeOptionalText(request.Description),
            Content = NormalizeOptionalLongText(request.Content),
            VideoUrl = NormalizeOptionalText(request.VideoUrl),
            DocumentUrl = NormalizeOptionalText(request.DocumentUrl),
            OrderIndex = nextOrder + 1,
            IsPublished = false,
            EstimatedDurationMinutes = ValidateDuration(request.EstimatedDurationMinutes),
            CreatedAt = now
        };

        _dbContext.TrainingModules.Add(module);
        await _dbContext.SaveChangesAsync();

        return MapToResponse(await FindModuleAsync(trainingId, module.Id));
    }

    public async Task<TrainingModuleResponse> UpdateAsync(int trainingId, int moduleId, UpdateTrainingModuleRequest request)
    {
        var module = await FindModuleAsync(trainingId, moduleId);

        module.Title = NormalizeRequiredText(request.Title, "Module title is required.");
        module.Description = NormalizeOptionalText(request.Description);
        module.Content = NormalizeOptionalLongText(request.Content);
        module.VideoUrl = NormalizeOptionalText(request.VideoUrl);
        module.DocumentUrl = NormalizeOptionalText(request.DocumentUrl);
        module.EstimatedDurationMinutes = ValidateDuration(request.EstimatedDurationMinutes);
        module.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(await FindModuleAsync(trainingId, moduleId));
    }

    public async Task<TrainingModuleResponse> UpdateStatusAsync(int trainingId, int moduleId, UpdateTrainingModuleStatusRequest request)
    {
        var module = await FindModuleAsync(trainingId, moduleId);

        if (request.IsPublished)
        {
            if (module.Training.Status == TrainingStatus.Archived)
            {
                throw new InvalidOperationException("A module cannot be published when its training is archived.");
            }

            _ = NormalizeRequiredText(module.Title, "Module title is required.");
        }

        module.IsPublished = request.IsPublished;
        module.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(await FindModuleAsync(trainingId, moduleId));
    }

    public async Task<IReadOnlyCollection<TrainingModuleListItemResponse>> ReorderAsync(int trainingId, ReorderTrainingModulesRequest request)
    {
        await EnsureTrainingExistsAsync(trainingId);

        var modules = await _dbContext.TrainingModules
            .Where(module => module.TrainingId == trainingId)
            .OrderBy(module => module.OrderIndex)
            .ToArrayAsync();

        ValidateReorderRequest(modules, request);

        var positions = request.Items.ToDictionary(item => item.ModuleId, item => item.OrderIndex);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        foreach (var module in modules)
        {
            module.OrderIndex = -module.Id;
            module.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();

        foreach (var module in modules)
        {
            module.OrderIndex = positions[module.Id];
            module.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();
        await transaction.CommitAsync();

        return await _dbContext.TrainingModules
            .AsNoTracking()
            .Where(module => module.TrainingId == trainingId)
            .OrderBy(module => module.OrderIndex)
            .Select(module => MapToListItem(module))
            .ToArrayAsync();
    }

    public async Task DeleteAsync(int trainingId, int moduleId)
    {
        var module = await FindModuleAsync(trainingId, moduleId);

        if (await HasBlockingRelationsAsync(module.Id))
        {
            throw new ConflictException("This module cannot be deleted because it is linked to learning content.");
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        _dbContext.TrainingModules.Remove(module);
        await _dbContext.SaveChangesAsync();

        var followingModules = await _dbContext.TrainingModules
            .Where(item => item.TrainingId == trainingId && item.OrderIndex > module.OrderIndex)
            .OrderBy(item => item.OrderIndex)
            .ToArrayAsync();

        foreach (var followingModule in followingModules)
        {
            followingModule.OrderIndex--;
            followingModule.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    private async Task<Training> EnsureCanReadTrainingAsync(int trainingId, string currentUserId, bool isAdmin)
    {
        var training = await _dbContext.Trainings
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == trainingId)
            ?? throw new NotFoundException("Training was not found.");
        return training;
    }

    private async Task EnsureTrainingExistsAsync(int trainingId)
    {
        var exists = await _dbContext.Trainings.AnyAsync(training => training.Id == trainingId);
        if (!exists)
        {
            throw new NotFoundException("Training was not found.");
        }
    }

    private async Task<TrainingModule> FindModuleAsync(int trainingId, int moduleId)
    {
        return await _dbContext.TrainingModules
            .Include(module => module.Training)
            .FirstOrDefaultAsync(module => module.Id == moduleId && module.TrainingId == trainingId)
            ?? throw new NotFoundException("Training module was not found.");
    }

    private static void ValidateReorderRequest(IReadOnlyCollection<TrainingModule> modules, ReorderTrainingModulesRequest request)
    {
        if (request.Items.Count != modules.Count)
        {
            throw new InvalidOperationException("The full module order must be provided.");
        }

        var moduleIds = modules.Select(module => module.Id).ToHashSet();
        var providedIds = request.Items.Select(item => item.ModuleId).ToArray();
        var providedPositions = request.Items.Select(item => item.OrderIndex).ToArray();

        if (providedIds.Length != providedIds.Distinct().Count())
        {
            throw new InvalidOperationException("A module cannot appear more than once in the reorder request.");
        }

        if (providedPositions.Any(position => position < 1) ||
            providedPositions.Length != providedPositions.Distinct().Count())
        {
            throw new InvalidOperationException("Module positions must be positive and unique.");
        }

        if (providedIds.Any(id => !moduleIds.Contains(id)))
        {
            throw new NotFoundException("Training module was not found.");
        }

        var expectedPositions = Enumerable.Range(1, modules.Count).ToArray();
        if (!providedPositions.Order().SequenceEqual(expectedPositions))
        {
            throw new InvalidOperationException("Module positions must be continuous from 1.");
        }
    }

    private static int? ValidateDuration(int? duration)
    {
        if (duration is null)
        {
            return null;
        }

        if (duration < 1 || duration > 100000)
        {
            throw new InvalidOperationException("Estimated duration must be between 1 and 100000 minutes.");
        }

        return duration;
    }

    private static TrainingModuleListItemResponse MapToListItem(TrainingModule module)
    {
        return new TrainingModuleListItemResponse(
            module.Id,
            module.TrainingId,
            module.Title,
            module.Description,
            module.Content,
            module.VideoUrl,
            module.DocumentUrl,
            module.OrderIndex,
            module.IsPublished,
            module.EstimatedDurationMinutes,
            module.CreatedAt,
            module.UpdatedAt);
    }

    private static TrainingModuleResponse MapToResponse(TrainingModule module)
    {
        return new TrainingModuleResponse(
            module.Id,
            module.TrainingId,
            module.Training.Title,
            module.Title,
            module.Description,
            module.Content,
            module.VideoUrl,
            module.DocumentUrl,
            module.OrderIndex,
            module.IsPublished,
            module.EstimatedDurationMinutes,
            module.CreatedAt,
            module.UpdatedAt);
    }

    private static string NormalizeRequiredText(string value, string errorMessage)
    {
        var normalized = NormalizeOptionalText(value);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new InvalidOperationException(errorMessage);
        }

        return normalized;
    }

    private static string? NormalizeOptionalText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return string.Join(' ', value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }

    private static string? NormalizeOptionalLongText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }

    private Task<bool> HasBlockingRelationsAsync(int moduleId) =>
        _dbContext.TrainingModuleResources.AnyAsync(resource => resource.TrainingModuleId == moduleId);
}

