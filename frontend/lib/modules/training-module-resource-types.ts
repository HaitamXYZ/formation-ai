export type TrainingModuleResourceType = "Text" | "Pdf" | "Docx" | "Txt" | "Markdown";
export type TrainingModuleResourceStatus = "Pending" | "Processing" | "Ready" | "Failed";

export type TrainingModuleResource = {
  id: number;
  trainingModuleId: number;
  title: string;
  resourceType: TrainingModuleResourceType;
  originalFileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  textContent: string | null;
  extractedText: string | null;
  processingStatus: TrainingModuleResourceStatus;
  processingError: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateTextResourcePayload = { title: string; textContent: string };
export type UpdateResourceStatusPayload = { isActive: boolean };
