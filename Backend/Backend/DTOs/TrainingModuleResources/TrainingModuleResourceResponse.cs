using Backend.Enums;

namespace Backend.DTOs.TrainingModuleResources;

public sealed record TrainingModuleResourceResponse(
    int Id,
    int TrainingModuleId,
    string Title,
    TrainingModuleResourceType ResourceType,
    string? OriginalFileName,
    string? MimeType,
    long? FileSize,
    string? TextContent,
    string? ExtractedText,
    TrainingModuleResourceStatus ProcessingStatus,
    string? ProcessingError,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
