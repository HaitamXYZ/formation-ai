"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createTextResource, deleteModuleResource, getTrainingModuleResources, reprocessModuleResource, updateModuleResourceStatus, uploadModuleResource } from "@/lib/api/training-module-resource-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { TrainingModuleResource, TrainingModuleResourceStatus } from "@/lib/modules/training-module-resource-types";
import { cn } from "@/lib/utils/cn";

export function TrainingModuleResources({ trainingId, moduleId }: { trainingId: number; moduleId: number }) {
  const [resources, setResources] = useState<TrainingModuleResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showTextForm, setShowTextForm] = useState(false);
  const [preview, setPreview] = useState<TrainingModuleResource | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setResources(await getTrainingModuleResources(trainingId, moduleId));
    } catch (loadError) { setError(getErrorMessage(loadError)); }
    finally { setIsLoading(false); }
  }, [moduleId, trainingId]);

  useEffect(() => {
    let cancelled = false;
    getTrainingModuleResources(trainingId, moduleId)
      .then((items) => { if (!cancelled) setResources(items); })
      .catch((loadError) => { if (!cancelled) setError(getErrorMessage(loadError)); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [moduleId, trainingId]);

  function selectFile(file: File | null) {
    setUploadFile(file);
    if (file && !uploadTitle.trim()) setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) { setError("Renseignez un titre et choisissez un document."); return; }
    setError(null); setFeedback(null); setUploadProgress(0);
    try {
      await uploadModuleResource(trainingId, moduleId, uploadTitle.trim(), uploadFile, setUploadProgress);
      setFeedback("Document ajoute et analyse."); setUploadFile(null); setUploadTitle("");
      if (fileInput.current) fileInput.current.value = "";
      await load();
    } catch (uploadError) { setError(getErrorMessage(uploadError)); }
    finally { setUploadProgress(null); }
  }

  async function mutate(resource: TrainingModuleResource, action: "status" | "reprocess" | "delete") {
    if (action === "delete" && !window.confirm(`Supprimer la ressource "${resource.title}" ?`)) return;
    setPendingId(resource.id); setError(null); setFeedback(null);
    try {
      if (action === "status") await updateModuleResourceStatus(trainingId, moduleId, resource.id, { isActive: !resource.isActive });
      if (action === "reprocess") await reprocessModuleResource(trainingId, moduleId, resource.id);
      if (action === "delete") await deleteModuleResource(trainingId, moduleId, resource.id);
      setFeedback(action === "delete" ? "Ressource supprimee." : action === "reprocess" ? "Ressource retraitee." : "Statut mis a jour.");
      await load();
    } catch (mutationError) { setError(getErrorMessage(mutationError)); }
    finally { setPendingId(null); }
  }

  return (
    <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="resources-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Base de connaissances</p><h2 id="resources-title" className="mt-1 text-xl font-bold text-slate-950">Ressources pedagogiques</h2><p className="mt-1 text-sm text-slate-600">Les ressources actives et pretes enrichissent les reponses du formateur IA.</p></div>
        <Button variant="secondary" onClick={() => setShowTextForm(true)}>Ajouter du texte</Button>
      </div>
      {feedback ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}
      <ErrorMessage message={error} />

      <form className="grid gap-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 p-4 sm:grid-cols-[1fr_1.2fr_auto] sm:items-end" onSubmit={handleUpload}>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-800">Titre du document<input className="h-[42px] rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" maxLength={200} onChange={(event) => setUploadTitle(event.target.value)} value={uploadTitle} /></label>
        <label className="grid cursor-pointer gap-1.5 text-sm font-semibold text-slate-800" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files[0] ?? null); }}>
          Document PDF, DOCX, TXT ou MD
          <span className="flex h-[42px] items-center rounded-xl border border-slate-300 bg-white px-3 font-normal text-slate-600">{uploadFile?.name ?? "Choisir ou deposer un fichier (10 Mo max.)"}</span>
          <input ref={fileInput} className="sr-only" type="file" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} />
        </label>
        <Button type="submit" disabled={uploadProgress !== null}>{uploadProgress === null ? "Importer" : `${uploadProgress} %`}</Button>
        {uploadProgress !== null ? <div className="sm:col-span-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress}><div className="h-2 overflow-hidden rounded-full bg-indigo-100"><div className="h-full bg-indigo-600 transition-[width]" style={{ width: `${uploadProgress}%` }} /></div></div> : null}
      </form>

      {isLoading ? <LoadingSpinner label="Chargement des ressources" /> : resources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">Aucune ressource. Ajoutez du texte ou importez un document.</div>
      ) : (
        <div className="grid gap-3">
          {resources.map((resource) => (
            <article className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50/60 sm:flex-row sm:items-center" key={resource.id}>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold text-slate-950">{resource.title}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{resource.resourceType}</span><ResourceStatus status={resource.processingStatus} /><span className={cn("rounded-full px-2 py-1 text-xs font-semibold", resource.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{resource.isActive ? "Active" : "Inactive"}</span></div><p className="mt-1 truncate text-sm text-slate-500">{resource.originalFileName ?? "Texte saisi manuellement"}{resource.fileSize ? ` · ${formatBytes(resource.fileSize)}` : ""} · {new Date(resource.createdAt).toLocaleDateString("fr-FR")}</p>{resource.processingError ? <p className="mt-2 text-sm text-rose-700">{resource.processingError}</p> : null}</div>
              <div className="flex items-center justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setPreview(resource)} disabled={!resource.extractedText && !resource.textContent}>Apercu</Button><DropdownMenu label={`Actions pour ${resource.title}`} items={[{ label: resource.isActive ? "Desactiver" : "Activer", disabled: pendingId === resource.id, onSelect: () => mutate(resource, "status") }, ...(resource.processingStatus === "Failed" ? [{ label: "Retraiter", disabled: pendingId === resource.id, onSelect: () => mutate(resource, "reprocess" as const) }] : []), { label: "Supprimer", danger: true, disabled: pendingId === resource.id, onSelect: () => mutate(resource, "delete") }]} /></div>
            </article>
          ))}
        </div>
      )}
      {showTextForm ? <TextResourceDialog onClose={() => setShowTextForm(false)} onCreate={async (title, textContent) => { await createTextResource(trainingId, moduleId, { title, textContent }); setShowTextForm(false); setFeedback("Ressource texte ajoutee."); await load(); }} /> : null}
      {preview ? <ResourcePreview resource={preview} onClose={() => setPreview(null)} /> : null}
    </section>
  );
}

function TextResourceDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (title: string, text: string) => Promise<void> }) {
  const [title, setTitle] = useState(""); const [text, setText] = useState(""); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><form className="grid max-h-[90vh] w-full max-w-2xl gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="text-resource-title" onSubmit={async (event) => { event.preventDefault(); if (!title.trim() || !text.trim()) { setError("Le titre et le contenu sont obligatoires."); return; } setSaving(true); setError(null); try { await onCreate(title.trim(), text.trim()); } catch (saveError) { setError(getErrorMessage(saveError)); setSaving(false); } }}><div><h3 id="text-resource-title" className="text-xl font-bold text-slate-950">Ajouter une ressource texte</h3><p className="mt-1 text-sm text-slate-600">Ce contenu sera directement disponible pour le formateur IA.</p></div><ErrorMessage message={error} /><label className="grid gap-2 text-sm font-semibold">Titre<input autoFocus className="h-[42px] rounded-xl border border-slate-300 px-3 font-normal" maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="grid gap-2 text-sm font-semibold">Contenu<textarea className="min-h-72 rounded-xl border border-slate-300 p-3 font-normal" maxLength={100000} value={text} onChange={(event) => setText(event.target.value)} /><span className="text-right text-xs font-normal text-slate-500">{text.length}/100000</span></label><div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Annuler</Button><Button type="submit" loading={saving} loadingLabel="Ajout">Ajouter</Button></div></form></div>;
}

function ResourcePreview({ resource, onClose }: { resource: TrainingModuleResource; onClose: () => void }) {
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div className="grid max-h-[90vh] w-full max-w-3xl gap-4 overflow-hidden rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="preview-title"><div className="flex items-start justify-between gap-4"><div><h3 id="preview-title" className="text-xl font-bold text-slate-950">{resource.title}</h3><p className="text-sm text-slate-500">Texte disponible pour Gemini</p></div><Button size="sm" variant="ghost" onClick={onClose}>Fermer</Button></div><pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 font-sans text-sm leading-6 text-slate-100">{resource.extractedText ?? resource.textContent}</pre></div></div>;
}

function ResourceStatus({ status }: { status: TrainingModuleResourceStatus }) {
  const style = { Pending: "bg-amber-50 text-amber-700", Processing: "bg-sky-50 text-sky-700", Ready: "bg-emerald-50 text-emerald-700", Failed: "bg-rose-50 text-rose-700" }[status];
  const label = { Pending: "En attente", Processing: "Traitement", Ready: "Prete", Failed: "Echec" }[status];
  return <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", style)}>{label}</span>;
}

function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`; }
