namespace Backend.Entities;

public sealed class AIConversation
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public int TrainingId { get; set; }

    public int TrainingModuleId { get; set; }

    public string? Title { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public Training Training { get; set; } = null!;

    public TrainingModule TrainingModule { get; set; } = null!;

    public ICollection<AIMessage> Messages { get; set; } = [];
}


