using Backend.Enums;

namespace Backend.DTOs.Trainings;

public sealed record TrainingListItemResponse(
    int Id,
    string Title,
    string Slug,
    string? ShortDescription,
    string? ImageUrl,
    TrainingLevel Level,
    int DurationHours,
    decimal Price,
    string Currency,
    TrainingStatus Status,
    bool IsFeatured,
    int CategoryId,
    string CategoryName,
    DateTime CreatedAt,
    DateTime? PublishedAt);
