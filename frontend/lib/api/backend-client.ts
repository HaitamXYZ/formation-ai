import "server-only";

import { ApiError, getProblemMessage, readProblemDetails } from "@/lib/api/api-error";

const defaultBackendUrl = "http://localhost:5129";

export function getBackendUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || defaultBackendUrl).replace(/\/$/, "");
}

type BackendRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function backendRequest<TResponse>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<TResponse> {
  return (await backendRequestWithStatus<TResponse>(path, options)).data;
}

export async function backendRequestWithStatus<TResponse>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<{ data: TResponse; status: number }> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${getBackendUrl()}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : isFormData ? options.body as FormData : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Impossible de joindre l'API FormationAI.", 0);
  }

  if (!response.ok) {
    const problem = await readProblemDetails(response);
    throw new ApiError(
      getProblemMessage(problem, "La requete vers l'API a echoue."),
      response.status,
      problem,
    );
  }

  if (response.status === 204) {
    return { data: undefined as TResponse, status: response.status };
  }

  return { data: (await response.json()) as TResponse, status: response.status };
}
