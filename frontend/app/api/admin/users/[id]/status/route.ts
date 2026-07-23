import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { UpdateUserStatusPayload, UserDetails } from "@/lib/users/user-types";

type UserStatusRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: UserStatusRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const payload = (await request.json()) as UpdateUserStatusPayload;
    const user = await backendRequest<UserDetails>(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(user);
  } catch (error) {
    return toProblemResponse(error);
  }
}
