using Backend.DTOs.Common;
using Backend.DTOs.Trainings;

namespace Backend.Interfaces;

public interface ITrainingService
{
    Task<PaginatedResponse<TrainingListItemResponse>> GetAllAsync(TrainingQueryParameters parameters);

    Task<PaginatedResponse<TrainingListItemResponse>> GetCatalogAsync(CatalogTrainingQueryParameters parameters);

    Task<TrainingResponse> GetCatalogByIdAsync(int id);

    Task<TrainingResponse> GetByIdAsync(int id);

    Task<TrainingResponse> GetBySlugAsync(string slug);

    Task<TrainingResponse> CreateAsync(CreateTrainingRequest request);

    Task<TrainingResponse> UpdateAsync(int id, UpdateTrainingRequest request);

    Task<TrainingResponse> UpdateStatusAsync(int id, UpdateTrainingStatusRequest request);

    Task<TrainingResponse> UpdateFeaturedAsync(int id, UpdateTrainingFeaturedRequest request);

    Task DeleteAsync(int id);
}

