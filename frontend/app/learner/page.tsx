"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyTrainings } from "@/lib/api/enrollment-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { EnrollmentListItem } from "@/lib/enrollments/enrollment-types";

export default function LearnerPage() {
  const [items, setItems] = useState<EnrollmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyTrainings()
      .then(setItems)
      .catch((loadError) => setError(getErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardLayout expectedRole="Learner" title="Mon espace">
      <PageHeader
        eyebrow="Bonjour"
        title="Apprenez à votre rythme"
        description="Vos contenus et votre formateur IA vocal sont réunis dans un espace clair et sécurisé."
        actions={<Link className="inline-flex min-h-11 items-center rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white" href="/learner/catalog">Explorer le catalogue</Link>}
      />
      <ErrorMessage message={error} />
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950">Reprendre une formation</h2>
          {items.length > 0 ? <Link className="text-sm font-semibold text-indigo-700" href="/learner/trainings">Tout voir</Link> : null}
        </div>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
        ) : items.length === 0 ? (
          <EmptyState title="Commencez votre parcours" description="Vous n’avez encore aucune inscription active. Le catalogue présente les formations publiées disponibles." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.slice(0, 3).map((item) => (
              <Card className="interactive-card" key={item.id}>
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{item.categoryName}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">{item.trainingTitle}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.modulesCount} module{item.modulesCount > 1 ? "s" : ""} disponible{item.modulesCount > 1 ? "s" : ""}</p>
                <Link className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white" href={`/learner/trainings/${item.trainingId}`}>Continuer</Link>
              </Card>
            ))}
          </div>
        )}
      </section>
      <Card className="overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-950 text-white">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Conversation réelle</p>
          <h2 className="mt-3 text-2xl font-bold">Posez vos questions à l’oral</h2>
          <p className="mt-3 leading-7 text-slate-300">Dans chaque module, démarrez le formateur vocal, autorisez le microphone et échangez avec l’avatar Anam à partir du contenu pédagogique.</p>
        </div>
      </Card>
    </DashboardLayout>
  );
}
