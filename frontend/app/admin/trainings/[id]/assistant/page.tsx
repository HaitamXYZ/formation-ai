"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AITrainerChat } from "@/components/ai-trainer/ai-trainer-chat";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorMessage } from "@/components/ui/error-message";

export default function AdminTrainingAITrainerPage() {
  const params = useParams<{ id: string }>();
  const trainingId = useMemo(() => Number(params.id), [params.id]);
  const isInvalidTrainingId = Number.isNaN(trainingId);

  return (
    <DashboardLayout expectedRole="Admin" immersive title="Tester le formateur IA">
      <AdminNavigation />
      <div className="mb-5">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href={isInvalidTrainingId ? "/admin/trainings" : `/admin/trainings/${trainingId}`}>
          Retour a la formation
        </Link>
      </div>
      <ErrorMessage message={isInvalidTrainingId ? "La formation demandee est invalide." : null} />
      {!isInvalidTrainingId ? <AITrainerChat initialTrainingId={trainingId} /> : null}
    </DashboardLayout>
  );
}
