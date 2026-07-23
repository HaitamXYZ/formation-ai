using System.Security.Claims;
using Backend.DTOs.Enrollments;
using Backend.Enums;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = ApplicationRoles.Learner)]
[Route("api/learner/trainings")]
public sealed class LearnerTrainingsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;

    public LearnerTrainingsController(IEnrollmentService enrollmentService) => _enrollmentService = enrollmentService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<EnrollmentListItemResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _enrollmentService.GetActiveAsync(GetCurrentUserId(), cancellationToken));
    }

    [HttpGet("{trainingId:int}")]
    public async Task<ActionResult<LearnerTrainingResponse>> GetTraining(int trainingId, CancellationToken cancellationToken)
    {
        return Ok(await _enrollmentService.GetTrainingAsync(trainingId, GetCurrentUserId(), cancellationToken));
    }

    [HttpGet("{trainingId:int}/modules/{moduleId:int}")]
    public async Task<ActionResult<LearnerTrainingModuleResponse>> GetModule(
        int trainingId, int moduleId, CancellationToken cancellationToken)
    {
        return Ok(await _enrollmentService.GetModuleAsync(trainingId, moduleId, GetCurrentUserId(), cancellationToken));
    }

    private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException(nameof(ClaimTypes.NameIdentifier));
}
