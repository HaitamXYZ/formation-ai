import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { loginWithBackend } from "@/lib/api/backend-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-utils";
import type { LoginRequest } from "@/lib/auth/auth-types";

function getCookieMaxAge(expiresAt: string): number {
  const expiresAtTime = new Date(expiresAt).getTime();
  const seconds = Math.floor((expiresAtTime - Date.now()) / 1000);
  return Math.max(seconds, 60);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginRequest;
    const authResponse = await loginWithBackend(payload);
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, authResponse.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getCookieMaxAge(authResponse.expiresAt),
    });

    return NextResponse.json(authResponse.user);
  } catch (error) {
    return toProblemResponse(error);
  }
}
