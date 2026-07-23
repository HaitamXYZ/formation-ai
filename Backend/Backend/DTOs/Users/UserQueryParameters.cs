namespace Backend.DTOs.Users;

public sealed class UserQueryParameters
{
    private int _page = 1;
    private int _pageSize = 10;

    public int Page
    {
        get => _page;
        init => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value switch
        {
            < 1 => 10,
            > 100 => 100,
            _ => value
        };
    }

    public string? Search { get; init; }

    public string? Role { get; init; }

    public bool? IsActive { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
