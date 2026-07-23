using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.Trainings;
using Backend.Entities;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public sealed partial class TrainingService : ITrainingService
{
    private readonly ApplicationDbContext _dbContext;

    public TrainingService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PaginatedResponse<TrainingListItemResponse>> GetAllAsync(TrainingQueryParameters parameters)
    {
        var query = ApplyFilters(_dbContext.Trainings.AsNoTracking().Include(training => training.Category), parameters);
        var totalItems = await query.CountAsync();
        var items = await ApplySorting(query, parameters)
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToArrayAsync();
        var totalPages = totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (double)parameters.PageSize);

        return new PaginatedResponse<TrainingListItemResponse>(
            items.Select(MapToListItem).ToArray(),
            parameters.Page,
            parameters.PageSize,
            totalItems,
            totalPages);
    }

    public async Task<PaginatedResponse<TrainingListItemResponse>> GetCatalogAsync(CatalogTrainingQueryParameters parameters)
    {
        var query = _dbContext.Trainings.AsNoTracking()
            .Include(training => training.Category)
            .Where(training => training.Status == TrainingStatus.Published);

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim();
            query = query.Where(training => training.Title.Contains(search) ||
                (training.ShortDescription != null && training.ShortDescription.Contains(search)));
        }

        if (parameters.CategoryId.HasValue)
            query = query.Where(training => training.CategoryId == parameters.CategoryId.Value);
        if (parameters.Level.HasValue)
            query = query.Where(training => training.Level == parameters.Level.Value);

        var totalItems = await query.CountAsync();
        var descending = string.Equals(parameters.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        query = parameters.SortBy?.ToLowerInvariant() switch
        {
            "title" => descending ? query.OrderByDescending(item => item.Title) : query.OrderBy(item => item.Title),
            "price" => descending ? query.OrderByDescending(item => item.Price) : query.OrderBy(item => item.Price),
            "duration" => descending ? query.OrderByDescending(item => item.DurationHours) : query.OrderBy(item => item.DurationHours),
            _ => descending ? query.OrderByDescending(item => item.PublishedAt) : query.OrderBy(item => item.PublishedAt)
        };

        var items = await query.Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToArrayAsync();
        var totalPages = totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (double)parameters.PageSize);

        return new PaginatedResponse<TrainingListItemResponse>(
            items.Select(MapToListItem).ToArray(),
            parameters.Page,
            parameters.PageSize,
            totalItems,
            totalPages);
    }

    public async Task<TrainingResponse> GetCatalogByIdAsync(int id)
    {
        var training = await FindTrainingAsync(id);
        if (training.Status != TrainingStatus.Published)
            throw new NotFoundException(nameof(Training));
        return MapToResponse(training);
    }

    public async Task<TrainingResponse> GetByIdAsync(int id) => MapToResponse(await FindTrainingAsync(id));

    public async Task<TrainingResponse> GetBySlugAsync(string slug)
    {
        var training = await _dbContext.Trainings
            .Include(item => item.Category)
            .Include(item => item.Modules)
            .FirstOrDefaultAsync(item => item.Slug == slug)
            ?? throw new NotFoundException("Training was not found.");

        return MapToResponse(training);
    }

    public async Task<TrainingResponse> CreateAsync(CreateTrainingRequest request)
    {
        await EnsureCategoryExistsAsync(request.CategoryId);
        var title = NormalizeRequiredText(request.Title, "Training title is required.");
        var now = DateTime.UtcNow;

        var training = new Training
        {
            CategoryId = request.CategoryId,
            Title = title,
            Slug = await GenerateUniqueSlugAsync(title),
            ShortDescription = NormalizeOptionalText(request.ShortDescription),
            Description = NormalizeOptionalText(request.Description),
            ImageUrl = NormalizeOptionalText(request.ImageUrl),
            Level = request.Level,
            DurationHours = request.DurationHours,
            Price = request.Price,
            Currency = NormalizeCurrency(request.Currency),
            Status = TrainingStatus.Draft,
            IsFeatured = request.IsFeatured,
            CreatedAt = now
        };

        _dbContext.Trainings.Add(training);
        await _dbContext.SaveChangesAsync();

        return MapToResponse(await FindTrainingAsync(training.Id));
    }

    public async Task<TrainingResponse> UpdateAsync(int id, UpdateTrainingRequest request)
    {
        var training = await FindTrainingAsync(id);
        await EnsureCategoryExistsAsync(request.CategoryId);
        var title = NormalizeRequiredText(request.Title, "Training title is required.");

        if (!string.Equals(training.Title, title, StringComparison.Ordinal))
            training.Slug = await GenerateUniqueSlugAsync(title, training.Id);

        training.CategoryId = request.CategoryId;
        training.Title = title;
        training.ShortDescription = NormalizeOptionalText(request.ShortDescription);
        training.Description = NormalizeOptionalText(request.Description);
        training.ImageUrl = NormalizeOptionalText(request.ImageUrl);
        training.Level = request.Level;
        training.DurationHours = request.DurationHours;
        training.Price = request.Price;
        training.Currency = NormalizeCurrency(request.Currency);
        training.IsFeatured = request.IsFeatured;
        training.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(await FindTrainingAsync(training.Id));
    }

    public async Task<TrainingResponse> UpdateStatusAsync(int id, UpdateTrainingStatusRequest request)
    {
        var training = await FindTrainingAsync(id);

        if (!IsAllowedTransition(training.Status, request.Status))
            throw new InvalidOperationException("This training status transition is not allowed.");

        if (request.Status == TrainingStatus.Published)
        {
            ValidatePublishable(training);
            training.PublishedAt ??= DateTime.UtcNow;
        }

        training.Status = request.Status;
        training.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return MapToResponse(await FindTrainingAsync(training.Id));
    }

    public async Task<TrainingResponse> UpdateFeaturedAsync(int id, UpdateTrainingFeaturedRequest request)
    {
        var training = await FindTrainingAsync(id);
        training.IsFeatured = request.IsFeatured;
        training.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return MapToResponse(await FindTrainingAsync(training.Id));
    }

    public async Task DeleteAsync(int id)
    {
        var training = await FindTrainingAsync(id);

        if (await _dbContext.Enrollments.AnyAsync(enrollment => enrollment.TrainingId == id))
            throw new ConflictException("Cette formation ne peut pas etre supprimee car des apprenants y ont deja ete inscrits.");

        if (await HasBlockingRelationsAsync(id))
            throw new ConflictException("Cette formation ne peut pas etre supprimee car elle contient un ou plusieurs modules.");

        _dbContext.Trainings.Remove(training);
        await _dbContext.SaveChangesAsync();
    }

    private IQueryable<Training> ApplyFilters(IQueryable<Training> query, TrainingQueryParameters parameters)
    {
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim();
            query = query.Where(training =>
                training.Title.Contains(search) ||
                (training.ShortDescription != null && training.ShortDescription.Contains(search)));
        }

        if (parameters.CategoryId.HasValue)
            query = query.Where(training => training.CategoryId == parameters.CategoryId.Value);
        if (parameters.Status.HasValue)
            query = query.Where(training => training.Status == parameters.Status.Value);
        if (parameters.Level.HasValue)
            query = query.Where(training => training.Level == parameters.Level.Value);
        if (parameters.IsFeatured.HasValue)
            query = query.Where(training => training.IsFeatured == parameters.IsFeatured.Value);

        return query;
    }

    private static IQueryable<Training> ApplySorting(IQueryable<Training> query, TrainingQueryParameters parameters)
    {
        var descending = string.Equals(parameters.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        return parameters.SortBy?.ToLowerInvariant() switch
        {
            "title" => descending ? query.OrderByDescending(training => training.Title) : query.OrderBy(training => training.Title),
            "price" => descending ? query.OrderByDescending(training => training.Price) : query.OrderBy(training => training.Price),
            "duration" => descending ? query.OrderByDescending(training => training.DurationHours) : query.OrderBy(training => training.DurationHours),
            "status" => descending ? query.OrderByDescending(training => training.Status) : query.OrderBy(training => training.Status),
            _ => descending ? query.OrderByDescending(training => training.CreatedAt) : query.OrderBy(training => training.CreatedAt)
        };
    }

    private async Task<Training> FindTrainingAsync(int id)
    {
        return await _dbContext.Trainings
            .Include(item => item.Category)
            .Include(item => item.Modules)
            .FirstOrDefaultAsync(item => item.Id == id)
            ?? throw new NotFoundException("Training was not found.");
    }

    private async Task EnsureCategoryExistsAsync(int categoryId)
    {
        var exists = await _dbContext.Categories.AnyAsync(category => category.Id == categoryId);
        if (!exists)
            throw new NotFoundException("Category was not found.");
    }

    private async Task<string> GenerateUniqueSlugAsync(string title, int? currentTrainingId = null)
    {
        var baseSlug = CreateSlug(title);
        var slug = baseSlug;
        var suffix = 2;

        while (await _dbContext.Trainings.AnyAsync(training =>
            training.Slug == slug &&
            (!currentTrainingId.HasValue || training.Id != currentTrainingId.Value)))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }

        return slug;
    }

    public static string CreateSlug(string value)
    {
        var normalized = NormalizeRequiredText(value, "Training title is required.")
            .ToLowerInvariant()
            .Normalize(NormalizationForm.FormD);

        var builder = new StringBuilder();
        foreach (var character in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(character);
            if (category != UnicodeCategory.NonSpacingMark)
                builder.Append(character);
        }

        var slug = NonSlugCharactersRegex().Replace(builder.ToString().Normalize(NormalizationForm.FormC), "-");
        slug = MultipleDashesRegex().Replace(slug, "-").Trim('-');

        return string.IsNullOrWhiteSpace(slug) ? "formation" : slug;
    }

    private static void ValidatePublishable(Training training)
    {
        if (training.CategoryId <= 0 ||
            string.IsNullOrWhiteSpace(training.Title) ||
            training.DurationHours < 1 ||
            string.IsNullOrWhiteSpace(training.Currency))
        {
            throw new InvalidOperationException("Training is incomplete and cannot be published.");
        }
    }

    private static bool IsAllowedTransition(TrainingStatus current, TrainingStatus next)
    {
        if (current == next)
            return true;

        return current switch
        {
            TrainingStatus.Draft => next is TrainingStatus.Published or TrainingStatus.Archived,
            TrainingStatus.Published => next is TrainingStatus.Draft or TrainingStatus.Archived,
            TrainingStatus.Archived => next is TrainingStatus.Draft,
            _ => false
        };
    }

    private static TrainingListItemResponse MapToListItem(Training training)
    {
        return new TrainingListItemResponse(
            training.Id,
            training.Title,
            training.Slug,
            training.ShortDescription,
            training.ImageUrl,
            training.Level,
            training.DurationHours,
            training.Price,
            training.Currency,
            training.Status,
            training.IsFeatured,
            training.CategoryId,
            training.Category.Name,
            training.CreatedAt,
            training.PublishedAt);
    }

    private static TrainingResponse MapToResponse(Training training)
    {
        return new TrainingResponse(
            training.Id,
            training.CategoryId,
            training.Category.Name,
            training.Title,
            training.Slug,
            training.ShortDescription,
            training.Description,
            training.ImageUrl,
            training.Level,
            training.DurationHours,
            training.Price,
            training.Currency,
            training.Status,
            training.IsFeatured,
            training.Modules.Count,
            training.Modules.Count(module => module.IsPublished),
            training.CreatedAt,
            training.UpdatedAt,
            training.PublishedAt);
    }

    private static string NormalizeRequiredText(string value, string errorMessage)
    {
        var normalized = NormalizeOptionalText(value);
        if (string.IsNullOrWhiteSpace(normalized))
            throw new InvalidOperationException(errorMessage);

        return normalized;
    }

    private static string? NormalizeOptionalText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return string.Join(' ', value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }

    private static string NormalizeCurrency(string value)
    {
        var currency = NormalizeRequiredText(value, "Currency is required.").ToUpperInvariant();
        if (currency.Length != 3)
            throw new InvalidOperationException("Currency must contain exactly three characters.");

        return currency;
    }

    private Task<bool> HasBlockingRelationsAsync(int trainingId)
    {
        return _dbContext.TrainingModules.AnyAsync(module => module.TrainingId == trainingId);
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonSlugCharactersRegex();

    [GeneratedRegex("-+")]
    private static partial Regex MultipleDashesRegex();
}
