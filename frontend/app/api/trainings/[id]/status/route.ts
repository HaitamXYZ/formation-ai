import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { Training, UpdateTrainingStatusRequest } from "@/lib/trainings/training-types";

type TrainingStatusRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: TrainingStatusRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const payload = (await request.json()) as UpdateTrainingStatusRequest;
    const training = await backendRequest<Training>(`/api/trainings/${id}/status`, {
      method: "PATCH",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(training);
  } catch (error) {
    return toProblemResponse(error);
  }
}
