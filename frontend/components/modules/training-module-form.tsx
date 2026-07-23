"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getErrorMessage } from "@/lib/api/api-error";
import type { TrainingModuleFormValues } from "@/lib/modules/training-module-types";

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

type TrainingModuleFormProps = {
  initialValues?: TrainingModuleFormValues;
  submitLabel: string;
  onSubmit: (values: TrainingModuleFormValues) => Promise<void>;
};

const emptyValues: TrainingModuleFormValues = {
  title: "",
  description: "",
  content: "",
  pdfFiles: [],
  estimatedDurationMinutes: "",
};

export function TrainingModuleForm({ initialValues = emptyValues, submitLabel, onSubmit }: TrainingModuleFormProps) {
  const [values, setValues] = useState<TrainingModuleFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationError = useMemo(() => validateTrainingModule(values), [values]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (submitError) {
      setError(toFrenchModuleError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />

      <FormField
        label="Titre"
        maxLength={150}
        name="title"
        onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        required
        type="text"
        value={values.title}
      />

      <label className="grid gap-2 text-sm font-semibold text-slate-800" htmlFor="description">
        Description
        <textarea
          className="min-h-36 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          id="description"
          maxLength={2000}
          name="description"
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          value={values.description}
        />
        <span className="text-xs font-normal text-slate-500">{values.description.length}/2000 caracteres</span>
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-800" htmlFor="pdfFiles">
        Base de connaissances PDF
        <span className="grid min-h-[56px] cursor-pointer gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-3 text-sm font-normal text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50">
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate">
              {values.pdfFiles.length > 0 ? `${values.pdfFiles.length} fichier(s) selectionne(s)` : "Choisir un ou plusieurs fichiers PDF"}
            </span>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">PDF</span>
          </span>
          {values.pdfFiles.length > 0 ? (
            <span className="grid gap-1 text-xs text-slate-500">
              {values.pdfFiles.map((file) => (
                <span className="truncate" key={`${file.name}-${file.size}-${file.lastModified}`}>{file.name}</span>
              ))}
            </span>
          ) : null}
        </span>
        <input
          id="pdfFiles"
          name="pdfFiles"
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          multiple
          onChange={(event) => setValues((current) => ({ ...current, pdfFiles: Array.from(event.target.files ?? []) }))}
        />
        <span className="text-xs font-normal text-slate-500">Optionnel, 10 Mo maximum par fichier.</span>
      </label>

      <FormField
        label="Duree estimee en minutes"
        max={100000}
        min={1}
        name="estimatedDurationMinutes"
        onChange={(event) => setValues((current) => ({ ...current, estimatedDurationMinutes: event.target.value }))}
        type="number"
        value={values.estimatedDurationMinutes}
      />

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? <LoadingSpinner label="Enregistrement" /> : submitLabel}
      </Button>
    </form>
  );
}

export function toTrainingModulePayload(values: TrainingModuleFormValues) {
  const duration = values.estimatedDurationMinutes.trim();

  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    content: values.content.trim() || null,
    estimatedDurationMinutes: duration ? Number(duration) : null,
  };
}

function validateTrainingModule(values: TrainingModuleFormValues): string | null {
  if (!values.title.trim()) return "Le titre est obligatoire.";
  if (values.title.length > 150) return "Le titre ne peut pas depasser 150 caracteres.";
  if (values.description.length > 2000) return "La description ne peut pas depasser 2000 caracteres.";

  for (const file of values.pdfFiles) {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return `Le fichier "${file.name}" doit etre un PDF.`;
    if (file.size > MAX_PDF_SIZE_BYTES) return `Le fichier "${file.name}" ne peut pas depasser 10 Mo.`;
  }

  if (values.estimatedDurationMinutes.trim()) {
    const duration = Number(values.estimatedDurationMinutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 100000) {
      return "La duree estimee doit etre comprise entre 1 et 100000 minutes.";
    }
  }

  return null;
}

function toFrenchModuleError(error: unknown): string {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();

  if (lower.includes("archived")) return "Un module ne peut pas etre publie lorsque la formation est archivee.";
  if (lower.includes("title")) return "Le titre du module est obligatoire.";
  if (lower.includes("training")) return "La formation associee est introuvable.";
  if (lower.includes("forbidden")) return "Vous n'avez pas les droits necessaires pour cette action.";

  return message;
}
