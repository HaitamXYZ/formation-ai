"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getErrorMessage } from "@/lib/api/api-error";
import type { CategoryFormValues } from "@/lib/categories/category-types";

type CategoryFormProps = {
  initialValues?: CategoryFormValues;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

const emptyValues: CategoryFormValues = {
  name: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

export function CategoryForm({ initialValues = emptyValues, submitLabel, onSubmit }: CategoryFormProps) {
  const [values, setValues] = useState<CategoryFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationError = useMemo(() => {
    if (!values.name.trim()) {
      return "Le nom est obligatoire.";
    }

    if (values.name.length > 100) {
      return "Le nom ne peut pas dépasser 100 caractères.";
    }

    if (values.description.length > 500) {
      return "La description ne peut pas dépasser 500 caractères.";
    }

    if (values.imageUrl.length > 500) {
      return "L'URL de l'image ne peut pas dépasser 500 caractères.";
    }

    if (values.imageUrl.trim()) {
      try {
        new URL(values.imageUrl);
      } catch {
        return "L'URL de l'image doit être valide.";
      }
    }

    return null;
  }, [values]);

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
      setError(toFrenchCategoryError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />

      <div className="grid gap-2">
        <FormField
          label="Nom"
          maxLength={100}
          name="name"
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          required
          type="text"
          value={values.name}
        />
        <p className="text-xs text-slate-500">{values.name.length}/100 caractères</p>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="description">
        Description
        <textarea
          className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
          id="description"
          maxLength={500}
          name="description"
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          value={values.description}
        />
        <span className="text-xs font-normal text-slate-500">{values.description.length}/500 caractères</span>
      </label>

      <div className="grid gap-2">
        <FormField
          label="URL de l'image"
          maxLength={500}
          name="imageUrl"
          onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))}
          type="url"
          value={values.imageUrl}
        />
        <p className="text-xs text-slate-500">{values.imageUrl.length}/500 caractères</p>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-slate-800" htmlFor="isActive">
        <input
          checked={values.isActive}
          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
          id="isActive"
          name="isActive"
          onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))}
          type="checkbox"
        />
        Catégorie active
      </label>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? <LoadingSpinner label="Enregistrement" /> : submitLabel}
      </Button>
    </form>
  );
}

export function toCategoryPayload(values: CategoryFormValues) {
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    imageUrl: values.imageUrl.trim() || null,
    isActive: values.isActive,
  };
}

function toFrenchCategoryError(error: unknown): string {
  const message = getErrorMessage(error);

  if (message.toLowerCase().includes("same name")) {
    return "Une catégorie portant ce nom existe déjà.";
  }

  if (message.toLowerCase().includes("not found")) {
    return "La catégorie demandée est introuvable.";
  }

  if (message.toLowerCase().includes("forbidden")) {
    return "Vous n'avez pas les droits nécessaires pour cette action.";
  }

  return message;
}
