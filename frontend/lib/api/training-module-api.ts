import { apiRequest } from "@/lib/api/api-client";
import type {
  CreateTrainingModulePayload,
  ReorderTrainingModulesPayload,
  TrainingModule,
  TrainingModuleListItem,
  UpdateTrainingModulePayload,
  UpdateTrainingModuleStatusPayload,
} from "@/lib/modules/training-module-types";

export function getTrainingModules(trainingId: number): Promise<TrainingModuleListItem[]> {
  return apiRequest<TrainingModuleListItem[]>(`/api/trainings/${trainingId}/modules`, {
    method: "GET",
    cache: "no-store",
  });
}

export function getTrainingModule(trainingId: number, moduleId: number): Promise<TrainingModule> {
  return apiRequest<TrainingModule>(`/api/trainings/${trainingId}/modules/${moduleId}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function createTrainingModule(trainingId: number, payload: CreateTrainingModulePayload): Promise<TrainingModule> {
  return apiRequest<TrainingModule>(`/api/trainings/${trainingId}/modules`, {
    method: "POST",
    body: payload,
  });
}

export function updateTrainingModule(trainingId: number, moduleId: number, payload: UpdateTrainingModulePayload): Promise<TrainingModule> {
  return apiRequest<TrainingModule>(`/api/trainings/${trainingId}/modules/${moduleId}`, {
    method: "PUT",
    body: payload,
  });
}

export function updateTrainingModuleStatus(trainingId: number, moduleId: number, payload: UpdateTrainingModuleStatusPayload): Promise<TrainingModule> {
  return apiRequest<TrainingModule>(`/api/trainings/${trainingId}/modules/${moduleId}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function reorderTrainingModules(trainingId: number, payload: ReorderTrainingModulesPayload): Promise<TrainingModuleListItem[]> {
  return apiRequest<TrainingModuleListItem[]>(`/api/trainings/${trainingId}/modules/reorder`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteTrainingModule(trainingId: number, moduleId: number): Promise<void> {
  return apiRequest<void>(`/api/trainings/${trainingId}/modules/${moduleId}`, {
    method: "DELETE",
  });
}
