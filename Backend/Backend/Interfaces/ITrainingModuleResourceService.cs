using Backend.DTOs.TrainingModuleResources;

namespace Backend.Interfaces;

public interface ITrainingModuleResourceService
{
    Task<IReadOnlyCollection<TrainingModuleResourceResponse>> GetAllAsync(int trainingId, int moduleId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task<TrainingModuleResourceResponse> GetByIdAsync(int trainingId, int moduleId, int resourceId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task<TrainingModuleResourceResponse> CreateTextAsync(int trainingId, int moduleId, CreateTextResourceRequest request, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task<TrainingModuleResourceResponse> UploadAsync(int trainingId, int moduleId, UploadResourceRequest request, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task<TrainingModuleResourceResponse> UpdateStatusAsync(int trainingId, int moduleId, int resourceId, UpdateResourceStatusRequest request, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task<TrainingModuleResourceResponse> ReprocessAsync(int trainingId, int moduleId, int resourceId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task DeleteAsync(int trainingId, int moduleId, int resourceId, string userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
}
