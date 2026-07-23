"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalogTrainings } from "@/lib/api/catalog-api";
import { enrollInTraining, getMyTrainings } from "@/lib/api/enrollment-api";
import { getCategories } from "@/lib/api/category-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { CatalogFilters, CatalogResponse } from "@/lib/catalog/catalog-types";
import type { Category } from "@/lib/categories/category-types";
import { trainingLevelLabels, trainingLevels } from "@/lib/trainings/training-labels";

const initialFilters: CatalogFilters = {
  page: 1,
  pageSize: 12,
  search: "",
  categoryId: "",
  level: "",
  sortBy: "title",
  sortDirection: "asc",
};

export default function LearnerCatalogPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [response, setResponse] = useState<CatalogResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getCatalogTrainings(filters), getMyTrainings(), getCategories()])
      .then(([catalog, enrollments, categoryItems]) => {
        if (!active) return;
        setResponse(catalog);
        setEnrolledIds(new Set(enrollments.map((item) => item.trainingId)));
        setCategories(categoryItems.filter((item) => item.isActive));
      })
      .catch((loadError) => active && setError(getErrorMessage(loadError)))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [filters]);

  const resultLabel = useMemo(
    () => response ? `${response.totalItems} formation${response.totalItems > 1 ? "s" : ""}` : "",
    [response],
  );

  async function handleEnroll(trainingId: number) {
    setPendingId(trainingId);
    setError(null);
    try {
      await enrollInTraining(trainingId);
      setEnrolledIds((current) => new Set(current).add(trainingId));
    } catch (enrollError) {
      setError(getErrorMessage(enrollError));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <DashboardLayout expectedRole="Learner" title="Catalogue">
      <PageHeader
        eyebrow="Explorez"
        title="Catalogue des formations"
      />

      <Card className="grid gap-4 lg:grid-cols-[1fr_220px_190px_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Rechercher
          <input
            className="min-h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            placeholder="Titre ou sujet"
            value={filters.search}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Catégorie
          <select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3" onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value, page: 1 }))} value={filters.categoryId}>
            <option value="">Toutes</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Niveau
          <select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3" onChange={(event) => setFilters((current) => ({ ...current, level: event.target.value, page: 1 }))} value={filters.level}>
            <option value="">Tous</option>
            {trainingLevels.map((level) => <option key={level} value={level}>{trainingLevelLabels[level]}</option>)}
          </select>
        </label>
        <p className="pb-3 text-sm font-semibold text-slate-500" aria-live="polite">{resultLabel}</p>
      </Card>

      <ErrorMessage message={error} />
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton className="h-[420px]" key={index} />)}</div>
      ) : response?.items.length === 0 ? (
        <EmptyState title="Aucune formation trouvée" description="Modifiez vos critères pour afficher les formations publiées disponibles." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4">
          {response?.items.map((training) => {
            const enrolled = enrolledIds.has(training.id);
            return (
              <Card className="interactive-card flex h-full flex-col overflow-hidden p-0" key={training.id}>
                <div
                  aria-label={`Illustration de ${training.title}`}
                  className="aspect-[16/10] bg-gradient-to-br from-indigo-900 via-indigo-700 to-cyan-600 bg-cover bg-center"
                  role="img"
                  style={training.imageUrl ? { backgroundImage: `linear-gradient(rgba(15,23,42,.08),rgba(15,23,42,.2)),url("${training.imageUrl}")` } : undefined}
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-indigo-700">
                    <span>{training.categoryName}</span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1">{trainingLevelLabels[training.level]}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-slate-950">{training.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{training.shortDescription || "Découvrez le programme détaillé de cette formation."}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div className="text-right"><dt className="sr-only">Durée</dt><dd>{training.durationHours} h</dd></div>
                  </dl>
                  <p className="mt-3 text-lg font-bold text-slate-950">{training.price === 0 ? "Gratuite" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: training.currency }).format(training.price)}</p>
                  <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" href={`/learner/catalog/${training.id}`}>Voir la formation</Link>
                    {enrolled ? (
                      <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-700 px-3 text-sm font-semibold text-white hover:bg-indigo-800" href={`/learner/trainings/${training.id}`}>Accéder</Link>
                    ) : (
                      <Button disabled={pendingId === training.id} onClick={() => void handleEnroll(training.id)}>{pendingId === training.id ? "Inscription..." : "S’inscrire"}</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {response && response.totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">Page {response.page} sur {response.totalPages}</p>
          <div className="flex gap-2">
            <Button disabled={response.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} variant="secondary">Précédent</Button>
            <Button disabled={response.page >= response.totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} variant="secondary">Suivant</Button>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

