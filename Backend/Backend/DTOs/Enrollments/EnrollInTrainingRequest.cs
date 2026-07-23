using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Enrollments;

public sealed class EnrollInTrainingRequest
{
    [Required]
    public int TrainingId { get; init; }
}
