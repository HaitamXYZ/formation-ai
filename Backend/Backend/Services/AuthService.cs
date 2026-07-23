using Backend.DTOs.Auth;
using Backend.Entities;
using Backend.Enums;
using Backend.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(UserManager<ApplicationUser> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            throw new InvalidOperationException("An account already exists for this email address.");
        }

        var user = new ApplicationUser
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            UserName = request.Email.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException(FormatIdentityErrors(createResult));
        }

        var roleResult = await _userManager.AddToRoleAsync(user, ApplicationRoles.Learner);
        if (!roleResult.Succeeded)
        {
            throw new InvalidOperationException(FormatIdentityErrors(roleResult));
        }

        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Votre compte est desactive. Contactez un administrateur.");
        }

        var passwordIsValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordIsValid)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        return await BuildAuthResponseAsync(user);
    }

    public async Task<UserResponse> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new UnauthorizedAccessException("Authenticated user was not found.");

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Votre compte est desactive. Contactez un administrateur.");
        }

        return await MapUserAsync(user);
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(ApplicationUser user)
    {
        var (token, expiresAt) = await _jwtTokenService.GenerateTokenAsync(user);
        return new AuthResponse(token, expiresAt, await MapUserAsync(user));
    }

    private async Task<UserResponse> MapUserAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return new UserResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? string.Empty,
            user.IsActive,
            roles.ToArray());
    }

    private static string FormatIdentityErrors(IdentityResult result)
    {
        return string.Join("; ", result.Errors.Select(error => error.Description));
    }
}
