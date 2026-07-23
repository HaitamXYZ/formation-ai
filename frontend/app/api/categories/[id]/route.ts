import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { Category, UpdateCategoryRequest } from "@/lib/categories/category-types";

type CategoryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: CategoryRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const category = await backendRequest<Category>(`/api/categories/${id}`, {
      method: "GET",
      headers: createBearerHeaders(token),
    });

    return NextResponse.json(category);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function PUT(request: Request, context: CategoryRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;
    const payload = (await request.json()) as UpdateCategoryRequest;
    const category = await backendRequest<Category>(`/api/categories/${id}`, {
      method: "PUT",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(category);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function DELETE(_request: Request, context: CategoryRouteContext) {
  try {
    const token = await getRequiredAuthToken();
    const { id } = await context.params;

    await backendRequest<void>(`/api/categories/${id}`, {
      method: "DELETE",
      headers: createBearerHeaders(token),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
