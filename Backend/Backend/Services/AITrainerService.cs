using Backend.Configurations;
using Backend.Data;
using Backend.DTOs.AITrainer;
using Backend.Entities;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed class AITrainerService : IAITrainerService
{
    private const string NoModuleContentMessage = "Aucun contenu pedagogique exploitable n'est encore disponible pour ce module.";

    private readonly ApplicationDbContext _dbContext;
    private readonly IAITrainerProvider _provider;
    private readonly ITrainingAccessService _accessService;
    private readonly IAIUsageService _usageService;
    private readonly IModuleKnowledgeService _moduleKnowledgeService;
    private readonly AIUsageOptions _usageOptions;

    public AITrainerService(
        ApplicationDbContext dbContext,
        IAITrainerProvider provider,
        ITrainingAccessService accessService,
        IAIUsageService usageService,
        IModuleKnowledgeService moduleKnowledgeService,
        IOptions<AIUsageOptions> usageOptions)
    {
        _dbContext = dbContext;
        _provider = provider;
        _accessService = accessService;
        _usageService = usageService;
        _moduleKnowledgeService = moduleKnowledgeService;
        _usageOptions = usageOptions.Value;
    }

    public async Task<IReadOnlyCollection<AITrainerTrainingOptionResponse>> GetTrainingOptionsAsync(
        string currentUserId,
        IReadOnlyCollection<string> currentUserRoles,
        CancellationToken cancellationToken)
    {
        var canAccessAll = currentUserRoles.Contains(ApplicationRoles.Admin);
        var trainingsQuery = _dbContext.Trainings
            .AsNoTracking()
            .Include(training => training.Enrollments)
            .Include(training => training.Modules.OrderBy(module => module.OrderIndex));
        var trainings = await _accessService.ApplyAccessFilter(trainingsQuery, currentUserId, currentUserRoles)
            .OrderBy(training => training.Title)
            .ToArrayAsync(cancellationToken);

        return trainings
            .Select(training => new AITrainerTrainingOptionResponse(
                training.Id,
                training.Title,
                training.ShortDescription,
                training.Modules
                    .Where(module => canAccessAll || module.IsPublished)
                    .OrderBy(module => module.OrderIndex)
                    .Select(module => new AITrainerModuleOptionResponse(module.Id, module.Title, module.OrderIndex))
                    .ToArray()))
            .ToArray();
    }

    public async Task<AIConversationResponse> CreateConversationAsync(
        CreateAIConversationRequest request,
        string currentUserId,
        IReadOnlyCollection<string> currentUserRoles,
        CancellationToken cancellationToken)
    {
        var training = await _accessService.EnsureTrainingAccessAsync(
            request.TrainingId, currentUserId, currentUserRoles, cancellationToken);
        var module = await _accessService.EnsureModuleAccessAsync(
            training.Id, request.TrainingModuleId, currentUserId, currentUserRoles, cancellationToken);
        var now = DateTime.UtcNow;

        var conversation = new AIConversation
        {
            UserId = currentUserId,
            TrainingId = training.Id,
            TrainingModuleId = module.Id,
            Title = $"{training.Title} - {module.Title}",
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.AIConversations.Add(conversation);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetConversationAsync(conversation.Id, currentUserId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<AIConversationListItemResponse>> GetConversationsAsync(
        string currentUserId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.AIConversations
            .AsNoTracking()
            .Include(conversation => conversation.Training)
            .Include(conversation => conversation.TrainingModule)
            .Where(conversation => conversation.UserId == currentUserId)
            .OrderByDescending(conversation => conversation.UpdatedAt ?? conversation.CreatedAt)
            .Select(conversation => MapToListItem(conversation))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<AIConversationResponse> GetConversationAsync(
        int id,
        string currentUserId,
        CancellationToken cancellationToken)
    {
        var conversation = await FindOwnedConversationAsync(id, currentUserId, cancellationToken);
        return MapToResponse(conversation);
    }

    public async Task<AITrainerAnswerResponse> AskAsync(
        AskAITrainerRequest request,
        string currentUserId,
        IReadOnlyCollection<string> currentUserRoles,
        CancellationToken cancellationToken)
    {
        var question = NormalizeQuestion(request.Question);
        var conversation = await FindOwnedConversationAsync(request.ConversationId, currentUserId, cancellationToken);
        await _accessService.EnsureModuleAccessAsync(
            conversation.TrainingId, conversation.TrainingModuleId, currentUserId, currentUserRoles, cancellationToken);
        await _usageService.EnsureCanAskAsync(currentUserId, currentUserRoles, cancellationToken);
        if (!_usageService.TryBeginRequest(currentUserId))
            throw new TooManyRequestsException("Une question est deja en cours de traitement.");

        try
        {
            var now = DateTime.UtcNow;
            _dbContext.AIMessages.Add(new AIMessage
            {
                ConversationId = conversation.Id,
                Role = AIMessageRoles.User,
                Content = question,
                CreatedAt = now
            });
            conversation.UpdatedAt = now;
            await _dbContext.SaveChangesAsync(cancellationToken);

            var context = await BuildContextAsync(conversation.Id, currentUserRoles, question, cancellationToken);
            var answerText = context.KnowledgeSources.Count == 0
                ? NoModuleContentMessage
                : NormalizeAnswer((await _provider.AskAsync(context, question, cancellationToken)).Answer);
            var answerCreatedAt = DateTime.UtcNow;

            _dbContext.AIMessages.Add(new AIMessage
            {
                ConversationId = conversation.Id,
                Role = AIMessageRoles.Assistant,
                Content = answerText,
                CreatedAt = answerCreatedAt
            });
            conversation.UpdatedAt = answerCreatedAt;
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new AITrainerAnswerResponse(
                conversation.Id,
                answerText,
                context.KnowledgeSources.Count > 0,
                context.KnowledgeSources.Select(source => source.SourceTitle).Distinct().ToArray(),
                answerCreatedAt);
        }
        finally
        {
            _usageService.EndRequest(currentUserId);
        }
    }

    public async Task DeleteConversationAsync(
        int id,
        string currentUserId,
        CancellationToken cancellationToken)
    {
        var conversation = await FindOwnedConversationAsync(id, currentUserId, cancellationToken);
        _dbContext.AIConversations.Remove(conversation);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<AIConversation> FindOwnedConversationAsync(
        int id,
        string currentUserId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.AIConversations
            .Include(conversation => conversation.Training)
            .Include(conversation => conversation.TrainingModule)
            .Include(conversation => conversation.Messages.OrderBy(message => message.CreatedAt))
            .FirstOrDefaultAsync(conversation => conversation.Id == id && conversation.UserId == currentUserId, cancellationToken)
            ?? throw new NotFoundException("AI conversation was not found.");
    }

    private async Task<AITrainerContext> BuildContextAsync(
        int conversationId,
        IReadOnlyCollection<string> currentUserRoles,
        string question,
        CancellationToken cancellationToken)
    {
        var conversation = await _dbContext.AIConversations
            .AsNoTracking()
            .Include(item => item.Training)
            .Include(item => item.TrainingModule)
            .FirstOrDefaultAsync(item => item.Id == conversationId, cancellationToken)
            ?? throw new NotFoundException("AI conversation was not found.");

        var knowledgeSources = await _moduleKnowledgeService.BuildContextAsync(
            conversation.TrainingId,
            conversation.TrainingModuleId,
            currentUserRoles.Contains(ApplicationRoles.Admin),
            question,
            cancellationToken);

        var history = await _dbContext.AIMessages
            .AsNoTracking()
            .Where(message => message.ConversationId == conversation.Id)
            .OrderByDescending(message => message.CreatedAt)
            .Take(Math.Max(1, _usageOptions.HistoryMessagesLimit))
            .OrderBy(message => message.CreatedAt)
            .Select(message => new AIMessageResponse(message.Id, message.Role, message.Content, message.CreatedAt))
            .ToArrayAsync(cancellationToken);

        return new AITrainerContext(
            conversation.TrainingId,
            conversation.Training.Title,
            conversation.Training.Description ?? conversation.Training.ShortDescription,
            conversation.TrainingModuleId,
            conversation.TrainingModule.Title,
            knowledgeSources,
            history);
    }

    private static AIConversationListItemResponse MapToListItem(AIConversation conversation)
    {
        return new AIConversationListItemResponse(
            conversation.Id,
            conversation.TrainingId,
            conversation.Training.Title,
            conversation.TrainingModuleId,
            conversation.TrainingModule.Title,
            conversation.Title ?? conversation.TrainingModule.Title,
            conversation.CreatedAt,
            conversation.UpdatedAt);
    }

    private static AIConversationResponse MapToResponse(AIConversation conversation)
    {
        return new AIConversationResponse(
            conversation.Id,
            conversation.TrainingId,
            conversation.Training.Title,
            conversation.TrainingModuleId,
            conversation.TrainingModule.Title,
            conversation.Title ?? conversation.TrainingModule.Title,
            conversation.CreatedAt,
            conversation.UpdatedAt,
            conversation.Messages
                .OrderBy(message => message.CreatedAt)
                .Select(message => new AIMessageResponse(message.Id, message.Role, message.Content, message.CreatedAt))
                .ToArray());
    }

    private string NormalizeQuestion(string question)
    {
        if (string.IsNullOrWhiteSpace(question))
            throw new InvalidOperationException("La question est obligatoire.");

        var normalized = question.Trim();
        if (normalized.Length > _usageOptions.MaxQuestionLength)
            throw new InvalidOperationException($"La question ne peut pas depasser {_usageOptions.MaxQuestionLength} caracteres.");

        return normalized;
    }

    private static string NormalizeAnswer(string answer)
    {
        if (string.IsNullOrWhiteSpace(answer))
            throw new BadGatewayException("Le fournisseur IA n'a pas retourne de reponse.");

        return answer.Trim();
    }
}
