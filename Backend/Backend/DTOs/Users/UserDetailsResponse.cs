namespace Backend.DTOs.Users;

public sealed record UserDetailsResponse(
    string Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    bool IsActive,
    IReadOnlyCollection<string> Roles,
    DateTime CreatedAt,
    IReadOnlyCollection<AssignedTrainingResponse> AssignedTrainings);
