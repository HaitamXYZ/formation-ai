import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { UserDetails } from "@/lib/users/user-types";

type UserRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: UserRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const user = await backendRequest<UserDetails>(`/api/admin/users/${id}`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });

    return NextResponse.json(user);
  } catch (error) {
    return toProblemResponse(error);
  }
}
