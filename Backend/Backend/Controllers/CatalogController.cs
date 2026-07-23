using Backend.DTOs.Common;
using Backend.DTOs.Trainings;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/catalog/trainings")]
public sealed class CatalogController : ControllerBase
{
    private readonly ITrainingService _trainingService;

    public CatalogController(ITrainingService trainingService) => _trainingService = trainingService;

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<TrainingListItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<TrainingListItemResponse>>> GetAll(
        [FromQuery] CatalogTrainingQueryParameters parameters)
    {
        return Ok(await _trainingService.GetCatalogAsync(parameters));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TrainingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrainingResponse>> GetById(int id)
    {
        return Ok(await _trainingService.GetCatalogByIdAsync(id));
    }
}
