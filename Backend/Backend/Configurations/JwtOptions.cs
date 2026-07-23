using System.ComponentModel.DataAnnotations;

namespace Backend.Configurations;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    public string Key { get; init; } = string.Empty;

    [Required]
    public string Issuer { get; init; } = "FormationAI";

    [Required]
    public string Audience { get; init; } = "FormationAI.Frontend";

    [Range(1, 1440)]
    public int DurationInMinutes { get; init; } = 60;
}
