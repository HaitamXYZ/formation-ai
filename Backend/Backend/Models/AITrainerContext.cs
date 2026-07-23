using Backend.DTOs.AITrainer;

namespace Backend.Models;

public sealed record AITrainerContext(
    int TrainingId,
    string TrainingTitle,
    string? TrainingDescription,
    int? ModuleId,
    string? ModuleTitle,
    IReadOnlyCollection<ModuleKnowledgeSource> KnowledgeSources,
    IReadOnlyCollection<AIMessageResponse> ConversationHistory);
