import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { EnrollmentListItem } from "@/lib/enrollments/enrollment-types";

export async function GET() {
  try {
    const token = await getRequiredAuthToken();
    const items = await backendRequest<EnrollmentListItem[]>("/api/learner/trainings", {
      headers: createBearerHeaders(token),
    });
    return NextResponse.json(items);
  } catch (error) {
    return toProblemResponse(error);
  }
}
