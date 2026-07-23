using Backend.DTOs.AITrainer;

namespace Backend.Interfaces;

public interface IAITrainerService
{
    Task<IReadOnlyCollection<AITrainerTrainingOptionResponse>> GetTrainingOptionsAsync(
        string currentUserId,
        IReadOnlyCollection<string> currentUserRoles,
        CancellationToken cancellationToken);

    Task<AIConversationResponse> CreateConversationAsync(
        CreateAIConversationRequest request,
        string currentUserId,
        IReadOnlyCollection<string> currentUserRoles,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<AIConversationListItemResponse>> GetConversationsAsync(
        string currentUserId,
        CancellationToken cancellationToken);

    Task<AIConversationResponse> GetConversationAsync(
        int id,
        string currentUserId,
        CancellationToken cancellationToken);

    Task<AITrainerAnswerResponse> AskAsync(
        AskAITrainerRequest request,
        string currentUserId,
        IReadOnlyCollection<string> currentUserRoles,
        CancellationToken cancellationToken);

    Task DeleteConversationAsync(
        int id,
        string currentUserId,
        CancellationToken cancellationToken);
}
