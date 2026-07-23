export type TrainingModuleListItem = {
  id: number;
  trainingId: number;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  documentUrl: string | null;
  orderIndex: number;
  isPublished: boolean;
  estimatedDurationMinutes: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type TrainingModule = TrainingModuleListItem & {
  trainingTitle: string;
};

export type CreateTrainingModulePayload = {
  title: string;
  description?: string | null;
  content?: string | null;
  estimatedDurationMinutes?: number | null;
};

export type UpdateTrainingModulePayload = CreateTrainingModulePayload;

export type UpdateTrainingModuleStatusPayload = {
  isPublished: boolean;
};

export type ReorderTrainingModuleItem = {
  moduleId: number;
  orderIndex: number;
};

export type ReorderTrainingModulesPayload = {
  items: ReorderTrainingModuleItem[];
};

export type TrainingModuleFormValues = {
  title: string;
  description: string;
  content: string;
  pdfFiles: File[];
  estimatedDurationMinutes: string;
};



