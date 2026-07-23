using Backend.DTOs.AITrainer;

namespace Backend.Interfaces;

public interface IAIUsageService
{
    Task<AIUsageSummaryResponse> GetUsageAsync(string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task EnsureCanAskAsync(string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    bool TryBeginRequest(string userId);
    void EndRequest(string userId);
}
