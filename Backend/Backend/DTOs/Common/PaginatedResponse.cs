namespace Backend.DTOs.Common;

public sealed record PaginatedResponse<T>(
    IReadOnlyCollection<T> Items,
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages);
