import { apiRequest } from "@/lib/api/api-client";
import type {
  PaginatedUsersResponse,
  UpdateUserStatusPayload,
  UserDetails,
  UserFilters,
} from "@/lib/users/user-types";

function toQuery(filters: UserFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export function getUsers(filters: UserFilters): Promise<PaginatedUsersResponse> {
  return apiRequest<PaginatedUsersResponse>(`/api/admin/users?${toQuery(filters)}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function getUser(id: string): Promise<UserDetails> {
  return apiRequest<UserDetails>(`/api/admin/users/${id}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function updateUserStatus(id: string, payload: UpdateUserStatusPayload): Promise<UserDetails> {
  return apiRequest<UserDetails>(`/api/admin/users/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}


