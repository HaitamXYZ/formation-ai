import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend-client";
import { toProblemResponse } from "@/lib/api/route-handler-utils";
import type { CatalogResponse } from "@/lib/catalog/catalog-types";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).search;
    const response = await backendRequest<CatalogResponse>(`/api/catalog/trainings${query}`, {
      method: "GET",
    });
    return NextResponse.json(response);
  } catch (error) {
    return toProblemResponse(error);
  }
}
