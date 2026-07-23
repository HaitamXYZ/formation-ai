namespace Backend.Entities;

public sealed class TrainingModule
{
    public int Id { get; set; }

    public int TrainingId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Content { get; set; }

    public string? VideoUrl { get; set; }

    public string? DocumentUrl { get; set; }

    public int OrderIndex { get; set; }

    public bool IsPublished { get; set; }

    public int? EstimatedDurationMinutes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public Training Training { get; set; } = null!;

    public ICollection<TrainingModuleResource> Resources { get; set; } = new List<TrainingModuleResource>();
}
