import { ApiError, getProblemMessage, readProblemDetails } from "@/lib/api/api-error";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(path, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : isFormData ? options.body as FormData : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur.", 0);
  }

  if (!response.ok) {
    const problem = await readProblemDetails(response);
    throw new ApiError(
      getProblemMessage(problem, "La requête a échoué."),
      response.status,
      problem,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
