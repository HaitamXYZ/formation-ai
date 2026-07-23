import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { CreateTrainingModulePayload, TrainingModule, TrainingModuleListItem } from "@/lib/modules/training-module-types";

type TrainingModulesRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: TrainingModulesRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id: trainingId } = await context.params;
    const modules = await backendRequest<TrainingModuleListItem[]>(`/api/trainings/${trainingId}/modules`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });

    return NextResponse.json(modules);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function POST(request: Request, context: TrainingModulesRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id: trainingId } = await context.params;
    const payload = (await request.json()) as CreateTrainingModulePayload;
    const trainingModule = await backendRequest<TrainingModule>(`/api/trainings/${trainingId}/modules`, {
      method: "POST",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(trainingModule, { status: 201 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
