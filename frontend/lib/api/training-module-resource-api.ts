import { apiRequest } from "@/lib/api/api-client";
import type { CreateTextResourcePayload, TrainingModuleResource, UpdateResourceStatusPayload } from "@/lib/modules/training-module-resource-types";

const resourcePath = (trainingId: number, moduleId: number) => `/api/trainings/${trainingId}/modules/${moduleId}/resources`;

export function getTrainingModuleResources(trainingId: number, moduleId: number) {
  return apiRequest<TrainingModuleResource[]>(resourcePath(trainingId, moduleId), { method: "GET", cache: "no-store" });
}

export function createTextResource(trainingId: number, moduleId: number, payload: CreateTextResourcePayload) {
  return apiRequest<TrainingModuleResource>(`${resourcePath(trainingId, moduleId)}/text`, { method: "POST", body: payload });
}

export function uploadModuleResource(trainingId: number, moduleId: number, title: string, file: File, onProgress: (progress: number) => void) {
  return new Promise<TrainingModuleResource>((resolve, reject) => {
    const data = new FormData();
    data.append("title", title);
    data.append("file", file);
    const request = new XMLHttpRequest();
    request.open("POST", `${resourcePath(trainingId, moduleId)}/upload`);
    request.responseType = "json";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve(request.response as TrainingModuleResource);
      else reject(new Error(request.response?.detail || request.response?.title || "L'import du document a echoue."));
    };
    request.onerror = () => reject(new Error("Impossible de joindre le serveur."));
    request.send(data);
  });
}

export function updateModuleResourceStatus(trainingId: number, moduleId: number, resourceId: number, payload: UpdateResourceStatusPayload) {
  return apiRequest<TrainingModuleResource>(`${resourcePath(trainingId, moduleId)}/${resourceId}/status`, { method: "PATCH", body: payload });
}

export function reprocessModuleResource(trainingId: number, moduleId: number, resourceId: number) {
  return apiRequest<TrainingModuleResource>(`${resourcePath(trainingId, moduleId)}/${resourceId}/reprocess`, { method: "POST" });
}

export function deleteModuleResource(trainingId: number, moduleId: number, resourceId: number) {
  return apiRequest<void>(`${resourcePath(trainingId, moduleId)}/${resourceId}`, { method: "DELETE" });
}
