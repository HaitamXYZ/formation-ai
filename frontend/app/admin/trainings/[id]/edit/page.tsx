"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { TrainingForm, toTrainingPayload } from "@/components/trainings/training-form";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCategories } from "@/lib/api/category-api";
import { getTraining, updateTraining } from "@/lib/api/training-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Category } from "@/lib/categories/category-types";
import type { Training, TrainingFormValues } from "@/lib/trainings/training-types";

export default function EditTrainingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const trainingId = Number(params.id);
  const [training, setTraining] = useState<Training | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getTraining(trainingId), getCategories()])
      .then(([trainingItem, categoryItems]) => {
        if (!isMounted) return;
        setTraining(trainingItem);
        setCategories(categoryItems);
      })
      .catch((loadError) => { if (isMounted) setError(getErrorMessage(loadError)); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [trainingId]);

  const initialValues = useMemo<TrainingFormValues | null>(() => training ? ({
    categoryId: String(training.categoryId),
    title: training.title,
    shortDescription: training.shortDescription ?? "",
    description: training.description ?? "",
    imageUrl: training.imageUrl ?? "",
    level: training.level,
    durationHours: String(training.durationHours),
    price: String(training.price),
    currency: training.currency,
    isFeatured: training.isFeatured,
  }) : null, [training]);

  async function handleSubmit(values: TrainingFormValues) {
    await updateTraining(trainingId, toTrainingPayload(values));
    router.replace(`/admin/trainings/${trainingId}`);
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Modifier la formation">
      <AdminNavigation />
      <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href={`/admin/trainings/${trainingId}`}>Retour au detail</Link>
      {isLoading ? <LoadingSpinner label="Chargement de la formation" /> : null}
      <ErrorMessage message={error} />
      {!isLoading && initialValues ? <TrainingForm initialValues={initialValues} onSubmit={handleSubmit} options={{ categories }} submitLabel="Enregistrer" /> : null}
    </DashboardLayout>
  );
}
