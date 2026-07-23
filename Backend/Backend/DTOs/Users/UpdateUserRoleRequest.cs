namespace Backend.DTOs.Users;

public sealed class UpdateUserRoleRequest
{
    public string Role { get; init; } = string.Empty;

    public bool Assign { get; init; }
}
