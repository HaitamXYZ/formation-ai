import { apiRequest } from "@/lib/api/api-client";
import type { CatalogFilters, CatalogResponse } from "@/lib/catalog/catalog-types";
import type { Training } from "@/lib/trainings/training-types";

export function getCatalogTrainings(filters: CatalogFilters): Promise<CatalogResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "") params.set(key, String(value));
  });
  return apiRequest<CatalogResponse>(`/api/catalog/trainings?${params.toString()}`, {
    cache: "no-store",
  });
}

export function getCatalogTraining(id: number): Promise<Training> {
  return apiRequest<Training>(`/api/catalog/trainings/${id}`, { cache: "no-store" });
}
