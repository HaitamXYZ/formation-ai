namespace Backend.Configurations;

public sealed class AIOptions
{
    public const string SectionName = "AI";

    public string Provider { get; init; } = string.Empty;

    public string ApiKey { get; init; } = string.Empty;

    public string Model { get; init; } = string.Empty;
}
