using System.Globalization;
using Backend.Data;
using Backend.DTOs.Categories;
using Backend.Entities;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public sealed class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _dbContext;

    public CategoryService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<CategoryResponse>> GetAllAsync()
    {
        var categories = await _dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToArrayAsync();

        return categories.Select(MapToResponse).ToArray();
    }

    public async Task<CategoryResponse> GetByIdAsync(int id)
    {
        var category = await FindCategoryAsync(id);
        return MapToResponse(category);
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
    {
        var normalizedName = NormalizeName(request.Name);
        await EnsureNameIsUniqueAsync(normalizedName);

        var now = DateTime.UtcNow;
        var category = new Category
        {
            Name = NormalizeDisplayText(request.Name) ?? string.Empty,
            NormalizedName = normalizedName,
            Description = NormalizeOptionalText(request.Description),
            ImageUrl = NormalizeOptionalText(request.ImageUrl),
            IsActive = request.IsActive,
            CreatedAt = now
        };

        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task<CategoryResponse> UpdateAsync(int id, UpdateCategoryRequest request)
    {
        var category = await FindCategoryAsync(id);
        var normalizedName = NormalizeName(request.Name);

        await EnsureNameIsUniqueAsync(normalizedName, id);

        category.Name = NormalizeDisplayText(request.Name) ?? string.Empty;
        category.NormalizedName = normalizedName;
        category.Description = NormalizeOptionalText(request.Description);
        category.ImageUrl = NormalizeOptionalText(request.ImageUrl);
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task<CategoryResponse> UpdateStatusAsync(int id, UpdateCategoryStatusRequest request)
    {
        var category = await FindCategoryAsync(id);

        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task DeleteAsync(int id)
    {
        var category = await FindCategoryAsync(id);

        if (await HasLinkedTrainingsAsync(id))
        {
            throw new ConflictException("Cette categorie ne peut pas etre supprimee car elle contient une ou plusieurs formations.");
        }

        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync();
    }

    private async Task<Category> FindCategoryAsync(int id)
    {
        return await _dbContext.Categories.FirstOrDefaultAsync(category => category.Id == id)
            ?? throw new NotFoundException("Category was not found.");
    }

    private async Task EnsureNameIsUniqueAsync(string normalizedName, int? currentCategoryId = null)
    {
        var exists = await _dbContext.Categories.AnyAsync(category =>
            category.NormalizedName == normalizedName &&
            (!currentCategoryId.HasValue || category.Id != currentCategoryId.Value));

        if (exists)
        {
            throw new ConflictException("A category with the same name already exists.");
        }
    }

    private static CategoryResponse MapToResponse(Category category)
    {
        return new CategoryResponse(
            category.Id,
            category.Name,
            category.Description,
            category.ImageUrl,
            category.IsActive,
            category.CreatedAt,
            category.UpdatedAt);
    }

    private static string NormalizeName(string value)
    {
        var normalized = NormalizeDisplayText(value);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new InvalidOperationException("Category name is required.");
        }

        return normalized.ToUpper(CultureInfo.InvariantCulture);
    }

    private static string? NormalizeDisplayText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return string.Join(' ', value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return NormalizeDisplayText(value);
    }

    private Task<bool> HasLinkedTrainingsAsync(int categoryId)
    {
        return _dbContext.Trainings.AnyAsync(training => training.CategoryId == categoryId);
    }
}
