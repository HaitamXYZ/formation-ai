using System.Security.Claims;
using Backend.DTOs.TrainingModuleResources;
using Backend.Enums;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = ApplicationRoles.Admin)]
[Route("api/trainings/{trainingId:int}/modules/{moduleId:int}/resources")]
public sealed class TrainingModuleResourcesController : ControllerBase
{
    private readonly ITrainingModuleResourceService _resources;
    public TrainingModuleResourcesController(ITrainingModuleResourceService resources) => _resources = resources;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<TrainingModuleResourceResponse>>> GetAll(int trainingId, int moduleId, CancellationToken cancellationToken) =>
        Ok(await _resources.GetAllAsync(trainingId, moduleId, UserId(), Roles(), cancellationToken));

    [HttpGet("{resourceId:int}")]
    public async Task<ActionResult<TrainingModuleResourceResponse>> GetById(int trainingId, int moduleId, int resourceId, CancellationToken cancellationToken) =>
        Ok(await _resources.GetByIdAsync(trainingId, moduleId, resourceId, UserId(), Roles(), cancellationToken));

    [HttpPost("text")]
    public async Task<ActionResult<TrainingModuleResourceResponse>> CreateText(int trainingId, int moduleId, CreateTextResourceRequest request, CancellationToken cancellationToken)
    {
        var resource = await _resources.CreateTextAsync(trainingId, moduleId, request, UserId(), Roles(), cancellationToken);
        return CreatedAtAction(nameof(GetById), new { trainingId, moduleId, resourceId = resource.Id }, resource);
    }

    [HttpPost("upload")]
    [RequestFormLimits(MultipartBodyLengthLimit = 10 * 1024 * 1024 + 64 * 1024)]
    [RequestSizeLimit(10 * 1024 * 1024 + 64 * 1024)]
    public async Task<ActionResult<TrainingModuleResourceResponse>> Upload(int trainingId, int moduleId, [FromForm] UploadResourceRequest request, CancellationToken cancellationToken)
    {
        var resource = await _resources.UploadAsync(trainingId, moduleId, request, UserId(), Roles(), cancellationToken);
        return CreatedAtAction(nameof(GetById), new { trainingId, moduleId, resourceId = resource.Id }, resource);
    }

    [HttpPatch("{resourceId:int}/status")]
    public async Task<ActionResult<TrainingModuleResourceResponse>> UpdateStatus(int trainingId, int moduleId, int resourceId, UpdateResourceStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await _resources.UpdateStatusAsync(trainingId, moduleId, resourceId, request, UserId(), Roles(), cancellationToken));

    [HttpDelete("{resourceId:int}")]
    public async Task<IActionResult> Delete(int trainingId, int moduleId, int resourceId, CancellationToken cancellationToken)
    {
        await _resources.DeleteAsync(trainingId, moduleId, resourceId, UserId(), Roles(), cancellationToken);
        return NoContent();
    }

    [HttpPost("{resourceId:int}/reprocess")]
    public async Task<ActionResult<TrainingModuleResourceResponse>> Reprocess(int trainingId, int moduleId, int resourceId, CancellationToken cancellationToken) =>
        Ok(await _resources.ReprocessAsync(trainingId, moduleId, resourceId, UserId(), Roles(), cancellationToken));

    private string UserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("Authenticated user was not found.");
    private string[] Roles() => User.FindAll(ClaimTypes.Role).Select(claim => claim.Value).ToArray();
}

