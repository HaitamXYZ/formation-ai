import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { Training, UpdateTrainingRequest } from "@/lib/trainings/training-types";

type TrainingRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: TrainingRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const training = await backendRequest<Training>(`/api/trainings/${id}`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });

    return NextResponse.json(training);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function PUT(request: Request, context: TrainingRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const payload = (await request.json()) as UpdateTrainingRequest;
    const training = await backendRequest<Training>(`/api/trainings/${id}`, {
      method: "PUT",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(training);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function DELETE(_request: Request, context: TrainingRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;

    await backendRequest<void>(`/api/trainings/${id}`, {
      method: "DELETE",
      headers: createBearerHeaders(token),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
