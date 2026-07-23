namespace Backend.Configurations;

public sealed class AnamOptions
{
    public const string SectionName = "Anam";

    public string ApiKey { get; init; } = string.Empty;

    public string AvatarId { get; init; } = string.Empty;

    public string AvatarModel { get; init; } = string.Empty;

    public string VoiceId { get; init; } = string.Empty;

    public string PersonaName { get; init; } = "Formateur FormationAI";

    public string SessionTokenEndpoint { get; init; } = "https://api.anam.ai/v1/auth/session-token";

    public int RequestTimeoutSeconds { get; init; } = 20;
}
