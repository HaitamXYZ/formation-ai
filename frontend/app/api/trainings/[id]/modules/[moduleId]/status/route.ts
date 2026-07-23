import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { TrainingModule, UpdateTrainingModuleStatusPayload } from "@/lib/modules/training-module-types";

type TrainingModuleStatusRouteContext = {
  params: Promise<{ id: string; moduleId: string }>;
};

export async function PATCH(request: Request, context: TrainingModuleStatusRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id: trainingId, moduleId } = await context.params;
    const payload = (await request.json()) as UpdateTrainingModuleStatusPayload;
    const trainingModule = await backendRequest<TrainingModule>(`/api/trainings/${trainingId}/modules/${moduleId}/status`, {
      method: "PATCH",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(trainingModule);
  } catch (error) {
    return toProblemResponse(error);
  }
}
