"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TrainingModuleForm, toTrainingModulePayload } from "@/components/modules/training-module-form";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getErrorMessage } from "@/lib/api/api-error";
import { getTrainingModule, updateTrainingModule } from "@/lib/api/training-module-api";
import { uploadModuleResource } from "@/lib/api/training-module-resource-api";
import type { TrainingModule, TrainingModuleFormValues } from "@/lib/modules/training-module-types";

export default function EditTrainingModulePage() {
  const router = useRouter();
  const params = useParams<{ id: string; moduleId: string }>();
  const trainingId = useMemo(() => Number(params.id), [params.id]);
  const moduleId = useMemo(() => Number(params.moduleId), [params.moduleId]);
  const isInvalidRoute = Number.isNaN(trainingId) || Number.isNaN(moduleId);
  const [module, setModule] = useState<TrainingModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadModule() {
      try {
        const item = await getTrainingModule(trainingId, moduleId);
        if (isMounted) setModule(item);
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!isInvalidRoute) void loadModule();

    return () => {
      isMounted = false;
    };
  }, [isInvalidRoute, moduleId, trainingId]);

  async function handleSubmit(values: TrainingModuleFormValues) {
    await updateTrainingModule(trainingId, moduleId, toTrainingModulePayload(values));
    await uploadPdfFiles(trainingId, moduleId, values.pdfFiles);
    router.replace(`/admin/trainings/${trainingId}#modules`);
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Modifier le module">
      <AdminNavigation />
      <div className="mb-1">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href={isInvalidRoute ? "/admin/trainings" : `/admin/trainings/${trainingId}#modules`}>
          Retour aux modules
        </Link>
      </div>
      {isLoading && !isInvalidRoute ? <LoadingSpinner label="Chargement du module" /> : null}
      <ErrorMessage message={isInvalidRoute ? "Le module demande est invalide." : error} />
      {!isInvalidRoute && !isLoading && module ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-950">Modifier le module</h2>
          <TrainingModuleForm
            initialValues={{
              title: module.title,
              description: module.description ?? "",
              content: module.content ?? "",
              pdfFiles: [],
              estimatedDurationMinutes: module.estimatedDurationMinutes ? String(module.estimatedDurationMinutes) : "",
            }}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
          />
        </div>
      ) : null}
    </DashboardLayout>
  );
}

async function uploadPdfFiles(trainingId: number, moduleId: number, files: File[]) {
  try {
    for (const file of files) {
      await uploadModuleResource(trainingId, moduleId, getPdfTitle(file), file, () => undefined);
    }
  } catch (error) {
    console.error("Module saved, but PDF upload failed.", error);
  }
}

function getPdfTitle(file: File): string {
  return file.name.replace(/\.pdf$/i, "").trim() || "Document PDF";
}
