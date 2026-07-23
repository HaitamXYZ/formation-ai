namespace Backend.Entities;

public sealed class ModuleContentChunk
{
    public int Id { get; set; }

    public int TrainingModuleResourceId { get; set; }

    public int TrainingModuleId { get; set; }

    public int ChunkIndex { get; set; }

    public string Content { get; set; } = string.Empty;

    public int CharacterCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public TrainingModuleResource TrainingModuleResource { get; set; } = null!;

    public TrainingModule TrainingModule { get; set; } = null!;
}
