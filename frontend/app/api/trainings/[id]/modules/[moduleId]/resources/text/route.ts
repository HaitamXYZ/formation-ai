import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { CreateTextResourcePayload, TrainingModuleResource } from "@/lib/modules/training-module-resource-types";

type Context = { params: Promise<{ id: string; moduleId: string }> };
export async function POST(request: Request, context: Context) {
  try {
    const token = await getRequiredAuthToken();
    const { id, moduleId } = await context.params;
    const resource = await backendRequest<TrainingModuleResource>(`/api/trainings/${id}/modules/${moduleId}/resources/text`, { method: "POST", headers: createBearerHeaders(token), body: await request.json() as CreateTextResourcePayload });
    return NextResponse.json(resource, { status: 201 });
  } catch (error) { return toProblemResponse(error); }
}
