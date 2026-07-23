using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.TrainingModules;

public sealed class ReorderTrainingModulesRequest
{
    [Required]
    public IReadOnlyCollection<ReorderTrainingModuleItemRequest> Items { get; init; } = [];
}
