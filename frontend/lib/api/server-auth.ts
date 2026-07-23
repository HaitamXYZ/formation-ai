import "server-only";

import { cookies } from "next/headers";
import { ApiError } from "@/lib/api/api-error";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-utils";

export async function getRequiredAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new ApiError("Aucune session active.", 401, {
      title: "Non authentifie",
      status: 401,
      detail: "Aucune session active.",
    });
  }

  return token;
}

export function createBearerHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}
