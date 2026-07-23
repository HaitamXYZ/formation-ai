"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getErrorMessage } from "@/lib/api/api-error";
import { currencies, trainingLevelLabels, trainingLevels } from "@/lib/trainings/training-labels";
import type { TrainingFormOptions, TrainingFormValues, TrainingLevel } from "@/lib/trainings/training-types";

type TrainingFormProps = {
  initialValues?: TrainingFormValues;
  options: TrainingFormOptions;
  submitLabel: string;
  onSubmit: (values: TrainingFormValues) => Promise<void>;
};

const emptyValues: TrainingFormValues = {
  categoryId: "",
  title: "",
  shortDescription: "",
  description: "",
  imageUrl: "",
  level: "AllLevels",
  durationHours: "1",
  price: "0",
  currency: "EUR",
  isFeatured: false,
};

export function TrainingForm({ initialValues = emptyValues, options, submitLabel, onSubmit }: TrainingFormProps) {
  const [values, setValues] = useState<TrainingFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationError = useMemo(() => validateTraining(values), [values]);

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
      setError(toFrenchTrainingError(submitError));
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="categoryId">
          Categorie
          <select
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            id="categoryId"
            name="categoryId"
            onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
            required
            value={values.categoryId}
          >
            <option value="">Choisir une categorie</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}{category.isActive ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <FormField
        label="Description courte"
        maxLength={300}
        name="shortDescription"
        onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))}
        type="text"
        value={values.shortDescription}
      />

      <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="description">
        Description complete
        <textarea
          className="min-h-36 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
          id="description"
          maxLength={5000}
          name="description"
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          value={values.description}
        />
        <span className="text-xs font-normal text-slate-500">{values.description.length}/5000 caracteres</span>
      </label>

      <FormField
        label="URL de l'image"
        maxLength={500}
        name="imageUrl"
        onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))}
        type="url"
        value={values.imageUrl}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="level">
          Niveau
          <select
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            id="level"
            name="level"
            onChange={(event) => setValues((current) => ({ ...current, level: event.target.value as TrainingLevel }))}
            value={values.level}
          >
            {trainingLevels.map((level) => (
              <option key={level} value={level}>
                {trainingLevelLabels[level]}
              </option>
            ))}
          </select>
        </label>

        <FormField
          label="Duree en heures"
          max={1000}
          min={1}
          name="durationHours"
          onChange={(event) => setValues((current) => ({ ...current, durationHours: event.target.value }))}
          required
          type="number"
          value={values.durationHours}
        />

        <FormField
          label="Prix"
          min={0}
          name="price"
          onChange={(event) => setValues((current) => ({ ...current, price: event.target.value }))}
          required
          step="0.01"
          type="number"
          value={values.price}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="currency">
          Devise
          <select
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            id="currency"
            name="currency"
            onChange={(event) => setValues((current) => ({ ...current, currency: event.target.value }))}
            value={values.currency}
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 pt-7 text-sm font-medium text-slate-800" htmlFor="isFeatured">
          <input
            checked={values.isFeatured}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
            id="isFeatured"
            name="isFeatured"
            onChange={(event) => setValues((current) => ({ ...current, isFeatured: event.target.checked }))}
            type="checkbox"
          />
          Mettre en avant
        </label>
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? <LoadingSpinner label="Enregistrement" /> : submitLabel}
      </Button>
    </form>
  );
}

export function toTrainingPayload(values: TrainingFormValues) {
  return {
    categoryId: Number(values.categoryId),
    title: values.title.trim(),
    shortDescription: values.shortDescription.trim() || null,
    description: values.description.trim() || null,
    imageUrl: values.imageUrl.trim() || null,
    level: values.level,
    durationHours: Number(values.durationHours),
    price: Number(values.price),
    currency: values.currency.toUpperCase(),
    isFeatured: values.isFeatured,
  };
}

function validateTraining(values: TrainingFormValues): string | null {
  if (!values.title.trim()) return "Le titre est obligatoire.";
  if (!values.categoryId) return "La categorie est obligatoire.";
  if (values.title.length > 150) return "Le titre ne peut pas depasser 150 caracteres.";
  if (values.shortDescription.length > 300) return "La description courte ne peut pas depasser 300 caracteres.";
  if (values.description.length > 5000) return "La description complete ne peut pas depasser 5000 caracteres.";
  if (values.imageUrl.length > 500) return "L'URL de l'image ne peut pas depasser 500 caracteres.";
  if (values.imageUrl.trim()) {
    try {
      new URL(values.imageUrl);
    } catch {
      return "L'URL de l'image doit etre valide.";
    }
  }

  const duration = Number(values.durationHours);
  if (!Number.isInteger(duration) || duration < 1 || duration > 1000) {
    return "La duree doit etre comprise entre 1 et 1000 heures.";
  }

  const price = Number(values.price);
  if (Number.isNaN(price) || price < 0) return "Le prix doit etre superieur ou egal a zero.";
  if (!currencies.includes(values.currency)) return "La devise doit etre EUR, USD ou MAD.";

  return null;
}

function toFrenchTrainingError(error: unknown): string {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();
  if (lower.includes("category")) return "La categorie choisie est introuvable.";
  if (lower.includes("transition")) return "Ce changement de statut n'est pas autorise.";
  if (lower.includes("forbidden")) return "Vous n'avez pas les droits necessaires pour cette action.";

  return message;
}

