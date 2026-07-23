import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { AITrainerAnswer, AskAITrainerPayload } from "@/lib/ai-trainer/ai-trainer-types";

export async function POST(request: Request) {
  try {
    const token = await getRequiredAuthToken();
    const payload = (await request.json()) as AskAITrainerPayload;
    const answer = await backendRequest<AITrainerAnswer>(`/api/assistant/conversations/${payload.conversationId}/messages`, {
      method: "POST",
      headers: createBearerHeaders(token),
      body: { question: payload.question },
    });
    return NextResponse.json(answer);
  } catch (error) {
    return toProblemResponse(error);
  }
}
