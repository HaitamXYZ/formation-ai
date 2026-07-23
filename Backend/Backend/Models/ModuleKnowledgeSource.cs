namespace Backend.Models;

public sealed record ModuleKnowledgeSource(
    int ModuleId,
    string ModuleTitle,
    string SourceTitle,
    string SourceType,
    string Content,
    bool IsPrimary);
