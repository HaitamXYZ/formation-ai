import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { AIConversation, AIConversationListItem, CreateAIConversationPayload } from "@/lib/ai-trainer/ai-trainer-types";

export async function GET(request: Request) {
  try {
    const token = await getRequiredAuthToken();
    const moduleId = new URL(request.url).searchParams.get("moduleId");
    if (!moduleId) return NextResponse.json([] satisfies AIConversationListItem[]);
    const conversations = await backendRequest<AIConversationListItem[]>(`/api/modules/${moduleId}/assistant/conversations`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });
    return NextResponse.json(conversations);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = await getRequiredAuthToken();
    const payload = (await request.json()) as CreateAIConversationPayload;
    if (!payload.trainingModuleId) throw new Error("Un module doit etre selectionne pour demarrer l'assistant.");
    const conversation = await backendRequest<AIConversation>(`/api/modules/${payload.trainingModuleId}/assistant/conversations`, {
      method: "POST",
      headers: createBearerHeaders(token),
      body: payload,
    });
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
