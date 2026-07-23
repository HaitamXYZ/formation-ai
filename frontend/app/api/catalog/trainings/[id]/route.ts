import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { Training } from "@/lib/trainings/training-types";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await backendRequest<Training>(`/api/catalog/trainings/${id}`));
  } catch (error) {
    return toProblemResponse(error);
  }
}
