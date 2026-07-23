using Backend.DTOs.Categories;

namespace Backend.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyCollection<CategoryResponse>> GetAllAsync();

    Task<CategoryResponse> GetByIdAsync(int id);

    Task<CategoryResponse> CreateAsync(CreateCategoryRequest request);

    Task<CategoryResponse> UpdateAsync(int id, UpdateCategoryRequest request);

    Task<CategoryResponse> UpdateStatusAsync(int id, UpdateCategoryStatusRequest request);

    Task DeleteAsync(int id);
}
