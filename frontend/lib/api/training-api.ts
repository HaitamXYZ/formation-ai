import { apiRequest } from "@/lib/api/api-client";
import type {
  CreateTrainingRequest,
  PaginatedTrainingResponse,
  Training,
  TrainingFilters,
  UpdateTrainingFeaturedRequest,
  UpdateTrainingRequest,
  UpdateTrainingStatusRequest,
} from "@/lib/trainings/training-types";

export function getTrainings(filters: TrainingFilters): Promise<PaginatedTrainingResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, String(value));
    }
  });

  return apiRequest<PaginatedTrainingResponse>(`/api/trainings?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function getTraining(id: number): Promise<Training> {
  return apiRequest<Training>(`/api/trainings/${id}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function createTraining(payload: CreateTrainingRequest): Promise<Training> {
  return apiRequest<Training>("/api/trainings", {
    method: "POST",
    body: payload,
  });
}

export function updateTraining(id: number, payload: UpdateTrainingRequest): Promise<Training> {
  return apiRequest<Training>(`/api/trainings/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function updateTrainingStatus(id: number, payload: UpdateTrainingStatusRequest): Promise<Training> {
  return apiRequest<Training>(`/api/trainings/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function updateTrainingFeatured(id: number, payload: UpdateTrainingFeaturedRequest): Promise<Training> {
  return apiRequest<Training>(`/api/trainings/${id}/featured`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteTraining(id: number): Promise<void> {
  return apiRequest<void>(`/api/trainings/${id}`, {
    method: "DELETE",
  });
}

