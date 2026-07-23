using Backend.Enums;

namespace Backend.Entities;

public sealed class Enrollment
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int TrainingId { get; set; }
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastAccessedAt { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public Training Training { get; set; } = null!;
}
