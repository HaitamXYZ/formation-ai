import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { TrainingModuleResource, UpdateResourceStatusPayload } from "@/lib/modules/training-module-resource-types";

type Context = { params: Promise<{ id: string; moduleId: string; resourceId: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    const token = await getRequiredAuthToken(); const { id, moduleId, resourceId } = await context.params;
    return NextResponse.json(await backendRequest<TrainingModuleResource>(`/api/trainings/${id}/modules/${moduleId}/resources/${resourceId}/status`, { method: "PATCH", headers: createBearerHeaders(token), body: await request.json() as UpdateResourceStatusPayload }));
  } catch (error) { return toProblemResponse(error); }
}
