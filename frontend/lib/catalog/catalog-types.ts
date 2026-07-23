import type { TrainingLevel } from "@/lib/trainings/training-types";

export type CatalogTraining = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  level: TrainingLevel;
  durationHours: number;
  price: number;
  currency: string;
  status: "Published";
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  publishedAt: string | null;
};

export type CatalogFilters = {
  page: number;
  pageSize: number;
  search: string;
  categoryId: string;
  level: string;
  sortBy: string;
  sortDirection: string;
};

export type CatalogResponse = {
  items: CatalogTraining[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AIUsageSummary = {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  resetsAtUtc: string;
  requestsPerMinute: number;
};

