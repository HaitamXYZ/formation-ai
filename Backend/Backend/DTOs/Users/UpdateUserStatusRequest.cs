namespace Backend.DTOs.Users;

public sealed class UpdateUserStatusRequest
{
    public bool IsActive { get; init; }
}
