namespace Backend.DTOs.AITrainer;

public sealed record AIUsageSummaryResponse(
    int DailyLimit,
    int UsedToday,
    int RemainingToday,
    DateTime ResetsAtUtc,
    int RequestsPerMinute);
