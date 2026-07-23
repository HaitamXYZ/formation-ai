using Backend.DTOs.TrainingModules;

namespace Backend.Interfaces;

public interface ITrainingModuleService
{
    Task<IReadOnlyCollection<TrainingModuleListItemResponse>> GetAllAsync(int trainingId, string currentUserId, bool isAdmin);

    Task<TrainingModuleResponse> GetByIdAsync(int trainingId, int moduleId, string currentUserId, bool isAdmin);

    Task<TrainingModuleResponse> CreateAsync(int trainingId, CreateTrainingModuleRequest request);

    Task<TrainingModuleResponse> UpdateAsync(int trainingId, int moduleId, UpdateTrainingModuleRequest request);

    Task<TrainingModuleResponse> UpdateStatusAsync(int trainingId, int moduleId, UpdateTrainingModuleStatusRequest request);

    Task<IReadOnlyCollection<TrainingModuleListItemResponse>> ReorderAsync(int trainingId, ReorderTrainingModulesRequest request);

    Task DeleteAsync(int trainingId, int moduleId);
}
