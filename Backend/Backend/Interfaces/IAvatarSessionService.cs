using Backend.DTOs.Avatar;

namespace Backend.Interfaces;

public interface IAvatarSessionService
{
    Task<AvatarSessionResponse> CreateSessionAsync(
        CreateAvatarSessionRequest request,
        string currentUserId,
        IReadOnlyCollection<string> currentUserRoles,
        CancellationToken cancellationToken = default);
}
