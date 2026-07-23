"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CloseIcon, LayersIcon, SparklesIcon } from "@/components/ui/icons";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getLearnerTraining } from "@/lib/api/learner-training-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { LearnerTraining, LearnerTrainingModule } from "@/lib/enrollments/enrollment-types";

const AITrainerChat = dynamic(
  () => import("@/components/ai-trainer/ai-trainer-chat").then((module) => module.AITrainerChat),
  { loading: () => <div className="grid min-h-[50vh] place-items-center"><LoadingSpinner label="Chargement du formateur IA" /></div>, ssr: false },
);

type WorkspaceView = "trainer" | "content" | "video" | "document";

export default function LearningSpacePage() {
  const params = useParams<{ trainingId: string }>();
  const trainingId = useMemo(() => Number(params.trainingId), [params.trainingId]);
  const [training, setTraining] = useState<LearnerTraining | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearnerTrainingModule | null>(null);
  const [activeView, setActiveView] = useState<WorkspaceView>("trainer");
  const [modulesOpen, setModulesOpen] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(trainingId)) return;
    getLearnerTraining(trainingId)
      .then((item) => {
        setTraining(item);
        setSelectedModule(item.modules[0] ?? null);
      })
      .catch((loadError) => setError(getErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, [trainingId]);

  useEffect(() => {
    if (!modulesOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setModulesOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [modulesOpen]);

  function chooseModule(module: LearnerTrainingModule) {
    if (selectedModule?.id === module.id) {
      setModulesOpen(false);
      return;
    }
    if (conversationActive && !window.confirm("Changer de module arrêtera la session vocale actuelle et créera un nouveau contexte. Continuer ?")) return;
    setConversationActive(false);
    setSelectedModule(module);
    setModulesOpen(false);
  }

  const views: { value: WorkspaceView; label: string; available: boolean }[] = [
    { value: "trainer", label: "Formateur IA", available: Boolean(selectedModule) },
    { value: "content", label: "Contenu", available: Boolean(selectedModule) },
    { value: "video", label: "Vidéo", available: Boolean(selectedModule?.videoUrl) },
    { value: "document", label: "Document", available: Boolean(selectedModule?.documentUrl) },
  ];

  return (
    <DashboardLayout expectedRole="Learner" immersive title={training?.title ?? "Espace d’apprentissage"}>
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link className="text-sm font-semibold text-indigo-700 hover:text-indigo-900" href="/learner/trainings">← Mes formations</Link>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="truncate text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">{training?.title ?? "Votre formation"}</h1>
            {selectedModule ? <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Module {selectedModule.orderIndex}</span> : null}
          </div>
          {training ? <p className="mt-1 text-sm text-slate-600">{training.categoryName} - {selectedModule?.title ?? "Choisissez un module"}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setModulesOpen(true)} variant="secondary"><LayersIcon /> Modules</Button>
          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
            {views.map((view) => (
              <button
                aria-pressed={activeView === view.value}
                className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition ${activeView === view.value ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-950"} disabled:cursor-not-allowed disabled:opacity-45`}
                disabled={!view.available}
                key={view.value}
                onClick={() => setActiveView(view.value)}
                type="button"
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <ErrorMessage message={!Number.isInteger(trainingId) ? "La formation demandée est invalide." : error} />
      {isLoading && Number.isInteger(trainingId) ? <div className="grid min-h-[40vh] place-items-center"><LoadingSpinner label="Ouverture de l’espace d’apprentissage" /></div> : null}

      {!isLoading && training ? (
        selectedModule ? (
          <section className="min-w-0" aria-label={views.find((view) => view.value === activeView)?.label}>
            {activeView === "trainer" ? (
              <AITrainerChat
                initialModuleId={selectedModule.id}
                initialTrainingId={training.id}
                key={selectedModule.id}
                lockedContext
                onConversationActiveChange={setConversationActive}
              />
            ) : (
              <Card className="mx-auto min-h-[520px] w-full max-w-6xl">
                <ModuleContent module={selectedModule} view={activeView} />
              </Card>
            )}
          </section>
        ) : (
          <Card className="grid min-h-[420px] place-items-center text-center">
            <div><SparklesIcon className="mx-auto h-10 w-10 text-indigo-600" /><h2 className="mt-4 text-2xl font-bold text-slate-950">Aucun module publié</h2><p className="mt-2 text-slate-600">Le contenu de cette formation sera bientôt disponible.</p></div>
          </Card>
        )
      ) : null}

      {modulesOpen && training ? (
        <div className="drawer-overlay fixed inset-0 z-[70] bg-slate-950/55 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setModulesOpen(false)}>
          <aside aria-label="Modules de la formation" aria-modal="true" className="drawer-panel flex h-full w-[min(92vw,380px)] flex-col bg-white shadow-2xl" role="dialog">
            <header className="flex min-h-[76px] items-center justify-between border-b border-slate-200 px-5">
              <div><h2 className="text-xl font-bold text-slate-950">Modules</h2><p className="text-sm text-slate-500">{training.modules.length} disponible{training.modules.length > 1 ? "s" : ""}</p></div>
              <button aria-label="Fermer les modules" autoFocus className="grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setModulesOpen(false)} type="button"><CloseIcon /></button>
            </header>
            <ol className="flex-1 space-y-2 overflow-y-auto p-4">
              {training.modules.map((module) => (
                <li key={module.id}>
                  <button aria-current={selectedModule?.id === module.id ? "step" : undefined} className={`w-full rounded-2xl border p-4 text-left transition ${selectedModule?.id === module.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"}`} onClick={() => chooseModule(module)} type="button">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">Module {module.orderIndex}</span>
                    <span className="mt-1 block text-base font-semibold text-slate-950">{module.title}</span>
                    {module.estimatedDurationMinutes ? <span className="mt-1 block text-sm text-slate-500">{module.estimatedDurationMinutes} minutes</span> : null}
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

function ModuleContent({ module, view }: { module: LearnerTrainingModule; view: Exclude<WorkspaceView, "trainer"> }) {
  const directVideo = module.videoUrl && isSafeUrl(module.videoUrl) && /\.(mp4|webm|ogg)(\?.*)?$/i.test(module.videoUrl);
  return (
    <article className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Module {module.orderIndex}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">{module.title}</h2>
      {module.estimatedDurationMinutes ? <p className="mt-2 text-sm text-slate-500">Durée estimée : {module.estimatedDurationMinutes} minutes</p> : null}

      {view === "content" ? (
        <div className="mt-8">
          {module.description ? <p className="text-lg leading-8 text-slate-600">{module.description}</p> : null}
          {module.content ? <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-800">{module.content}</div> : <p className="text-slate-600">Aucun contenu textuel pour ce module.</p>}
        </div>
      ) : null}

      {view === "video" ? (
        <div className="mt-8">
          {directVideo ? (
            <video className="aspect-video w-full rounded-3xl bg-slate-950 shadow-lg" controls preload="metadata" src={module.videoUrl ?? undefined}>Votre navigateur ne prend pas en charge la vidéo.</video>
          ) : module.videoUrl && isSafeUrl(module.videoUrl) ? (
            <a className="inline-flex min-h-12 items-center rounded-xl bg-indigo-700 px-5 text-[15px] font-semibold text-white" href={module.videoUrl} rel="noopener noreferrer" target="_blank">Ouvrir la vidéo pédagogique</a>
          ) : <p className="text-slate-600">Aucune vidéo disponible.</p>}
        </div>
      ) : null}

      {view === "document" ? (
        <div className="mt-8">
          {module.documentUrl && isSafeUrl(module.documentUrl) ? (
            <a className="inline-flex min-h-12 items-center rounded-xl bg-slate-950 px-5 text-[15px] font-semibold text-white" href={module.documentUrl} rel="noopener noreferrer" target="_blank">Consulter le document</a>
          ) : <p className="text-slate-600">Aucun document disponible.</p>}
        </div>
      ) : null}
    </article>
  );
}

function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

