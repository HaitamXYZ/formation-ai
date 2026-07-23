namespace Backend.Models;

public sealed record AITrainerAnswer(
    string Answer,
    bool IsGrounded,
    IReadOnlyCollection<string> Sources);
