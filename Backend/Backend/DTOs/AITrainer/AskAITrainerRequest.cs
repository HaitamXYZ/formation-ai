using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.AITrainer;

public sealed class AskAITrainerRequest
{
    [Required]
    public int ConversationId { get; init; }

    [Required]
    [MaxLength(2000)]
    public string Question { get; init; } = string.Empty;
}
