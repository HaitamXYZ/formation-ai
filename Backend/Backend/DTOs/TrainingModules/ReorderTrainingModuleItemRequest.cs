using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.TrainingModules;

public sealed class ReorderTrainingModuleItemRequest
{
    [Required]
    public int ModuleId { get; init; }

    [Range(1, int.MaxValue)]
    public int OrderIndex { get; init; }
}
