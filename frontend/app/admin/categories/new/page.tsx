"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryForm, toCategoryPayload } from "@/components/categories/category-form";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { createCategory } from "@/lib/api/category-api";
import type { CategoryFormValues } from "@/lib/categories/category-types";

export default function NewCategoryPage() {
  const router = useRouter();

  async function handleSubmit(values: CategoryFormValues) {
    await createCategory(toCategoryPayload(values));
    router.replace("/admin/categories");
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Nouvelle catégorie">
      <AdminNavigation />
      <div className="mb-5">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href="/admin/categories">
          Retour aux catégories
        </Link>
      </div>
      <CategoryForm onSubmit={handleSubmit} submitLabel="Créer la catégorie" />
    </DashboardLayout>
  );
}
