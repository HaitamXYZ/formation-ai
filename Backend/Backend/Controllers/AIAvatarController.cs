using System.Security.Claims;
using Backend.DTOs.Avatar;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[Route("api/ai-avatar")]
public sealed class AIAvatarController : ControllerBase
{
    private readonly IAvatarSessionService _avatarSessionService;

    public AIAvatarController(IAvatarSessionService avatarSessionService)
    {
        _avatarSessionService = avatarSessionService;
    }

    [HttpPost("session")]
    [ProducesResponseType(typeof(AvatarSessionResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<AvatarSessionResponse>> CreateSession(
        CreateAvatarSessionRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _avatarSessionService.CreateSessionAsync(
            request,
            GetCurrentUserId(),
            GetCurrentUserRoles(),
            cancellationToken));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Authenticated user was not found.");
    }

    private IReadOnlyCollection<string> GetCurrentUserRoles()
    {
        return User.FindAll(ClaimTypes.Role).Select(claim => claim.Value).ToArray();
    }
}
