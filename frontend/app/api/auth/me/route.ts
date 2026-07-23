import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserFromBackend } from "@/lib/api/backend-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-utils";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      {
        title: "Non authentifié",
        status: 401,
        detail: "Aucune session active.",
      },
      { status: 401 },
    );
  }

  try {
    const user = await getCurrentUserFromBackend(token);
    return NextResponse.json(user);
  } catch (error) {
    cookieStore.delete(AUTH_COOKIE_NAME);
    return toProblemResponse(error);
  }
}
