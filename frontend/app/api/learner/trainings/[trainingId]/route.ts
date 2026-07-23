import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { LearnerTraining } from "@/lib/enrollments/enrollment-types";

type Context = { params: Promise<{ trainingId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const token = await getRequiredAuthToken();
    const { trainingId } = await context.params;
    const training = await backendRequest<LearnerTraining>(`/api/learner/trainings/${trainingId}`, {
      headers: createBearerHeaders(token),
    });
    return NextResponse.json(training);
  } catch (error) {
    return toProblemResponse(error);
  }
}
