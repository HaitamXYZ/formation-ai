using Backend.DTOs.Enrollments;

namespace Backend.Interfaces;

public interface IEnrollmentService
{
    Task<EnrollmentOperationResult> EnrollAsync(int trainingId, string userId, CancellationToken cancellationToken = default);
    Task CancelAsync(int trainingId, string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<EnrollmentListItemResponse>> GetActiveAsync(string userId, CancellationToken cancellationToken = default);
    Task<LearnerTrainingResponse> GetTrainingAsync(int trainingId, string userId, CancellationToken cancellationToken = default);
    Task<LearnerTrainingModuleResponse> GetModuleAsync(int trainingId, int moduleId, string userId, CancellationToken cancellationToken = default);
    Task<bool> HasActiveEnrollmentAsync(int trainingId, string userId, CancellationToken cancellationToken = default);
    Task UpdateLastAccessedAsync(int trainingId, string userId, CancellationToken cancellationToken = default);
}
