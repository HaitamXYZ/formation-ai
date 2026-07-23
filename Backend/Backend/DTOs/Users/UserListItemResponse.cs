namespace Backend.DTOs.Users;

public sealed record UserListItemResponse(
    string Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    bool IsActive,
    IReadOnlyCollection<string> Roles,
    DateTime CreatedAt,
    int AssignedTrainingsCount);
