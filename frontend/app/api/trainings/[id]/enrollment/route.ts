import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Context) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    await backendRequest<void>(`/api/trainings/${id}/enrollment`, {
      method: "DELETE",
      headers: createBearerHeaders(token),
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
