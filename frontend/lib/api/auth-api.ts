import { apiRequest } from "@/lib/api/api-client";
import type { AppUser, LoginRequest, RegisterRequest } from "@/lib/auth/auth-types";

export function login(payload: LoginRequest): Promise<AppUser> {
  return apiRequest<AppUser>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function register(payload: RegisterRequest): Promise<AppUser> {
  return apiRequest<AppUser>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUser(): Promise<AppUser> {
  return apiRequest<AppUser>("/api/auth/me", {
    method: "GET",
    cache: "no-store",
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>("/api/auth/logout", {
    method: "POST",
  });
}
