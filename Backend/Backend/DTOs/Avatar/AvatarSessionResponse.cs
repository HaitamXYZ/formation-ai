namespace Backend.DTOs.Avatar;

public sealed record AvatarSessionResponse(
    string SessionToken,
    DateTime ExpiresAt,
    string Provider);
