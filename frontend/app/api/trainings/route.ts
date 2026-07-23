import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { CreateTrainingRequest, PaginatedTrainingResponse, Training } from "@/lib/trainings/training-types";

export async function GET(request: Request) {
  try {
    const token = await getRequiredAuthToken();
    const { search } = new URL(request.url);
    const trainings = await backendRequest<PaginatedTrainingResponse>(`/api/trainings${search}`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });

    return NextResponse.json(trainings);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = await getRequiredAuthToken();
    const payload = (await request.json()) as CreateTrainingRequest;
    const training = await backendRequest<Training>("/api/trainings", {
      method: "POST",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
