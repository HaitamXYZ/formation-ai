using Backend.DTOs.TrainingModules;
using Backend.Enums;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = ApplicationRoles.Admin)]
[Route("api/trainings/{trainingId:int}/modules")]
public sealed class TrainingModulesController : ControllerBase
{
    private readonly ITrainingModuleService _trainingModuleService;

    public TrainingModulesController(ITrainingModuleService trainingModuleService)
    {
        _trainingModuleService = trainingModuleService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<TrainingModuleListItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<TrainingModuleListItemResponse>>> GetAll(int trainingId)
    {
        return Ok(await _trainingModuleService.GetAllAsync(trainingId, string.Empty, true));
    }

    [HttpGet("{moduleId:int}")]
    [ProducesResponseType(typeof(TrainingModuleResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<TrainingModuleResponse>> GetById(int trainingId, int moduleId)
    {
        return Ok(await _trainingModuleService.GetByIdAsync(trainingId, moduleId, string.Empty, true));
    }

    [HttpPost]
    [ProducesResponseType(typeof(TrainingModuleResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<TrainingModuleResponse>> Create(int trainingId, CreateTrainingModuleRequest request)
    {
        var module = await _trainingModuleService.CreateAsync(trainingId, request);
        return CreatedAtAction(nameof(GetById), new { trainingId, moduleId = module.Id }, module);
    }

    [HttpPut("{moduleId:int}")]
    [ProducesResponseType(typeof(TrainingModuleResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<TrainingModuleResponse>> Update(int trainingId, int moduleId, UpdateTrainingModuleRequest request)
    {
        return Ok(await _trainingModuleService.UpdateAsync(trainingId, moduleId, request));
    }

    [HttpPatch("{moduleId:int}/status")]
    [ProducesResponseType(typeof(TrainingModuleResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<TrainingModuleResponse>> UpdateStatus(int trainingId, int moduleId, UpdateTrainingModuleStatusRequest request)
    {
        return Ok(await _trainingModuleService.UpdateStatusAsync(trainingId, moduleId, request));
    }

    [HttpPut("reorder")]
    [ProducesResponseType(typeof(IReadOnlyCollection<TrainingModuleListItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<TrainingModuleListItemResponse>>> Reorder(int trainingId, ReorderTrainingModulesRequest request)
    {
        return Ok(await _trainingModuleService.ReorderAsync(trainingId, request));
    }

    [HttpDelete("{moduleId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(int trainingId, int moduleId)
    {
        await _trainingModuleService.DeleteAsync(trainingId, moduleId);
        return NoContent();
    }
}
