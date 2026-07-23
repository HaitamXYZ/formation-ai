using Backend.Models;

namespace Backend.Interfaces;

public interface IAITrainerProvider
{
    Task<AITrainerAnswer> AskAsync(
        AITrainerContext context,
        string question,
        CancellationToken cancellationToken);
}
