export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  problem?: ProblemDetails;

  constructor(message: string, status: number, problem?: ProblemDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

export function getProblemMessage(problem: ProblemDetails | undefined, fallback: string): string {
  if (!problem) {
    return fallback;
  }

  if (problem.errors) {
    const firstError = Object.values(problem.errors).flat()[0];
    if (firstError) {
      return firstError;
    }
  }

  return problem.detail || problem.title || fallback;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return getProblemMessage(error.problem, error.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}

export async function readProblemDetails(response: Response): Promise<ProblemDetails | undefined> {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return undefined;
  }

  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return undefined;
  }
}
