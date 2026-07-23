using Backend.Enums;

namespace Backend.Entities;

public sealed class TrainingModuleResource
{
    public int Id { get; set; }
    public int TrainingModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public TrainingModuleResourceType ResourceType { get; set; }
    public string? OriginalFileName { get; set; }
    public string? StoredFileName { get; set; }
    public string? StoragePath { get; set; }
    public string? MimeType { get; set; }
    public long? FileSize { get; set; }
    public string? TextContent { get; set; }
    public string? ExtractedText { get; set; }
    public TrainingModuleResourceStatus ProcessingStatus { get; set; }
    public string? ProcessingError { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public TrainingModule TrainingModule { get; set; } = null!;
}
