import type { Category } from "@/lib/categories/category-types";

export type TrainingLevel = "Beginner" | "Intermediate" | "Advanced" | "AllLevels";

export type TrainingStatus = "Draft" | "Published" | "Archived";

export type TrainingListItem = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  level: TrainingLevel;
  durationHours: number;
  price: number;
  currency: string;
  status: TrainingStatus;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  publishedAt: string | null;
};

export type Training = TrainingListItem & {
  description: string | null;
  modulesCount: number;
  publishedModulesCount: number;
  updatedAt: string | null;
};

export type PaginatedTrainingResponse = {
  items: TrainingListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type TrainingFilters = {
  page: number;
  pageSize: number;
  search: string;
  categoryId: string;
  status: string;
  level: string;
  isFeatured: string;
  sortBy: string;
  sortDirection: string;
};

export type TrainingFormValues = {
  categoryId: string;
  title: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  level: TrainingLevel;
  durationHours: string;
  price: string;
  currency: string;
  isFeatured: boolean;
};

export type TrainingFormOptions = {
  categories: Category[];
};

export type CreateTrainingRequest = {
  categoryId: number;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  level: TrainingLevel;
  durationHours: number;
  price: number;
  currency: string;
  isFeatured: boolean;
};

export type UpdateTrainingRequest = CreateTrainingRequest;

export type UpdateTrainingStatusRequest = {
  status: TrainingStatus;
};

export type UpdateTrainingFeaturedRequest = {
  isFeatured: boolean;
};
