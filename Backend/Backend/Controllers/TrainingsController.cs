using Backend.DTOs.Common;
using Backend.DTOs.Trainings;
using Backend.Enums;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = ApplicationRoles.Admin)]
[Route("api/trainings")]
public sealed class TrainingsController : ControllerBase
{
    private readonly ITrainingService _trainingService;

    public TrainingsController(ITrainingService trainingService)
    {
        _trainingService = trainingService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<TrainingListItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<TrainingListItemResponse>>> GetAll(
        [FromQuery] TrainingQueryParameters parameters)
    {
        return Ok(await _trainingService.GetAllAsync(parameters));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TrainingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrainingResponse>> GetById(int id)
    {
        return Ok(await _trainingService.GetByIdAsync(id));
    }

    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(TrainingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrainingResponse>> GetBySlug(string slug)
    {
        return Ok(await _trainingService.GetBySlugAsync(slug));
    }

    [HttpPost]
    [ProducesResponseType(typeof(TrainingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TrainingResponse>> Create(CreateTrainingRequest request)
    {
        var training = await _trainingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = training.Id }, training);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TrainingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TrainingResponse>> Update(int id, UpdateTrainingRequest request)
    {
        return Ok(await _trainingService.UpdateAsync(id, request));
    }

    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(TrainingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrainingResponse>> UpdateStatus(int id, UpdateTrainingStatusRequest request)
    {
        return Ok(await _trainingService.UpdateStatusAsync(id, request));
    }

    [HttpPatch("{id:int}/featured")]
    [ProducesResponseType(typeof(TrainingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrainingResponse>> UpdateFeatured(int id, UpdateTrainingFeaturedRequest request)
    {
        return Ok(await _trainingService.UpdateFeaturedAsync(id, request));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        await _trainingService.DeleteAsync(id);
        return NoContent();
    }
}
