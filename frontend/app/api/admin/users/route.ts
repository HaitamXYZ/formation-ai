import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { PaginatedUsersResponse } from "@/lib/users/user-types";

export async function GET(request: Request) {
  try {
    const token = await getRequiredAuthToken();
    const { search } = new URL(request.url);
    const users = await backendRequest<PaginatedUsersResponse>(`/api/admin/users${search}`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });

    return NextResponse.json(users);
  } catch (error) {
    return toProblemResponse(error);
  }
}
