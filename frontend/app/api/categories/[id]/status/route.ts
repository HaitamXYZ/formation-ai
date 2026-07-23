import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { Category, UpdateCategoryStatusRequest } from "@/lib/categories/category-types";

type CategoryStatusRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: CategoryStatusRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const payload = (await request.json()) as UpdateCategoryStatusRequest;
    const category = await backendRequest<Category>(`/api/categories/${id}/status`, {
      method: "PATCH",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(category);
  } catch (error) {
    return toProblemResponse(error);
  }
}
