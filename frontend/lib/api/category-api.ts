import { apiRequest } from "@/lib/api/api-client";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
} from "@/lib/categories/category-types";

export function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/api/categories", {
    method: "GET",
    cache: "no-store",
  });
}

export function getCategory(id: number): Promise<Category> {
  return apiRequest<Category>(`/api/categories/${id}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  return apiRequest<Category>("/api/categories", {
    method: "POST",
    body: payload,
  });
}

export function updateCategory(id: number, payload: UpdateCategoryRequest): Promise<Category> {
  return apiRequest<Category>(`/api/categories/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function updateCategoryStatus(id: number, payload: UpdateCategoryStatusRequest): Promise<Category> {
  return apiRequest<Category>(`/api/categories/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteCategory(id: number): Promise<void> {
  return apiRequest<void>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}
