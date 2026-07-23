using Backend.Enums;

namespace Backend.DTOs.Trainings;

public sealed class UpdateTrainingStatusRequest
{
    public TrainingStatus Status { get; init; }
}
