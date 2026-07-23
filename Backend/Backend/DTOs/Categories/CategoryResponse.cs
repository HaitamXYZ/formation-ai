namespace Backend.DTOs.Categories;

public sealed record CategoryResponse(
    int Id,
    string Name,
    string? Description,
    string? ImageUrl,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
