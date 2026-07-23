import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { ReorderTrainingModulesPayload, TrainingModuleListItem } from "@/lib/modules/training-module-types";

type TrainingModuleReorderRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: TrainingModuleReorderRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id: trainingId } = await context.params;
    const payload = (await request.json()) as ReorderTrainingModulesPayload;
    const modules = await backendRequest<TrainingModuleListItem[]>(`/api/trainings/${trainingId}/modules/reorder`, {
      method: "PUT",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(modules);
  } catch (error) {
    return toProblemResponse(error);
  }
}
