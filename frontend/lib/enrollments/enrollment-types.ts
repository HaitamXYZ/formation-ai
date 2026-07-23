import type { TrainingLevel } from "@/lib/trainings/training-types";

export type EnrollmentStatus = "Active" | "Cancelled";

export type Enrollment = {
  id: number;
  trainingId: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  updatedAt: string | null;
  lastAccessedAt: string | null;
};

export type EnrollmentListItem = {
  id: number;
  trainingId: number;
  trainingTitle: string;
  trainingSlug: string;
  trainingImageUrl: string | null;
  categoryName: string;
  level: TrainingLevel;
  durationHours: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  lastAccessedAt: string | null;
  modulesCount: number;
};

export type LearnerTrainingModule = {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  documentUrl: string | null;
  orderIndex: number;
  estimatedDurationMinutes: number | null;
  isPublished: boolean;
};

export type LearnerTraining = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  categoryName: string;
  level: TrainingLevel;
  durationHours: number;
  modules: LearnerTrainingModule[];
  enrollment: Enrollment;
};

