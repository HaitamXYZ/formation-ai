namespace Backend.DTOs.Auth;

public sealed record UserResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    bool IsActive,
    IReadOnlyCollection<string> Roles);
