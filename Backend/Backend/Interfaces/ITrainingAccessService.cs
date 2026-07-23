using Backend.Entities;

namespace Backend.Interfaces;

public interface ITrainingAccessService
{
    IQueryable<Training> ApplyAccessFilter(IQueryable<Training> trainings, string userId, IReadOnlyCollection<string> roles);

    Task<Training> EnsureTrainingAccessAsync(
        int trainingId,
        string userId,
        IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken = default);

    Task<TrainingModule> EnsureModuleAccessAsync(
        int trainingId,
        int moduleId,
        string userId,
        IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken = default);
}
