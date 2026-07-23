namespace Backend.DTOs.AITrainer;

public sealed record AIMessageResponse(
    int Id,
    string Role,
    string Content,
    DateTime CreatedAt);
