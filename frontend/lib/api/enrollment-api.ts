import { apiRequest } from "@/lib/api/api-client";
import type { Enrollment, EnrollmentListItem } from "@/lib/enrollments/enrollment-types";

export function enrollInTraining(trainingId: number): Promise<Enrollment> {
  return apiRequest<Enrollment>(`/api/trainings/${trainingId}/enroll`, { method: "POST" });
}

export function cancelEnrollment(trainingId: number): Promise<void> {
  return apiRequest<void>(`/api/trainings/${trainingId}/enrollment`, { method: "DELETE" });
}

export function getMyTrainings(): Promise<EnrollmentListItem[]> {
  return apiRequest<EnrollmentListItem[]>("/api/learner/trainings", { cache: "no-store" });
}
