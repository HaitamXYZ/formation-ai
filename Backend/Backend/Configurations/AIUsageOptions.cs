namespace Backend.Configurations;

public sealed class AIUsageOptions
{
    public const string SectionName = "AIUsage";
    public int LearnerDailyQuestions { get; init; } = 30;
    public int AdminDailyQuestions { get; init; } = 200;
    public int RequestsPerMinute { get; init; } = 6;
    public int MaxConcurrentRequestsPerUser { get; init; } = 1;
    public int MaxQuestionLength { get; init; } = 2000;
    public int HistoryMessagesLimit { get; init; } = 12;
}

