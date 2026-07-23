"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TrainingForm, toTrainingPayload } from "@/components/trainings/training-form";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCategories } from "@/lib/api/category-api";
import { createTraining } from "@/lib/api/training-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Category } from "@/lib/categories/category-types";
import type { TrainingFormValues } from "@/lib/trainings/training-types";

export default function NewTrainingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((items) => { if (isMounted) setCategories(items.filter((category) => category.isActive)); })
      .catch((loadError) => { if (isMounted) setError(getErrorMessage(loadError)); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  async function handleSubmit(values: TrainingFormValues) {
    await createTraining(toTrainingPayload(values));
    router.replace("/admin/trainings");
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Nouvelle formation">
      <AdminNavigation />
      <div className="mb-5">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href="/admin/trainings">Retour aux formations</Link>
      </div>
      {isLoading ? <LoadingSpinner label="Chargement des options" /> : null}
      <ErrorMessage message={error} />
      {!isLoading && !error ? <TrainingForm onSubmit={handleSubmit} options={{ categories }} submitLabel="Creer la formation" /> : null}
    </DashboardLayout>
  );
}
