namespace Backend.DTOs.Users;

public sealed record UserRoleResponse(
    string Id,
    IReadOnlyCollection<string> Roles);
