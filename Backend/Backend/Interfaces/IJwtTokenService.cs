using Backend.Entities;

namespace Backend.Interfaces;

public interface IJwtTokenService
{
    Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(ApplicationUser user);
}
