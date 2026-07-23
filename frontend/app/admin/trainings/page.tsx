"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button, buttonClassName } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCategories } from "@/lib/api/category-api";
import {
  deleteTraining,
  getTrainings,
  updateTrainingFeatured,
  updateTrainingStatus,
} from "@/lib/api/training-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Category } from "@/lib/categories/category-types";
import { trainingLevelLabels, trainingLevels, trainingStatusLabels, trainingStatuses } from "@/lib/trainings/training-labels";
import type { PaginatedTrainingResponse, TrainingFilters, TrainingListItem, TrainingStatus } from "@/lib/trainings/training-types";

const initialFilters: TrainingFilters = {
  page: 1,
  pageSize: 10,
  search: "",
  categoryId: "",
  status: "",
  level: "",
  isFeatured: "",
  sortBy: "createdAt",
  sortDirection: "desc",
};

export default function AdminTrainingsPage() {
  const [response, setResponse] = useState<PaginatedTrainingResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TrainingFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      try {
        const categoryItems = await getCategories();
        if (isMounted) {
          setCategories(categoryItems);
        }
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      }
    }

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTrainings() {
      try {
        const items = await getTrainings(filters);
        if (isMounted) {
          setResponse(items);
        }
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadTrainings();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  function updateFilter(name: keyof TrainingFilters, value: string) {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  }

  async function refresh() {
    setIsLoading(true);
    setError(null);
    setResponse(await getTrainings(filters));
    setIsLoading(false);
  }

  async function handleStatus(training: TrainingListItem, status: TrainingStatus) {
    const confirmed = window.confirm(`Confirmer le changement de statut vers "${trainingStatusLabels[status]}" ?`);
    if (!confirmed) return;

    setPendingId(training.id);
    setFeedback(null);
    setError(null);

    try {
      await updateTrainingStatus(training.id, { status });
      await refresh();
      setFeedback("Statut mis a jour.");
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    } finally {
      setPendingId(null);
    }
  }

  async function handleFeatured(training: TrainingListItem) {
    setPendingId(training.id);
    setFeedback(null);
    setError(null);

    try {
      await updateTrainingFeatured(training.id, { isFeatured: !training.isFeatured });
      await refresh();
      setFeedback(training.isFeatured ? "Formation retiree de la mise en avant." : "Formation mise en avant.");
    } catch (featuredError) {
      setError(getErrorMessage(featuredError));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(training: TrainingListItem) {
    const confirmed = window.confirm(`Supprimer la formation "${training.title}" ?`);
    if (!confirmed) return;

    setPendingId(training.id);
    setFeedback(null);
    setError(null);

    try {
      await deleteTraining(training.id);
      await refresh();
      setFeedback("Formation supprimee.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Gestion des formations">
      <AdminNavigation />
      <div className="grid gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Formations</h2>
            <p className="mt-1 text-sm text-slate-600">Creez et administrez le catalogue de formations.</p>
          </div>
          <Link className={buttonClassName({ variant: "primary" })} href="/admin/trainings/new">
            Nouvelle formation
          </Link>
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
          <input className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("search", event.target.value)} placeholder="Recherche" value={filters.search} />
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("categoryId", event.target.value)} value={filters.categoryId}>
            <option value="">Toutes les categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("status", event.target.value)} value={filters.status}>
            <option value="">Tous les statuts</option>
            {trainingStatuses.map((status) => <option key={status} value={status}>{trainingStatusLabels[status]}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("level", event.target.value)} value={filters.level}>
            <option value="">Tous les niveaux</option>
            {trainingLevels.map((level) => <option key={level} value={level}>{trainingLevelLabels[level]}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("isFeatured", event.target.value)} value={filters.isFeatured}>
            <option value="">Mise en avant</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </div>

        {feedback ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}
        <ErrorMessage message={error} />

        {isLoading ? <LoadingSpinner label="Chargement des formations" /> : null}
        {!isLoading && response?.items.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">Aucune formation n&apos;a encore ete creee.</div>
        ) : null}
        {!isLoading && response && response.items.length > 0 ? (
          <>
            <div className="data-surface overflow-x-auto">
              <table className="w-full min-w-[1080px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Titre</th>
                    <th className="px-4 py-3">Categorie</th>
                    <th className="px-4 py-3">Niveau</th>
                    <th className="px-4 py-3">Prix</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {response.items.map((training) => (
                    <tr className="h-16 transition hover:bg-slate-50/70" key={training.id}>
                      <td className="px-4 py-3"><Thumbnail url={training.imageUrl} title={training.title} /></td>
                      <td className="px-4 py-3 font-semibold text-slate-950">{training.title}<div className="text-xs font-normal text-slate-500">{training.durationHours} h</div></td>
                      <td className="px-4 py-3 text-slate-600">{training.categoryName}</td>
                      <td className="px-4 py-3">{trainingLevelLabels[training.level]}</td>
                      <td className="px-4 py-3">{training.price.toFixed(2)} {training.currency}</td>
                      <td className="px-4 py-3"><StatusBadge status={training.status} featured={training.isFeatured} /></td>
                      <td className="w-[250px] px-4 py-3">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <Link className={buttonClassName({ variant: "outline", size: "sm" })} href={`/admin/trainings/${training.id}`}>Voir</Link>
                          <Link className={buttonClassName({ variant: "secondary", size: "sm" })} href={`/admin/trainings/${training.id}/edit`}>Modifier</Link>
                          <DropdownMenu
                            label={`Actions pour ${training.title}`}
                            items={[
                              { label: "Gerer les modules", href: `/admin/trainings/${training.id}#modules` },
                              { label: training.status === "Published" ? "Passer en brouillon" : "Publier", disabled: pendingId === training.id, onSelect: () => handleStatus(training, training.status === "Published" ? "Draft" : "Published") },
                              ...(training.status !== "Archived" ? [{ label: "Archiver", disabled: pendingId === training.id, onSelect: () => handleStatus(training, "Archived" as const) }] : []),
                              { label: training.isFeatured ? "Retirer de la vedette" : "Mettre en vedette", disabled: pendingId === training.id, onSelect: () => handleFeatured(training) },
                              { label: "Supprimer", danger: true, disabled: pendingId === training.id, onSelect: () => handleDelete(training) },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Page {response.page} sur {response.totalPages || 1} - {response.totalItems} formation(s)</span>
              <div className="flex gap-2">
                <Button size="sm" disabled={filters.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} variant="secondary">Precedent</Button>
                <Button size="sm" disabled={response.totalPages === 0 || filters.page >= response.totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} variant="secondary">Suivant</Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function Thumbnail({ url, title }: Readonly<{ url: string | null; title: string }>) {
  if (!url) return <span className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500">Image</span>;
  return <span aria-label={`Image de ${title}`} className="block h-12 w-16 rounded-md bg-cover bg-center" role="img" style={{ backgroundImage: `url(${url})` }} />;
}

function StatusBadge({ status, featured }: Readonly<{ status: TrainingStatus; featured: boolean }>) {
  return (
    <div className="flex flex-col gap-1">
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{trainingStatusLabels[status]}</span>
      {featured ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">En avant</span> : null}
    </div>
  );
}


