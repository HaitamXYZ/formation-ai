using System.ComponentModel.DataAnnotations;
using Backend.Enums;

namespace Backend.DTOs.Trainings;

public sealed class UpdateTrainingRequest
{
    [Required]
    public int CategoryId { get; init; }

    [Required]
    [MaxLength(150)]
    public string Title { get; init; } = string.Empty;

    [MaxLength(300)]
    public string? ShortDescription { get; init; }

    [MaxLength(5000)]
    public string? Description { get; init; }

    [MaxLength(500)]
    [Url]
    public string? ImageUrl { get; init; }

    [Required]
    public TrainingLevel Level { get; init; } = TrainingLevel.AllLevels;

    [Range(1, 1000)]
    public int DurationHours { get; init; }

    [Range(typeof(decimal), "0", "9999999999999999")]
    public decimal Price { get; init; }

    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string Currency { get; init; } = "EUR";

    public bool IsFeatured { get; init; }
}
