namespace Backend.Enums;

public static class AIMessageRoles
{
    public const string User = "User";
    public const string Assistant = "Assistant";
    public const string System = "System";

    public static readonly string[] All =
    [
        User,
        Assistant,
        System
    ];
}
