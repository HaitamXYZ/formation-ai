using System.Security.Claims;
using Backend.DTOs.Common;
using Backend.DTOs.Users;
using Backend.Enums;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = ApplicationRoles.Admin)]
[Route("api/admin/users")]
public sealed class AdminUsersController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;

    public AdminUsersController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<UserListItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<UserListItemResponse>>> GetAll([FromQuery] UserQueryParameters parameters)
    {
        return Ok(await _userManagementService.GetUsersAsync(parameters));
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserDetailsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDetailsResponse>> GetById(string id)
    {
        return Ok(await _userManagementService.GetUserDetailsAsync(id));
    }

    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(UserDetailsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDetailsResponse>> UpdateStatus(string id, UpdateUserStatusRequest request)
    {
        return Ok(await _userManagementService.UpdateUserStatusAsync(id, request, GetCurrentUserId()));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Authenticated user was not found.");
    }
}
