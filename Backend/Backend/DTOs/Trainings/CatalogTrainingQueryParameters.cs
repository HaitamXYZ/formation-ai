namespace Backend.DTOs.Trainings;

public sealed class CatalogTrainingQueryParameters
{
    private int _page = 1;
    private int _pageSize = 12;
    public int Page { get => _page; init => _page = value < 1 ? 1 : value; }
    public int PageSize { get => _pageSize; init => _pageSize = value is < 1 or > 100 ? 12 : value; }
    public string? Search { get; init; }
    public int? CategoryId { get; init; }
    public Backend.Enums.TrainingLevel? Level { get; init; }
    public string? SortBy { get; init; }
    public string? SortDirection { get; init; }
}
