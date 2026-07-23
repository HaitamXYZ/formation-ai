import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { createBearerHeaders, getRequiredAuthToken } from "@/lib/api/server-auth";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { Category, CreateCategoryRequest } from "@/lib/categories/category-types";

export async function GET() {
  try {
    const token = await getRequiredAuthToken();
    const categories = await backendRequest<Category[]>("/api/categories", {
      method: "GET",
      headers: createBearerHeaders(token),
    });

    return NextResponse.json(categories);
  } catch (error) {
    return toProblemResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = await getRequiredAuthToken();
    const payload = (await request.json()) as CreateCategoryRequest;
    const category = await backendRequest<Category>("/api/categories", {
      method: "POST",
      headers: createBearerHeaders(token),
      body: payload,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return toProblemResponse(error);
  }
}
