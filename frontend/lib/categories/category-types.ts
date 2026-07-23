export type Category = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CategoryFormValues = {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

export type CreateCategoryRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
};

export type UpdateCategoryRequest = CreateCategoryRequest;

export type UpdateCategoryStatusRequest = {
  isActive: boolean;
};
