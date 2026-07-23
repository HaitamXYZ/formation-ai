import "server-only";

import { backendRequest } from "@/lib/api/backend-client";
import type { AppUser, BackendAuthResponse, LoginRequest, RegisterRequest } from "@/lib/auth/auth-types";

export function loginWithBackend(payload: LoginRequest): Promise<BackendAuthResponse> {
  return backendRequest<BackendAuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registerWithBackend(payload: RegisterRequest): Promise<BackendAuthResponse> {
  return backendRequest<BackendAuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUserFromBackend(token: string): Promise<AppUser> {
  return backendRequest<AppUser>("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
