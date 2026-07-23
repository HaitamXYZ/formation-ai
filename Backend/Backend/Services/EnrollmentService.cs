using Backend.Data;
using Backend.DTOs.Enrollments;
using Backend.Entities;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public sealed class EnrollmentService : IEnrollmentService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;

    public EnrollmentService(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    public async Task<EnrollmentOperationResult> EnrollAsync(
        int trainingId, string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null || !user.IsActive) throw new ForbiddenException(nameof(ApplicationUser));
        if (!await _userManager.IsInRoleAsync(user, ApplicationRoles.Learner))
            throw new ForbiddenException(nameof(ApplicationRoles.Learner));

        var training = await _dbContext.Trainings.FindAsync([trainingId], cancellationToken);
        if (training is null) throw new NotFoundException(nameof(Training));
        if (training.Status != TrainingStatus.Published)
            throw new ConflictException(nameof(TrainingStatus.Published));

        var existing = await _dbContext.Enrollments
            .FirstOrDefaultAsync(item => item.UserId == userId && item.TrainingId == trainingId, cancellationToken);
        if (existing?.Status == EnrollmentStatus.Active)
            throw new ConflictException(nameof(EnrollmentStatus.Active));

        var now = DateTime.UtcNow;
        var reactivated = existing is not null;
        var enrollment = existing ?? new Enrollment { UserId = userId, TrainingId = trainingId, EnrolledAt = now };
        enrollment.Status = EnrollmentStatus.Active;
        enrollment.UpdatedAt = reactivated ? now : null;
        if (!reactivated) _dbContext.Enrollments.Add(enrollment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new EnrollmentOperationResult(MapEnrollment(enrollment), reactivated);
    }

    public async Task CancelAsync(int trainingId, string userId, CancellationToken cancellationToken = default)
    {
        var enrollment = await _dbContext.Enrollments.FirstOrDefaultAsync(
            item => item.UserId == userId && item.TrainingId == trainingId,
            cancellationToken);
        if (enrollment is null || enrollment.Status != EnrollmentStatus.Active)
            throw new NotFoundException(nameof(Enrollment));

        enrollment.Status = EnrollmentStatus.Cancelled;
        enrollment.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<EnrollmentListItemResponse>> GetActiveAsync(
        string userId, CancellationToken cancellationToken = default)
    {
        var items = await _dbContext.Enrollments.AsNoTracking()
            .Include(item => item.Training).ThenInclude(training => training.Category)
            .Include(item => item.Training).ThenInclude(training => training.Modules)
            .Where(item => item.UserId == userId && item.Status == EnrollmentStatus.Active)
            .OrderByDescending(item => item.LastAccessedAt ?? item.EnrolledAt)
            .ToArrayAsync(cancellationToken);
        return items.Select(MapListItem).ToArray();
    }

    public async Task<LearnerTrainingResponse> GetTrainingAsync(
        int trainingId, string userId, CancellationToken cancellationToken = default)
    {
        var enrollment = await _dbContext.Enrollments
            .Include(item => item.Training).ThenInclude(training => training.Category)
            .Include(item => item.Training).ThenInclude(training => training.Modules)
            .FirstOrDefaultAsync(item => item.TrainingId == trainingId && item.UserId == userId &&
                item.Status == EnrollmentStatus.Active, cancellationToken);
        if (enrollment is null || enrollment.Training.Status != TrainingStatus.Published)
            throw new ForbiddenException(nameof(Enrollment));

        enrollment.LastAccessedAt = DateTime.UtcNow;
        enrollment.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapTraining(enrollment);
    }

    public async Task<LearnerTrainingModuleResponse> GetModuleAsync(
        int trainingId, int moduleId, string userId, CancellationToken cancellationToken = default)
    {
        var training = await GetTrainingAsync(trainingId, userId, cancellationToken);
        var module = training.Modules.FirstOrDefault(item => item.Id == moduleId);
        if (module is null) throw new NotFoundException(nameof(TrainingModule));
        return module;
    }

    public Task<bool> HasActiveEnrollmentAsync(
        int trainingId, string userId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Enrollments.AnyAsync(item =>
            item.TrainingId == trainingId && item.UserId == userId &&
            item.Status == EnrollmentStatus.Active, cancellationToken);
    }

    public async Task UpdateLastAccessedAsync(
        int trainingId, string userId, CancellationToken cancellationToken = default)
    {
        var enrollment = await _dbContext.Enrollments.FirstOrDefaultAsync(item =>
            item.TrainingId == trainingId && item.UserId == userId &&
            item.Status == EnrollmentStatus.Active, cancellationToken);
        if (enrollment is null) throw new ForbiddenException(nameof(Enrollment));
        enrollment.LastAccessedAt = DateTime.UtcNow;
        enrollment.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static EnrollmentListItemResponse MapListItem(Enrollment item) => new(
        item.Id,
        item.TrainingId,
        item.Training.Title,
        item.Training.Slug,
        item.Training.ImageUrl,
        item.Training.Category.Name,
        item.Training.Level,
        item.Training.DurationHours,
        item.Status,
        item.EnrolledAt,
        item.LastAccessedAt,
        item.Training.Modules.Count(module => module.IsPublished));

    private static LearnerTrainingResponse MapTraining(Enrollment item)
    {
        var training = item.Training;
        return new LearnerTrainingResponse(
            training.Id,
            training.Title,
            training.Slug,
            training.Description,
            training.ShortDescription,
            training.ImageUrl,
            training.Category.Name,
            training.Level,
            training.DurationHours,
            training.Modules.Where(module => module.IsPublished)
                .OrderBy(module => module.OrderIndex)
                .Select(MapModule).ToArray(),
            MapEnrollment(item));
    }

    private static LearnerTrainingModuleResponse MapModule(TrainingModule module) => new(
        module.Id,
        module.Title,
        module.Description,
        module.Content,
        module.VideoUrl,
        module.DocumentUrl,
        module.OrderIndex,
        module.EstimatedDurationMinutes,
        module.IsPublished);

    private static EnrollmentResponse MapEnrollment(Enrollment enrollment) => new(
        enrollment.Id,
        enrollment.TrainingId,
        enrollment.Status,
        enrollment.EnrolledAt,
        enrollment.UpdatedAt,
        enrollment.LastAccessedAt);
}

