import { apiRequest } from "@/lib/api/api-client";
import type { LearnerTraining, LearnerTrainingModule } from "@/lib/enrollments/enrollment-types";

export function getLearnerTraining(trainingId: number): Promise<LearnerTraining> {
  return apiRequest<LearnerTraining>(`/api/learner/trainings/${trainingId}`, { cache: "no-store" });
}

export function getLearnerTrainingModule(trainingId: number, moduleId: number): Promise<LearnerTrainingModule> {
  return apiRequest<LearnerTrainingModule>(
    `/api/learner/trainings/${trainingId}/modules/${moduleId}`,
    { cache: "no-store" },
  );
}
