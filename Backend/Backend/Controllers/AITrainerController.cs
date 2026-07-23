using System.Security.Claims;
using Backend.DTOs.AITrainer;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public sealed class ModuleAssistantController : ControllerBase
{
    private readonly IAITrainerService _assistantService;
    private readonly IAIUsageService _usageService;

    public ModuleAssistantController(IAITrainerService assistantService, IAIUsageService usageService)
    {
        _assistantService = assistantService;
        _usageService = usageService;
    }

    [HttpGet("api/assistant/trainings")]
    public async Task<ActionResult<IReadOnlyCollection<AITrainerTrainingOptionResponse>>> GetTrainingOptions(CancellationToken cancellationToken)
    {
        return Ok(await _assistantService.GetTrainingOptionsAsync(GetCurrentUserId(), GetCurrentUserRoles(), cancellationToken));
    }

    [HttpPost("api/modules/{moduleId:int}/assistant/conversations")]
    public async Task<ActionResult<AIConversationResponse>> CreateConversation(
        int moduleId,
        CreateAIConversationRequest request,
        CancellationToken cancellationToken)
    {
        if (request.TrainingModuleId != moduleId)
            throw new InvalidOperationException("Le module de la route doit correspondre au module demande.");

        var conversation = await _assistantService.CreateConversationAsync(
            request,
            GetCurrentUserId(),
            GetCurrentUserRoles(),
            cancellationToken);

        return CreatedAtAction(nameof(GetConversation), new { conversationId = conversation.Id }, conversation);
    }

    [HttpGet("api/modules/{moduleId:int}/assistant/conversations")]
    public async Task<ActionResult<IReadOnlyCollection<AIConversationListItemResponse>>> GetModuleConversations(
        int moduleId,
        CancellationToken cancellationToken)
    {
        var conversations = await _assistantService.GetConversationsAsync(GetCurrentUserId(), cancellationToken);
        return Ok(conversations.Where(conversation => conversation.TrainingModuleId == moduleId).ToArray());
    }

    [HttpGet("api/assistant/conversations/{conversationId:int}")]
    public async Task<ActionResult<AIConversationResponse>> GetConversation(int conversationId, CancellationToken cancellationToken)
    {
        return Ok(await _assistantService.GetConversationAsync(conversationId, GetCurrentUserId(), cancellationToken));
    }

    [HttpPost("api/assistant/conversations/{conversationId:int}/messages")]
    [EnableRateLimiting("ai-usage")]
    public async Task<ActionResult<AITrainerAnswerResponse>> Ask(
        int conversationId,
        AskModuleAssistantRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _assistantService.AskAsync(
            new AskAITrainerRequest { ConversationId = conversationId, Question = request.Question },
            GetCurrentUserId(),
            GetCurrentUserRoles(),
            cancellationToken));
    }

    [HttpGet("api/assistant/usage")]
    public async Task<ActionResult<AIUsageSummaryResponse>> GetUsage(CancellationToken cancellationToken)
    {
        return Ok(await _usageService.GetUsageAsync(GetCurrentUserId(), GetCurrentUserRoles(), cancellationToken));
    }

    [HttpDelete("api/assistant/conversations/{conversationId:int}")]
    public async Task<IActionResult> DeleteConversation(int conversationId, CancellationToken cancellationToken)
    {
        await _assistantService.DeleteConversationAsync(conversationId, GetCurrentUserId(), cancellationToken);
        return NoContent();
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Authenticated user was not found.");
    }

    private IReadOnlyCollection<string> GetCurrentUserRoles()
    {
        return User.FindAll(ClaimTypes.Role).Select(claim => claim.Value).ToArray();
    }
}

public sealed class AskModuleAssistantRequest
{
    public string Question { get; init; } = string.Empty;
}
