using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.TrainingModuleResources;

public sealed class CreateTextResourceRequest
{
    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string TextContent { get; set; } = string.Empty;
}
