"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { buttonClassName } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TrainingModulesList } from "@/components/modules/training-modules-list";
import { getTraining } from "@/lib/api/training-api";
import { getTrainingModules } from "@/lib/api/training-module-api";
import { getErrorMessage } from "@/lib/api/api-error";
import { trainingLevelLabels, trainingStatusLabels } from "@/lib/trainings/training-labels";
import type { Training } from "@/lib/trainings/training-types";
import type { TrainingModuleListItem } from "@/lib/modules/training-module-types";

export default function TrainingDetailsPage() {
  const params = useParams<{ id: string }>();
  const trainingId = useMemo(() => Number(params.id), [params.id]);
  const isInvalidTrainingId = Number.isNaN(trainingId);
  const [training, setTraining] = useState<Training | null>(null);
  const [modules, setModules] = useState<TrainingModuleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areModulesLoading, setAreModulesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [trainingItem, moduleItems] = await Promise.all([
          getTraining(trainingId),
          getTrainingModules(trainingId),
        ]);
        if (isMounted) {
          setTraining(trainingItem);
          setModules(moduleItems);
        }
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setAreModulesLoading(false);
        }
      }
    }

    if (!isInvalidTrainingId) void loadData();

    return () => {
      isMounted = false;
    };
  }, [isInvalidTrainingId, trainingId]);

  async function reloadModules() {
    setAreModulesLoading(true);
    setModulesError(null);

    try {
      setModules(await getTrainingModules(trainingId));
      setTraining(await getTraining(trainingId));
    } catch (loadError) {
      setModulesError(getErrorMessage(loadError));
    } finally {
      setAreModulesLoading(false);
    }
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Detail de la formation">
      <AdminNavigation />
      <div className="mb-5 flex flex-wrap gap-3">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href="/admin/trainings">
          Retour aux formations
        </Link>
        {!isInvalidTrainingId ? (
          <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href={`/admin/trainings/${trainingId}/edit`}>
            Modifier
          </Link>
        ) : null}
        {!isInvalidTrainingId ? (
          <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href={`/admin/trainings/${trainingId}/assistant`}>
            Tester l assistant IA
          </Link>
        ) : null}
      </div>
      {!isInvalidTrainingId && isLoading ? <LoadingSpinner label="Chargement de la formation" /> : null}
      <ErrorMessage message={isInvalidTrainingId ? "La formation demandee est invalide." : error} />
      {!isInvalidTrainingId && !isLoading && training ? (
        <div className="grid gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">{training.title}</h2>
            <p className="mt-2 text-sm text-slate-600">Slug : {training.slug}</p>
          </div>
          <dl className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold">Categorie</dt><dd>{training.categoryName}</dd></div>
            <div><dt className="font-semibold">Niveau</dt><dd>{trainingLevelLabels[training.level]}</dd></div>
            <div><dt className="font-semibold">Statut</dt><dd>{trainingStatusLabels[training.status]}</dd></div>
            <div><dt className="font-semibold">Duree</dt><dd>{training.durationHours} h</dd></div>
            <div><dt className="font-semibold">Prix</dt><dd>{training.price.toFixed(2)} {training.currency}</dd></div>
            <div><dt className="font-semibold">Modules</dt><dd>{training.modulesCount} module(s), {training.publishedModulesCount} publie(s)</dd></div>
          </dl>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-950">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{training.description || training.shortDescription || "Aucune description."}</p>
          </div>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" id="modules">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Modules</h3>
                <p className="mt-1 text-sm text-slate-600">Organisez le contenu pedagogique de cette formation.</p>
              </div>
              <Link className={buttonClassName({ variant: "success" })} href={`/admin/trainings/${trainingId}/modules/new`}>
                Ajouter un module
              </Link>
            </div>
            <ErrorMessage message={modulesError} />
            <TrainingModulesList
              isLoading={areModulesLoading}
              modules={modules}
              onModulesChange={setModules}
              onReload={reloadModules}
              trainingId={trainingId}
            />
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  );
}



