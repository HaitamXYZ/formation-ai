import type { TrainingLevel, TrainingStatus } from "@/lib/trainings/training-types";

export const trainingLevelLabels: Record<TrainingLevel, string> = {
  Beginner: "Debutant",
  Intermediate: "Intermediaire",
  Advanced: "Avance",
  AllLevels: "Tous niveaux",
};

export const trainingStatusLabels: Record<TrainingStatus, string> = {
  Draft: "Brouillon",
  Published: "Publiee",
  Archived: "Archivee",
};

export const trainingLevels: TrainingLevel[] = ["Beginner", "Intermediate", "Advanced", "AllLevels"];

export const trainingStatuses: TrainingStatus[] = ["Draft", "Published", "Archived"];

export const currencies = ["EUR", "USD", "MAD"];
