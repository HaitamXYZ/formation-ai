using Backend.Data;
using Backend.Entities;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public sealed class TrainingAccessService : ITrainingAccessService
{
    private readonly ApplicationDbContext _dbContext;

    public TrainingAccessService(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public IQueryable<Training> ApplyAccessFilter(
        IQueryable<Training> trainings,
        string userId,
        IReadOnlyCollection<string> roles)
    {
        if (roles.Contains(ApplicationRoles.Admin)) return trainings;

        if (roles.Contains(ApplicationRoles.Learner))
            return trainings.Where(training =>
                training.Status == TrainingStatus.Published &&
                training.Enrollments.Any(enrollment =>
                    enrollment.UserId == userId && enrollment.Status == EnrollmentStatus.Active));

        return trainings.Where(_ => false);
    }

    public async Task<Training> EnsureTrainingAccessAsync(
        int trainingId, string userId, IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken = default)
    {
        var query = ApplyAccessFilter(_dbContext.Trainings.AsNoTracking(), userId, roles);
        var training = await query.FirstOrDefaultAsync(item => item.Id == trainingId, cancellationToken);
        if (training is not null) return training;
        var exists = await _dbContext.Trainings.AnyAsync(item => item.Id == trainingId, cancellationToken);
        if (!exists) throw new NotFoundException("Training was not found.");
        throw new ForbiddenException("Vous ne pouvez pas acceder a cette formation.");
    }

    public async Task<TrainingModule> EnsureModuleAccessAsync(
        int trainingId, int moduleId, string userId, IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken = default)
    {
        await EnsureTrainingAccessAsync(trainingId, userId, roles, cancellationToken);
        var module = await _dbContext.TrainingModules.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == moduleId && item.TrainingId == trainingId, cancellationToken);
        if (module is null) throw new NotFoundException("Training module was not found.");
        if (!roles.Contains(ApplicationRoles.Admin) && roles.Contains(ApplicationRoles.Learner) && !module.IsPublished)
            throw new ForbiddenException("Vous ne pouvez pas acceder a ce module.");
        return module;
    }
}

