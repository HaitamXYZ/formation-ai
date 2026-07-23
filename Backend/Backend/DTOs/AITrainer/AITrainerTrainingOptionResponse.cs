namespace Backend.DTOs.AITrainer;

public sealed record AITrainerTrainingOptionResponse(
    int Id,
    string Title,
    string? ShortDescription,
    IReadOnlyCollection<AITrainerModuleOptionResponse> Modules);
