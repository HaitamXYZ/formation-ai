import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { AIUsageSummary } from "@/lib/catalog/catalog-types";

export async function GET() {
  try {
    const token = await getRequiredAuthToken();
    const usage = await backendRequest<AIUsageSummary>("/api/assistant/usage", {
      headers: createBearerHeaders(token),
    });
    return NextResponse.json(usage);
  } catch (error) {
    return toProblemResponse(error);
  }
}
