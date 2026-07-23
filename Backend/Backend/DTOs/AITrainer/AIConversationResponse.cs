namespace Backend.DTOs.AITrainer;

public sealed record AIConversationResponse(
    int Id,
    int TrainingId,
    string TrainingTitle,
    int? TrainingModuleId,
    string? TrainingModuleTitle,
    string Title,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyCollection<AIMessageResponse> Messages);
