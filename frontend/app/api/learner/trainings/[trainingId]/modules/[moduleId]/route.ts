import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { LearnerTrainingModule } from "@/lib/enrollments/enrollment-types";

type Context = { params: Promise<{ trainingId: string; moduleId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const token = await getRequiredAuthToken();
    const { trainingId, moduleId } = await context.params;
    const trainingModule = await backendRequest<LearnerTrainingModule>(
      `/api/learner/trainings/${trainingId}/modules/${moduleId}`,
      { headers: createBearerHeaders(token) },
    );
    return NextResponse.json(trainingModule);
  } catch (error) {
    return toProblemResponse(error);
  }
}
