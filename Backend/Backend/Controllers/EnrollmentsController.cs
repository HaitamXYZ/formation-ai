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
[Route("api/trainings/{trainingId:int}")]
public sealed class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;

    public EnrollmentsController(IEnrollmentService enrollmentService) => _enrollmentService = enrollmentService;

    [HttpPost("enroll")]
    [ProducesResponseType(typeof(EnrollmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(EnrollmentResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<EnrollmentResponse>> Enroll(int trainingId, CancellationToken cancellationToken)
    {
        var result = await _enrollmentService.EnrollAsync(trainingId, GetCurrentUserId(), cancellationToken);
        return result.IsReactivated ? Ok(result.Enrollment) : StatusCode(StatusCodes.Status201Created, result.Enrollment);
    }

    [HttpDelete("enrollment")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Cancel(int trainingId, CancellationToken cancellationToken)
    {
        await _enrollmentService.CancelAsync(trainingId, GetCurrentUserId(), cancellationToken);
        return NoContent();
    }

    private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException(nameof(ClaimTypes.NameIdentifier));
}
