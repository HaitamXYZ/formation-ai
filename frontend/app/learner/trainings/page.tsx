"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cancelEnrollment, getMyTrainings } from "@/lib/api/enrollment-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { EnrollmentListItem } from "@/lib/enrollments/enrollment-types";

export default function MyTrainingsPage() {
  const [items, setItems] = useState<EnrollmentListItem[]>([]);
  const [toCancel, setToCancel] = useState<EnrollmentListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyTrainings()
      .then(setItems)
      .catch((loadError) => setError(getErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, []);

  async function confirmCancel() {
    if (!toCancel) return;
    setIsCancelling(true);
    setError(null);
    try {
      await cancelEnrollment(toCancel.trainingId);
      setItems((current) => current.filter((item) => item.id !== toCancel.id));
      setToCancel(null);
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <DashboardLayout expectedRole="Learner" title="Mes formations">
      <PageHeader
        eyebrow="Votre parcours"
        title="Mes formations"
        description="Retrouvez uniquement vos inscriptions actives et reprenez le contenu là où vous le souhaitez."
        actions={<Link className="inline-flex min-h-11 items-center rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800" href="/learner/catalog">Explorer le catalogue</Link>}
      />
      <ErrorMessage message={error} />
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton className="h-80" key={index} />)}</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Aucune formation active"
          description="Inscrivez-vous à une formation publiée pour accéder aux modules et au formateur IA."
          action={<Link className="inline-flex min-h-11 items-center rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white" href="/learner/catalog">Voir le catalogue</Link>}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4">
          {items.map((item) => (
            <Card className="interactive-card flex h-full flex-col overflow-hidden p-0" key={item.id}>
              <div
                className="aspect-[16/9] bg-gradient-to-br from-slate-950 via-indigo-900 to-cyan-700 bg-cover bg-center"
                role="img"
                aria-label={`Illustration de ${item.trainingTitle}`}
                style={item.trainingImageUrl ? { backgroundImage: `url("${item.trainingImageUrl}")` } : undefined}
              />
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{item.categoryName}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">{item.trainingTitle}</h2>
                <dl className="mt-5 grid gap-2 text-sm text-slate-600">
                  <div className="flex justify-between gap-3"><dt>Inscrit le</dt><dd className="font-semibold text-slate-800">{formatDate(item.enrolledAt)}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Dernier accès</dt><dd className="font-semibold text-slate-800">{item.lastAccessedAt ? formatDate(item.lastAccessedAt) : "Pas encore"}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Contenu</dt><dd className="font-semibold text-slate-800">{item.modulesCount} module{item.modulesCount > 1 ? "s" : ""}</dd></div>
                </dl>
                <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-[1fr_auto]">
                  <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800" href={`/learner/trainings/${item.trainingId}`}>Continuer la formation</Link>
                  <Button aria-label={`Annuler l'inscription à ${item.trainingTitle}`} onClick={() => setToCancel(item)} variant="ghost">Annuler</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        confirmLabel="Annuler mon inscription"
        description={toCancel ? `Vous perdrez immédiatement l’accès au contenu privé et au formateur IA de « ${toCancel.trainingTitle} ». Votre historique d’inscription sera conservé.` : ""}
        isPending={isCancelling}
        onCancel={() => setToCancel(null)}
        onConfirm={() => void confirmCancel()}
        open={toCancel !== null}
        title="Confirmer l’annulation"
      />
    </DashboardLayout>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}
