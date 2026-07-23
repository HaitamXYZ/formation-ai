namespace Backend.DTOs.Users;

public sealed record TrainerDetailsResponse(
    string Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    bool IsActive,
    DateTime CreatedAt,
    int AssignedTrainingsCount,
    IReadOnlyCollection<AssignedTrainingResponse> AssignedTrainings);
