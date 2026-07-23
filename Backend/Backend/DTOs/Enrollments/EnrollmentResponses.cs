using Backend.Enums;

namespace Backend.DTOs.Enrollments;

public sealed record EnrollmentResponse(
    int Id,
    int TrainingId,
    EnrollmentStatus Status,
    DateTime EnrolledAt,
    DateTime? UpdatedAt,
    DateTime? LastAccessedAt);

public sealed record EnrollmentListItemResponse(
    int Id,
    int TrainingId,
    string TrainingTitle,
    string TrainingSlug,
    string? TrainingImageUrl,
    string CategoryName,
    TrainingLevel Level,
    int DurationHours,
    EnrollmentStatus Status,
    DateTime EnrolledAt,
    DateTime? LastAccessedAt,
    int ModulesCount);

public sealed record LearnerTrainingListItemResponse(
    int Id,
    string Title,
    string Slug,
    string? ImageUrl,
    string CategoryName,
    TrainingLevel Level,
    int DurationHours,
    int ModulesCount,
    DateTime EnrolledAt,
    DateTime? LastAccessedAt);

public sealed record LearnerTrainingModuleResponse(
    int Id,
    string Title,
    string? Description,
    string? Content,
    string? VideoUrl,
    string? DocumentUrl,
    int OrderIndex,
    int? EstimatedDurationMinutes,
    bool IsPublished);

public sealed record LearnerTrainingResponse(
    int Id,
    string Title,
    string Slug,
    string? Description,
    string? ShortDescription,
    string? ImageUrl,
    string CategoryName,
    TrainingLevel Level,
    int DurationHours,
    IReadOnlyCollection<LearnerTrainingModuleResponse> Modules,
    EnrollmentResponse Enrollment);

public sealed record EnrollmentOperationResult(EnrollmentResponse Enrollment, bool IsReactivated);
