namespace Backend.Enums;

public static class ApplicationRoles
{
    public const string Admin = "Admin";
    public const string Learner = "Learner";

    public static readonly string[] All =
    [
        Admin,
        Learner
    ];
}
