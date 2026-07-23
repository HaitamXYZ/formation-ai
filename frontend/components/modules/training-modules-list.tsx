"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClassName } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TrainingModuleStatusBadge } from "@/components/modules/training-module-status-badge";
import { deleteTrainingModule, reorderTrainingModules, updateTrainingModuleStatus } from "@/lib/api/training-module-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { TrainingModuleListItem } from "@/lib/modules/training-module-types";

type TrainingModulesListProps = {
  trainingId: number;
  modules: TrainingModuleListItem[];
  isLoading: boolean;
  onModulesChange: (modules: TrainingModuleListItem[]) => void;
  onReload: () => Promise<void>;
};

export function TrainingModulesList({ trainingId, modules, isLoading, onModulesChange, onReload }: TrainingModulesListProps) {
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  async function handleStatus(module: TrainingModuleListItem) {
    const nextStatus = !module.isPublished;
    const label = nextStatus ? "publier" : "depublier";
    const confirmed = window.confirm(`Confirmer : ${label} le module "${module.title}" ?`);
    if (!confirmed) return;

    setPendingId(module.id);
    setError(null);
    setFeedback(null);

    try {
      await updateTrainingModuleStatus(trainingId, module.id, { isPublished: nextStatus });
      await onReload();
      setFeedback(nextStatus ? "Module publie." : "Module depublie.");
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(module: TrainingModuleListItem) {
    const confirmed = window.confirm(`Supprimer le module "${module.title}" ?`);
    if (!confirmed) return;

    setPendingId(module.id);
    setError(null);
    setFeedback(null);

    try {
      await deleteTrainingModule(trainingId, module.id);
      await onReload();
      setFeedback("Module supprime.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setPendingId(null);
    }
  }

  async function moveModule(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const previousModules = modules;
    const nextModules = [...modules];
    [nextModules[index], nextModules[targetIndex]] = [nextModules[targetIndex], nextModules[index]];

    const normalizedModules = nextModules.map((module, moduleIndex) => ({
      ...module,
      orderIndex: moduleIndex + 1,
    }));

    setIsReordering(true);
    setError(null);
    setFeedback(null);
    onModulesChange(normalizedModules);

    try {
      const savedModules = await reorderTrainingModules(trainingId, {
        items: normalizedModules.map((module) => ({
          moduleId: module.id,
          orderIndex: module.orderIndex,
        })),
      });
      onModulesChange(savedModules);
      setFeedback("Ordre des modules mis a jour.");
    } catch (reorderError) {
      onModulesChange(previousModules);
      setError(getErrorMessage(reorderError));
    } finally {
      setIsReordering(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Chargement des modules" />;
  }

  return (
    <div className="grid gap-4">
      {feedback ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}
      <ErrorMessage message={error} />
      {modules.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">Aucun module n&apos;a encore ete ajoute.</div>
      ) : (
        <div className="data-surface overflow-x-auto">
          <table className="w-full min-w-[980px] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Duree estimee</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Creation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {modules.map((module, index) => (
                <tr className="h-16 transition hover:bg-slate-50/70" key={module.id}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{module.orderIndex}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-950">{module.title}</div>
                    <div className="mt-1 max-w-xl text-xs text-slate-500">{shortDescription(module.description)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{module.estimatedDurationMinutes ? `${module.estimatedDurationMinutes} min` : "Non renseignee"}</td>
                  <td className="px-4 py-3"><TrainingModuleStatusBadge isPublished={module.isPublished} /></td>
                  <td className="px-4 py-3 text-slate-600">{new Date(module.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="w-[180px] px-4 py-3">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <Link className={buttonClassName({ variant: "outline", size: "sm" })} href={`/admin/trainings/${trainingId}/modules/${module.id}/edit`}>Modifier</Link>
                      <DropdownMenu
                        label={`Actions pour ${module.title}`}
                        items={[
                          { label: "Monter", disabled: index === 0 || isReordering, onSelect: () => moveModule(index, -1) },
                          { label: "Descendre", disabled: index === modules.length - 1 || isReordering, onSelect: () => moveModule(index, 1) },
                          { label: module.isPublished ? "Depublier" : "Publier", disabled: pendingId === module.id, onSelect: () => handleStatus(module) },
                          { label: "Supprimer le module", danger: true, disabled: pendingId === module.id, onSelect: () => handleDelete(module) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isReordering ? <p className="text-sm text-slate-500">Sauvegarde de l&apos;ordre...</p> : null}
    </div>
  );
}

function shortDescription(description: string | null): string {
  if (!description) return "Aucune description.";
  return description.length > 140 ? `${description.slice(0, 137)}...` : description;
}

