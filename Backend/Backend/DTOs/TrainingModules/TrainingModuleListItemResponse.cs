namespace Backend.DTOs.TrainingModules;

public sealed record TrainingModuleListItemResponse(
    int Id,
    int TrainingId,
    string Title,
    string? Description,
    string? Content,
    string? VideoUrl,
    string? DocumentUrl,
    int OrderIndex,
    bool IsPublished,
    int? EstimatedDurationMinutes,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
