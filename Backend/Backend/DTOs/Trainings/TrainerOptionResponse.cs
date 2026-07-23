namespace Backend.DTOs.Trainings;

public sealed record TrainerOptionResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    string FullName);
