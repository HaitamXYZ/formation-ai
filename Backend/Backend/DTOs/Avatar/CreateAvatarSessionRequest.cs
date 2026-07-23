using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Avatar;

public sealed class CreateAvatarSessionRequest
{
    [Required]
    public int ConversationId { get; init; }
}
