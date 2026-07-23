using System.Collections.Concurrent;
using Backend.Configurations;
using Backend.Data;
using Backend.DTOs.AITrainer;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed class AIUsageService : IAIUsageService
{
    private static readonly ConcurrentDictionary<string, int> ActiveRequests = new();
    private readonly ApplicationDbContext _dbContext;
    private readonly AIUsageOptions _options;

    public AIUsageService(ApplicationDbContext dbContext, IOptions<AIUsageOptions> options)
    {
        _dbContext = dbContext;
        _options = options.Value;
    }

    public async Task<AIUsageSummaryResponse> GetUsageAsync(
        string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var used = await _dbContext.AIMessages.AsNoTracking().CountAsync(message =>
            message.Role == AIMessageRoles.User &&
            message.CreatedAt >= today && message.CreatedAt < tomorrow &&
            message.Conversation.UserId == userId, cancellationToken);
        var limit = GetDailyLimit(roles);
        return new AIUsageSummaryResponse(
            limit, used, Math.Max(0, limit - used), tomorrow, _options.RequestsPerMinute);
    }

    public async Task EnsureCanAskAsync(
        string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(userId, roles, cancellationToken);
        if (usage.RemainingToday <= 0)
            throw new TooManyRequestsException("Vous avez atteint votre limite quotidienne de questions.");
    }

    public bool TryBeginRequest(string userId)
    {
        var count = ActiveRequests.AddOrUpdate(userId, 1, (_, current) => current + 1);
        if (count <= Math.Max(1, _options.MaxConcurrentRequestsPerUser)) return true;
        EndRequest(userId);
        return false;
    }

    public void EndRequest(string userId)
    {
        ActiveRequests.AddOrUpdate(userId, 0, (_, current) => Math.Max(0, current - 1));
        if (ActiveRequests.TryGetValue(userId, out var count) && count == 0)
            ActiveRequests.TryRemove(userId, out _);
    }

    private int GetDailyLimit(IReadOnlyCollection<string> roles)
    {
        if (roles.Contains(ApplicationRoles.Admin)) return _options.AdminDailyQuestions;
        return _options.LearnerDailyQuestions;
    }
}

