import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { TrainingModule, UpdateTrainingModulePayload } from "@/lib/modules/training-module-types";

type TrainingModuleRouteContext = {
  params: Promise<{ id: string; moduleId: string }>;
};

export async function GET(_request: Request, context: TrainingModuleRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id: trainingId, moduleId } = await context.params;
    const trainingModule = await backendRequest<TrainingModule>(`/api/trainings/${trainingId}/modules/${moduleId}`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });

    return NextResponse.json(trainingModule);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function PUT(request: Request, context: TrainingModuleRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id: trainingId, moduleId } = await context.params;
    const payload = (await request.json()) as UpdateTrainingModulePayload;
    const trainingModule = await backendRequest<TrainingModule>(`/api/trainings/${trainingId}/modules/${moduleId}`, {
      method: "PUT",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(trainingModule);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function DELETE(_request: Request, context: TrainingModuleRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id: trainingId, moduleId } = await context.params;

    await backendRequest<void>(`/api/trainings/${trainingId}/modules/${moduleId}`, {
      method: "DELETE",
      headers: createBearerHeaders(token),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
