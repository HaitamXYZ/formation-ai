import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { AvatarSession, CreateAvatarSessionPayload } from "@/lib/avatar/avatar-types";

export async function POST(request: Request) {
  try {
    const token = await getRequiredAuthToken();
    const payload = (await request.json()) as CreateAvatarSessionPayload;
    const session = await backendRequest<AvatarSession>("/api/ai-avatar/session", {
      method: "POST",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(session);
  } catch (error) {
    return toProblemResponse(error);
  }
}
