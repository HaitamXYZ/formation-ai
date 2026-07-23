using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.TrainingModules;

public sealed class CreateTrainingModuleRequest
{
    [Required]
    [MaxLength(150)]
    public string Title { get; init; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; init; }

    [MaxLength(20000)]
    public string? Content { get; init; }

    [MaxLength(1000)]
    [Url]
    public string? VideoUrl { get; init; }

    [MaxLength(1000)]
    [Url]
    public string? DocumentUrl { get; init; }

    [Range(1, 100000)]
    public int? EstimatedDurationMinutes { get; init; }
}
