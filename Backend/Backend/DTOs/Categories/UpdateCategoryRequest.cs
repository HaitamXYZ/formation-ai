using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Categories;

public sealed class UpdateCategoryRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; init; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; init; }

    [MaxLength(500)]
    [Url]
    public string? ImageUrl { get; init; }

    public bool IsActive { get; init; } = true;
}
