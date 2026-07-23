using Backend.Enums;

namespace Backend.DTOs.Users;

public sealed record AssignedTrainingResponse(
    int Id,
    string Title,
    string Slug,
    TrainingStatus Status,
    string CategoryName);
