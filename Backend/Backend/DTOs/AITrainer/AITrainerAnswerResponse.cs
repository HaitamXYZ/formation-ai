namespace Backend.DTOs.AITrainer;

public sealed record AITrainerAnswerResponse(
    int ConversationId,
    string Answer,
    bool IsGrounded,
    IReadOnlyCollection<string> Sources,
    DateTime CreatedAt);
