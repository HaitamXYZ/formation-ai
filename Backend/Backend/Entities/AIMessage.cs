namespace Backend.Entities;

public sealed class AIMessage
{
    public int Id { get; set; }

    public int ConversationId { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AIConversation Conversation { get; set; } = null!;
}
