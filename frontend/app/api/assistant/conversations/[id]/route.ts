import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { AIConversation } from "@/lib/ai-trainer/ai-trainer-types";

type ConversationRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: ConversationRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const conversation = await backendRequest<AIConversation>(`/api/assistant/conversations/${id}`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });
    return NextResponse.json(conversation);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function DELETE(_request: Request, context: ConversationRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    await backendRequest<void>(`/api/assistant/conversations/${id}`, {
      method: "DELETE",
      headers: createBearerHeaders(token),
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
