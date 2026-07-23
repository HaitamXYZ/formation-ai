"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AITrainerChat } from "@/components/ai-trainer/ai-trainer-chat";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorMessage } from "@/components/ui/error-message";

export default function LearnerTrainingAITrainerPage() {
  const params = useParams<{ trainingId: string }>();
  const trainingId = useMemo(() => Number(params.trainingId), [params.trainingId]);
  const isInvalidTrainingId = Number.isNaN(trainingId);

  return (
    <DashboardLayout expectedRole="Learner" immersive title="Formateur IA">
      <ErrorMessage message={isInvalidTrainingId ? "La formation demandee est invalide." : null} />
      {!isInvalidTrainingId ? <AITrainerChat initialTrainingId={trainingId} /> : null}
    </DashboardLayout>
  );
}
