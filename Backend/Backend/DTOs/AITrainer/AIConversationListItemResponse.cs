namespace Backend.DTOs.AITrainer;

public sealed record AIConversationListItemResponse(
    int Id,
    int TrainingId,
    string TrainingTitle,
    int? TrainingModuleId,
    string? TrainingModuleTitle,
    string Title,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
