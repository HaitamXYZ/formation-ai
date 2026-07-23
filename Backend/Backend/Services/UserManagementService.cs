using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.Users;
using Backend.Entities;
using Backend.Enums;
using Backend.Exceptions;
using Backend.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public sealed class UserManagementService : IUserManagementService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserManagementService(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    public async Task<PaginatedResponse<UserListItemResponse>> GetUsersAsync(UserQueryParameters parameters)
    {
        var query = _dbContext.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim();
            query = query.Where(user =>
                user.FirstName.Contains(search) ||
                user.LastName.Contains(search) ||
                (user.Email != null && user.Email.Contains(search)));
        }

        if (parameters.IsActive.HasValue)
            query = query.Where(user => user.IsActive == parameters.IsActive.Value);

        var roleFilter = NormalizeOptionalRole(parameters.Role);
        if (!string.IsNullOrWhiteSpace(roleFilter))
        {
            var roleUsers = await _userManager.GetUsersInRoleAsync(roleFilter);
            var roleUserIds = roleUsers.Select(user => user.Id).ToArray();
            query = query.Where(user => roleUserIds.Contains(user.Id));
        }

        query = ApplySorting(query, parameters);
        var totalItems = await query.CountAsync();
        var users = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToArrayAsync();

        var items = new List<UserListItemResponse>();
        foreach (var user in users)
            items.Add(await MapToListItemAsync(user));

        var totalPages = totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (double)parameters.PageSize);
        return new PaginatedResponse<UserListItemResponse>(items, parameters.Page, parameters.PageSize, totalItems, totalPages);
    }

    public async Task<UserDetailsResponse> GetUserDetailsAsync(string id)
    {
        var user = await FindUserAsync(id);
        return await MapToDetailsAsync(user);
    }

    public async Task<UserDetailsResponse> UpdateUserStatusAsync(string id, UpdateUserStatusRequest request, string currentUserId)
    {
        var user = await FindUserAsync(id);

        if (string.Equals(user.Id, currentUserId, StringComparison.Ordinal) && !request.IsActive)
            throw new ConflictException("Vous ne pouvez pas desactiver votre propre compte administrateur.");

        user.IsActive = request.IsActive;
        await _dbContext.SaveChangesAsync();
        return await MapToDetailsAsync(user);
    }

    private static IQueryable<ApplicationUser> ApplySorting(IQueryable<ApplicationUser> query, UserQueryParameters parameters)
    {
        var descending = string.Equals(parameters.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        return parameters.SortBy?.ToLowerInvariant() switch
        {
            "firstname" => descending ? query.OrderByDescending(user => user.FirstName) : query.OrderBy(user => user.FirstName),
            "lastname" => descending ? query.OrderByDescending(user => user.LastName) : query.OrderBy(user => user.LastName),
            "email" => descending ? query.OrderByDescending(user => user.Email) : query.OrderBy(user => user.Email),
            "status" => descending ? query.OrderByDescending(user => user.IsActive) : query.OrderBy(user => user.IsActive),
            _ => descending ? query.OrderByDescending(user => user.CreatedAt) : query.OrderBy(user => user.CreatedAt)
        };
    }

    private async Task<ApplicationUser> FindUserAsync(string id)
    {
        return await _userManager.FindByIdAsync(id)
            ?? throw new NotFoundException("User was not found.");
    }

    private async Task<UserListItemResponse> MapToListItemAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return new UserListItemResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            GetFullName(user),
            user.Email ?? string.Empty,
            user.IsActive,
            roles.Where(role => role is ApplicationRoles.Admin or ApplicationRoles.Learner).ToArray(),
            user.CreatedAt,
            0);
    }

    private async Task<UserDetailsResponse> MapToDetailsAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return new UserDetailsResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            GetFullName(user),
            user.Email ?? string.Empty,
            user.IsActive,
            roles.Where(role => role is ApplicationRoles.Admin or ApplicationRoles.Learner).ToArray(),
            user.CreatedAt,
            Array.Empty<AssignedTrainingResponse>());
    }

    private static string GetFullName(ApplicationUser user) => $"{user.FirstName} {user.LastName}".Trim();

    private static string? NormalizeOptionalRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role)) return null;

        return role.Trim() switch
        {
            ApplicationRoles.Admin => ApplicationRoles.Admin,
            ApplicationRoles.Learner => ApplicationRoles.Learner,
            _ => throw new InvalidOperationException("Role filter is invalid.")
        };
    }
}
