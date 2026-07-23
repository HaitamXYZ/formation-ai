using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.AITrainer;

public sealed class CreateAIConversationRequest
{
    [Required]
    public int TrainingId { get; init; }

    [Required]
    public int TrainingModuleId { get; init; }
}
