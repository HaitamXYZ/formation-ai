import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { AITrainerTrainingOption } from "@/lib/ai-trainer/ai-trainer-types";

export async function GET() {
  try {
    const token = await getRequiredAuthToken();
    const trainings = await backendRequest<AITrainerTrainingOption[]>("/api/assistant/trainings", {
      method: "GET",
      headers: createBearerHeaders(token),
    });
    return NextResponse.json(trainings);
  } catch (error) {
    return toProblemResponse(error);
  }
}
