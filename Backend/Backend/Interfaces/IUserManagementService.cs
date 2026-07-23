using Backend.DTOs.Common;
using Backend.DTOs.Users;

namespace Backend.Interfaces;

public interface IUserManagementService
{
    Task<PaginatedResponse<UserListItemResponse>> GetUsersAsync(UserQueryParameters parameters);

    Task<UserDetailsResponse> GetUserDetailsAsync(string id);

    Task<UserDetailsResponse> UpdateUserStatusAsync(string id, UpdateUserStatusRequest request, string currentUserId);
}
