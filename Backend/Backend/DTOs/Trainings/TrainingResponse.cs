using Backend.Enums;

namespace Backend.DTOs.Trainings;

public sealed record TrainingResponse(
    int Id,
    int CategoryId,
    string CategoryName,
    string Title,
    string Slug,
    string? ShortDescription,
    string? Description,
    string? ImageUrl,
    TrainingLevel Level,
    int DurationHours,
    decimal Price,
    string Currency,
    TrainingStatus Status,
    bool IsFeatured,
    int ModulesCount,
    int PublishedModulesCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    DateTime? PublishedAt);
