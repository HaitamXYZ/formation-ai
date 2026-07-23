using System.Diagnostics;
using System.Net;
using System.Text.Json.Serialization;
using Backend.Configurations;
using Backend.Data;
using Backend.DTOs.Avatar;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed class AnamAvatarSessionService : IAvatarSessionService
{
    private const string CustomClientLlmId = "CUSTOMER_CLIENT_V1";
    private readonly HttpClient _httpClient;
    private readonly ApplicationDbContext _dbContext;
    private readonly AnamOptions _options;
    private readonly ILogger<AnamAvatarSessionService> _logger;
    private readonly ITrainingAccessService _accessService;
    private readonly IAIUsageService _usageService;

    public AnamAvatarSessionService(
        HttpClient httpClient,
        ApplicationDbContext dbContext,
        IOptions<AnamOptions> options,
        ILogger<AnamAvatarSessionService> logger,
        ITrainingAccessService accessService,
        IAIUsageService usageService)
    {
        _httpClient = httpClient;
        _dbContext = dbContext;
        _options = options.Value;
        _logger = logger;
        _accessService = accessService;
        _usageService = usageService;
    }

    public async Task<AvatarSessionResponse> CreateSessionAsync(
        CreateAvatarSessionRequest request,
        string currentUserId,
        IReadOnlyCollection<string> currentUserRoles,
        CancellationToken cancellationToken)
    {
        ValidateConfiguration();

        var conversation = await _dbContext.AIConversations
            .AsNoTracking()
            .Include(item => item.Training)
            .Include(item => item.TrainingModule)
            .FirstOrDefaultAsync(item => item.Id == request.ConversationId && item.UserId == currentUserId, cancellationToken)
            ?? throw new NotFoundException("AI conversation was not found.");

        await _accessService.EnsureModuleAccessAsync(
            conversation.TrainingId,
            conversation.TrainingModuleId,
            currentUserId,
            currentUserRoles,
            cancellationToken);
        await _usageService.EnsureCanAskAsync(currentUserId, currentUserRoles, cancellationToken);

        var stopwatch = Stopwatch.StartNew();
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, _options.SessionTokenEndpoint)
        {
            Content = JsonContent.Create(new AnamSessionTokenRequest(
                new AnamPersonaConfig(
                    _options.PersonaName,
                    _options.AvatarId,
                    _options.AvatarModel,
                    _options.VoiceId,
                    CustomClientLlmId),
                $"formationai-conversation-{conversation.Id}"))
        };
        httpRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Anam session token creation timed out for user {UserId} conversation {ConversationId}.", currentUserId, conversation.Id);
            throw new ServiceUnavailableException("Anam.ai ne repond pas pour le moment.");
        }
        catch (HttpRequestException exception)
        {
            _logger.LogWarning(exception, "Anam session token request failed for user {UserId} conversation {ConversationId}.", currentUserId, conversation.Id);
            throw new ServiceUnavailableException("Impossible de joindre Anam.ai.");
        }

        using (response)
        {
            stopwatch.Stop();
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Anam session token failed for user {UserId} conversation {ConversationId}. Status {StatusCode}. Duration {ElapsedMs}ms.",
                    currentUserId,
                    conversation.Id,
                    (int)response.StatusCode,
                    stopwatch.ElapsedMilliseconds);
                throw CreateExceptionForFailedResponse(response.StatusCode);
            }

            var tokenResponse = await response.Content.ReadFromJsonAsync<AnamSessionTokenResponse>(cancellationToken: cancellationToken)
                ?? throw new BadGatewayException("La reponse Anam.ai est invalide.");

            if (string.IsNullOrWhiteSpace(tokenResponse.SessionToken))
                throw new BadGatewayException("Anam.ai n'a pas retourne de jeton de session.");

            return new AvatarSessionResponse(
                tokenResponse.SessionToken,
                DateTime.UtcNow.AddHours(1),
                "Anam.ai");
        }
    }

    private void ValidateConfiguration()
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey) ||
            string.IsNullOrWhiteSpace(_options.AvatarId) ||
            string.IsNullOrWhiteSpace(_options.AvatarModel) ||
            string.IsNullOrWhiteSpace(_options.VoiceId) ||
            string.IsNullOrWhiteSpace(_options.SessionTokenEndpoint))
        {
            throw new ServiceUnavailableException("La configuration Anam.ai est incomplete.");
        }
    }

    private static Exception CreateExceptionForFailedResponse(HttpStatusCode statusCode)
    {
        return statusCode switch
        {
            HttpStatusCode.TooManyRequests or HttpStatusCode.ServiceUnavailable or HttpStatusCode.GatewayTimeout =>
                new ServiceUnavailableException("Anam.ai est temporairement indisponible."),
            HttpStatusCode.BadRequest =>
                new InvalidOperationException("La configuration Anam.ai est invalide."),
            HttpStatusCode.Unauthorized =>
                new ServiceUnavailableException("La cle API Anam.ai est invalide."),
            HttpStatusCode.Forbidden =>
                new ServiceUnavailableException("La cle API Anam.ai ne donne pas acces a cet avatar ou cette voix."),
            HttpStatusCode.NotFound =>
                new InvalidOperationException("La ressource Anam.ai configuree est introuvable."),
            _ => new BadGatewayException("Anam.ai a refuse la creation de session avatar.")
        };
    }

    private sealed record AnamSessionTokenRequest(
        [property: JsonPropertyName("personaConfig")] AnamPersonaConfig PersonaConfig,
        [property: JsonPropertyName("clientLabel")] string ClientLabel);

    private sealed record AnamPersonaConfig(
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("avatarId")] string AvatarId,
        [property: JsonPropertyName("avatarModel")] string AvatarModel,
        [property: JsonPropertyName("voiceId")] string VoiceId,
        [property: JsonPropertyName("llmId")] string LlmId);

    private sealed record AnamSessionTokenResponse(
        [property: JsonPropertyName("sessionToken")] string? SessionToken);
}
