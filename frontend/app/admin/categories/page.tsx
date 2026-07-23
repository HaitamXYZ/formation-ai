"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { buttonClassName } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  deleteCategory,
  getCategories,
  updateCategoryStatus,
} from "@/lib/api/category-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Category } from "@/lib/categories/category-types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const items = await getCategories();
        if (isMounted) {
          setCategories(items);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStatus(category: Category) {
    setPendingId(category.id);
    setError(null);
    setFeedback(null);

    try {
      const updated = await updateCategoryStatus(category.id, { isActive: !category.isActive });
      setCategories((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setFeedback(updated.isActive ? "Catégorie réactivée." : "Catégorie désactivée.");
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(`Supprimer la catégorie "${category.name}" ?`);
    if (!confirmed) {
      return;
    }

    setPendingId(category.id);
    setError(null);
    setFeedback(null);

    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setFeedback("Catégorie supprimée.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Gestion des catégories">
      <AdminNavigation />
      <div className="grid gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Catégories de formations</h2>
            <p className="mt-1 text-sm text-slate-600">
              Organisez progressivement le catalogue de formations.
            </p>
          </div>
          <Link
            className={buttonClassName({ variant: "primary" })}
            href="/admin/categories/new"
          >
            Nouvelle catégorie
          </Link>
        </div>

        {feedback ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </div>
        ) : null}
        <ErrorMessage message={error} />

        {isLoading ? (
          <LoadingSpinner label="Chargement des catégories" />
        ) : categories.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Aucune catégorie n&apos;a encore été créée.
          </div>
        ) : (
          <div className="data-surface overflow-x-auto">
            <table className="w-full min-w-[920px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Créée le</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {categories.map((category) => (
                  <tr className="h-16 transition hover:bg-slate-50/70" key={category.id}>
                    <td className="px-4 py-3">
                      {category.imageUrl ? (
                        <span
                          aria-label={`Image de ${category.name}`}
                          className="block h-12 w-16 rounded-md bg-cover bg-center"
                          role="img"
                          style={{ backgroundImage: `url(${category.imageUrl})` }}
                        />
                      ) : (
                        <span className="text-slate-400">Aucune</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-950">{category.name}</td>
                    <td className="max-w-xs px-4 py-3 text-slate-600">
                      {category.description || "Aucune description"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          category.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(category.createdAt)}</td>
                    <td className="w-[180px] px-4 py-3">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <Link
                          className={buttonClassName({ variant: "outline", size: "sm" })}
                          href={`/admin/categories/${category.id}/edit`}
                        >
                          Modifier
                        </Link>
                        <DropdownMenu
                          label={`Actions pour ${category.name}`}
                          items={[
                            { label: category.isActive ? "Désactiver" : "Activer", disabled: pendingId === category.id, onSelect: () => handleStatus(category) },
                            { label: "Supprimer", danger: true, disabled: pendingId === category.id, onSelect: () => handleDelete(category) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

