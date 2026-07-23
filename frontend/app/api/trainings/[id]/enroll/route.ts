import { NextResponse } from "next/server";
import { backendRequestWithStatus } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { Enrollment } from "@/lib/enrollments/enrollment-types";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const result = await backendRequestWithStatus<Enrollment>(`/api/trainings/${id}/enroll`, {
      method: "POST",
      headers: createBearerHeaders(token),
    });
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    return toProblemResponse(error);
  }
}
