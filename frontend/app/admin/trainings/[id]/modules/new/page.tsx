"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TrainingModuleForm, toTrainingModulePayload } from "@/components/modules/training-module-form";
import { ErrorMessage } from "@/components/ui/error-message";
import { createTrainingModule } from "@/lib/api/training-module-api";
import { uploadModuleResource } from "@/lib/api/training-module-resource-api";
import type { TrainingModuleFormValues } from "@/lib/modules/training-module-types";

export default function NewTrainingModulePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const trainingId = useMemo(() => Number(params.id), [params.id]);
  const isInvalidTrainingId = Number.isNaN(trainingId);

  async function handleSubmit(values: TrainingModuleFormValues) {
    const createdModule = await createTrainingModule(trainingId, toTrainingModulePayload(values));
    await uploadPdfFiles(trainingId, createdModule.id, values.pdfFiles);
    router.replace(`/admin/trainings/${trainingId}#modules`);
  }

  return (
    <DashboardLayout expectedRole="Admin" title="Ajouter un module">
      <AdminNavigation />
      <div className="mb-1">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href={isInvalidTrainingId ? "/admin/trainings" : `/admin/trainings/${trainingId}#modules`}>
          Retour aux modules
        </Link>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-slate-950">Ajouter un module</h2>
        <ErrorMessage message={isInvalidTrainingId ? "La formation demandee est invalide." : null} />
        {!isInvalidTrainingId ? <TrainingModuleForm onSubmit={handleSubmit} submitLabel="Creer le module" /> : null}
      </div>
    </DashboardLayout>
  );
}

async function uploadPdfFiles(trainingId: number, moduleId: number, files: File[]) {
  try {
    for (const file of files) {
      await uploadModuleResource(trainingId, moduleId, getPdfTitle(file), file, () => undefined);
    }
  } catch (error) {
    console.error("Module created, but PDF upload failed.", error);
  }
}

function getPdfTitle(file: File): string {
  return file.name.replace(/\.pdf$/i, "").trim() || "Document PDF";
}
