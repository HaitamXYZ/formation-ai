using Backend.DTOs.Auth;

namespace Backend.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);

    Task<AuthResponse> LoginAsync(LoginRequest request);

    Task<UserResponse> GetCurrentUserAsync(string userId);
}
