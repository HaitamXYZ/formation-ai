using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.TrainingModuleResources;

public sealed class UploadResourceRequest
{
    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public IFormFile File { get; set; } = null!;
}
