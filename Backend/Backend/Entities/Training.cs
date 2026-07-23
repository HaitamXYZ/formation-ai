using Backend.Enums;

namespace Backend.Entities;

public sealed class Training
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? ShortDescription { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public TrainingLevel Level { get; set; } = TrainingLevel.AllLevels;

    public int DurationHours { get; set; }

    public decimal Price { get; set; }

    public string Currency { get; set; } = "EUR";

    public TrainingStatus Status { get; set; } = TrainingStatus.Draft;

    public bool IsFeatured { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? PublishedAt { get; set; }

    public Category Category { get; set; } = null!;

    public ICollection<TrainingModule> Modules { get; set; } = [];

    public ICollection<Enrollment> Enrollments { get; set; } = [];
}

