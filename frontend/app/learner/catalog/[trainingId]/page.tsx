"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCatalogTraining } from "@/lib/api/catalog-api";
import { enrollInTraining, getMyTrainings } from "@/lib/api/enrollment-api";
import { getErrorMessage } from "@/lib/api/api-error";
import { trainingLevelLabels } from "@/lib/trainings/training-labels";
import type { Training } from "@/lib/trainings/training-types";

export default function CatalogTrainingPage() {
  const params = useParams<{ trainingId: string }>();
  const trainingId = useMemo(() => Number(params.trainingId), [params.trainingId]);
  const [training, setTraining] = useState<Training | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(trainingId)) return;
    Promise.all([getCatalogTraining(trainingId), getMyTrainings()])
      .then(([item, enrollments]) => {
        setTraining(item);
        setIsEnrolled(enrollments.some((enrollment) => enrollment.trainingId === trainingId));
      })
      .catch((loadError) => setError(getErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, [trainingId]);

  async function handleEnroll() {
    setIsPending(true);
    try {
      await enrollInTraining(trainingId);
      setIsEnrolled(true);
    } catch (enrollError) {
      setError(getErrorMessage(enrollError));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <DashboardLayout expectedRole="Learner" title="Détail de la formation">
      <Link className="text-sm font-semibold text-indigo-700 hover:text-indigo-900" href="/learner/catalog">← Retour au catalogue</Link>
      {isLoading && Number.isInteger(trainingId) ? <LoadingSpinner label="Chargement de la formation" /> : null}
      <ErrorMessage message={!Number.isInteger(trainingId) ? "La formation demandée est invalide." : error} />
      {training ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Card>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">{training.categoryName}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{training.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{training.shortDescription}</p>
            <div className="mt-6 whitespace-pre-wrap leading-8 text-slate-700">{training.description || "Le détail pédagogique sera présenté dans les modules après votre inscription."}</div>
          </Card>
          <Card className="h-fit lg:sticky lg:top-24">
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-slate-500">Niveau</dt><dd className="font-semibold text-slate-950">{trainingLevelLabels[training.level]}</dd></div>
              <div><dt className="text-slate-500">Durée</dt><dd className="font-semibold text-slate-950">{training.durationHours} heures</dd></div>
              <div><dt className="text-slate-500">Modules publiés</dt><dd className="font-semibold text-slate-950">{training.publishedModulesCount}</dd></div>
            </dl>
            <div className="mt-6">
              {isEnrolled ? (
                <Link className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800" href={`/learner/trainings/${training.id}`}>Accéder à la formation</Link>
              ) : (
                <Button className="w-full" disabled={isPending} onClick={() => void handleEnroll()}>{isPending ? "Inscription..." : "S’inscrire à cette formation"}</Button>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

