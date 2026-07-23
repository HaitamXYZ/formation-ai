export type UserRole = "Admin" | "Learner";

import type { TrainingStatus } from "@/lib/trainings/training-types";

export type AssignedTraining = {
  id: number;
  title: string;
  slug: string;
  status: TrainingStatus;
  categoryName: string;
};

export type UserListItem = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string;
  assignedTrainingsCount: number;
};

export type UserDetails = UserListItem & {
  assignedTrainings: AssignedTraining[];
};

export type UserFilters = {
  page: number;
  pageSize: number;
  search: string;
  role: string;
  isActive: string;
  sortBy: string;
  sortDirection: string;
};

export type PaginatedUsersResponse = {
  items: UserListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type UpdateUserStatusPayload = {
  isActive: boolean;
};

