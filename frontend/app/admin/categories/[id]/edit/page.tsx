"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CategoryForm, toCategoryPayload } from "@/components/categories/category-form";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCategory, updateCategory } from "@/lib/api/category-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Category, CategoryFormValues } from "@/lib/categories/category-types";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categoryId = useMemo(() => Number(params.id), [params.id]);
  const isInvalidCategoryId = Number.isNaN(categoryId);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategory() {
      setIsLoading(true);
      setError(null);

      try {
        setCategory(await getCategory(categoryId));
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    }

    if (isInvalidCategoryId) {
      return;
    }

    void loadCategory();
  }, [categoryId, isInvalidCategoryId]);

  async function handleSubmit(values: CategoryFormValues) {
    await updateCategory(categoryId, toCategoryPayload(values));
    router.replace("/admin/categories");
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Modifier une catégorie">
      <AdminNavigation />
      <div className="mb-5">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href="/admin/categories">
          Retour aux catégories
        </Link>
      </div>

      {!isInvalidCategoryId && isLoading ? <LoadingSpinner label="Chargement de la catégorie" /> : null}
      <ErrorMessage message={isInvalidCategoryId ? "La catégorie demandée est invalide." : error} />

      {!isInvalidCategoryId && !isLoading && category ? (
        <CategoryForm
          initialValues={{
            name: category.name,
            description: category.description ?? "",
            imageUrl: category.imageUrl ?? "",
            isActive: category.isActive,
          }}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer les modifications"
        />
      ) : null}
    </DashboardLayout>
  );
}
