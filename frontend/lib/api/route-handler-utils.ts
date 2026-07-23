import "server-only";

import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/api-error";

export function toProblemResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      error.problem ?? {
        title: error.message,
        status: error.status || 503,
        detail: error.message,
      },
      { status: error.status || 503 },
    );
  }

  return NextResponse.json(
    {
      title: "Erreur inattendue",
      status: 500,
      detail: "Une erreur inattendue est survenue.",
    },
    { status: 500 },
  );
}
