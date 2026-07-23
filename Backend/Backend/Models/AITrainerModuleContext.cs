namespace Backend.Models;

public sealed record AITrainerModuleContext(
    int ModuleId,
    string Title,
    string? Description,
    string? Content);
