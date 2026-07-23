"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AIAvatarPanel } from "@/components/ai-trainer/ai-avatar-panel";
import { AIConversationSidebar } from "@/components/ai-trainer/ai-conversation-sidebar";
import { AITrainerComposer } from "@/components/ai-trainer/ai-trainer-composer";
import { AITrainerEmptyState } from "@/components/ai-trainer/ai-trainer-empty-state";
import { AITrainerMessage } from "@/components/ai-trainer/ai-trainer-message";
import { Button } from "@/components/ui/button";
import { CloseIcon, HistoryIcon, MessageIcon, SparklesIcon } from "@/components/ui/icons";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  askAITrainer,
  createAIConversation,
  deleteAIConversation,
  getAIConversation,
  getAIConversations,
  getAITrainerTrainingOptions,
} from "@/lib/api/ai-trainer-api";
import { getAIUsage } from "@/lib/api/ai-usage-api";
import { getErrorMessage } from "@/lib/api/api-error";
import type { AIConversation, AIConversationListItem, AITrainerAnswer, AITrainerTrainingOption } from "@/lib/ai-trainer/ai-trainer-types";
import type { AIUsageSummary } from "@/lib/catalog/catalog-types";

type AITrainerChatProps = {
  initialTrainingId?: number;
  initialModuleId?: number;
  lockedContext?: boolean;
  compact?: boolean;
  onConversationActiveChange?: (active: boolean) => void;
};

export function AITrainerChat({
  initialTrainingId,
  initialModuleId,
  lockedContext = false,
  onConversationActiveChange,
}: AITrainerChatProps) {
  const [trainingOptions, setTrainingOptions] = useState<AITrainerTrainingOption[]>([]);
  const [conversations, setConversations] = useState<AIConversationListItem[]>([]);
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState(initialTrainingId ? String(initialTrainingId) : "");
  const [selectedModuleId, setSelectedModuleId] = useState(initialModuleId ? String(initialModuleId) : "");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerToSpeak, setAnswerToSpeak] = useState<{ id: string; text: string } | null>(null);
  const [answerSources, setAnswerSources] = useState<Record<number, string[]>>({});
  const [usage, setUsage] = useState<AIUsageSummary | null>(null);
  const [conversationDrawerOpen, setConversationDrawerOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusChatOpen, setFocusChatOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTraining = useMemo(
    () => trainingOptions.find((training) => String(training.id) === selectedTrainingId) ?? null,
    [selectedTrainingId, trainingOptions],
  );
  const selectedModule = useMemo(
    () => selectedTraining?.modules.find((module) => String(module.id) === selectedModuleId) ?? null,
    [selectedModuleId, selectedTraining],
  );
  const visibleConversations = useMemo(
    () => lockedContext
      ? conversations.filter((item) => item.trainingId === Number(selectedTrainingId) && item.trainingModuleId === (selectedModuleId ? Number(selectedModuleId) : 0))
      : conversations,
    [conversations, lockedContext, selectedModuleId, selectedTrainingId],
  );

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const [trainings, conversationItems, usageSummary] = await Promise.all([
          getAITrainerTrainingOptions(),
          getAIConversations(selectedModuleId ? Number(selectedModuleId) : undefined),
          getAIUsage(),
        ]);
        if (!isMounted) return;
        setTrainingOptions(trainings);
        setConversations(conversationItems);
        setUsage(usageSummary);
        if (!selectedTrainingId && trainings.length > 0) setSelectedTrainingId(String(trainings[0].id));
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadInitialData();
    return () => { isMounted = false; };
  }, [selectedTrainingId, selectedModuleId]);

  useEffect(() => {
    onConversationActiveChange?.(conversation !== null);
  }, [conversation, onConversationActiveChange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [conversation?.messages.length]);

  useEffect(() => {
    if (!focusMode && !conversationDrawerOpen && !focusChatOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (conversationDrawerOpen) setConversationDrawerOpen(false);
      else if (focusChatOpen) setFocusChatOpen(false);
      else if (focusMode) setFocusMode(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [conversationDrawerOpen, focusChatOpen, focusMode]);

  async function refreshConversations(activeConversationId?: number) {
    const items = await getAIConversations(selectedModuleId ? Number(selectedModuleId) : undefined);
    setConversations(items);
    if (activeConversationId) setConversation(await getAIConversation(activeConversationId));
  }

  async function handleStartConversation() {
    if (!selectedTrainingId || !selectedModuleId) { setError("Selectionnez un module avant de demarrer l assistant."); return; }
    setIsStarting(true);
    setError(null);
    try {
      const created = await createAIConversation({
        trainingId: Number(selectedTrainingId),
        trainingModuleId: Number(selectedModuleId),
      });
      setConversation(created);
      await refreshConversations(created.id);
    } catch (startError) {
      setError(getErrorMessage(startError));
    } finally {
      setIsStarting(false);
    }
  }

  async function handleSelectConversation(conversationId: number) {
    setError(null);
    try {
      const item = await getAIConversation(conversationId);
      setConversation(item);
      setSelectedTrainingId(String(item.trainingId));
      setSelectedModuleId(String(item.trainingModuleId));
      setConversationDrawerOpen(false);
    } catch (selectError) {
      setError(getErrorMessage(selectError));
    }
  }

  async function handleDeleteConversation(conversationId: number) {
    if (!window.confirm("Supprimer cette conversation ?")) return;
    setError(null);
    try {
      await deleteAIConversation(conversationId);
      if (conversation?.id === conversationId) setConversation(null);
      await refreshConversations();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  async function submitQuestion(question: string, speakWithAvatar: boolean): Promise<AITrainerAnswer> {
    if (!conversation) throw new Error("Démarrez une conversation avant de poser une question.");
    if (usage && usage.remainingToday <= 0) throw new Error("Vous avez atteint votre limite quotidienne de questions.");

    setIsAsking(true);
    setError(null);
    try {
      const answer = await askAITrainer({ conversationId: conversation.id, question });
      const updatedConversation = await getAIConversation(conversation.id);
      setConversation(updatedConversation);
      const matchingMessage = [...updatedConversation.messages].reverse().find((message) => message.role === "Assistant" && message.createdAt === answer.createdAt)
        ?? [...updatedConversation.messages].reverse().find((message) => message.role === "Assistant");
      if (matchingMessage) setAnswerSources((current) => ({ ...current, [matchingMessage.id]: answer.sources }));
      await refreshConversations();
      setUsage(await getAIUsage());
      if (speakWithAvatar) {
        setAnswerToSpeak({ id: `${conversation.id}-${answer.createdAt}`, text: answer.answer });
      }
      return answer;
    } catch (askError) {
      setError(getErrorMessage(askError));
      throw askError;
    } finally {
      setIsAsking(false);
    }
  }

  if (isLoading) {
    return <div className="grid min-h-[50vh] place-items-center"><LoadingSpinner label="Chargement du formateur IA" /></div>;
  }

  const chatPanel = (
    <section className={`flex min-h-0 flex-col overflow-hidden border border-slate-200 bg-white shadow-sm ${focusMode ? "h-full rounded-none border-y-0 border-r-0" : "h-[clamp(560px,68vh,820px)] rounded-[24px]"}`} aria-label="Chat avec le formateur IA">
      <header className="flex min-h-[72px] items-center justify-between gap-3 border-b border-slate-200 px-5">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-slate-950">{conversation?.title ?? "Conversation"}</p>
          <p className="truncate text-sm text-slate-500">{conversation?.trainingModuleTitle ?? selectedModule?.title ?? "Selectionnez un module"}</p>
        </div>
        {focusMode ? (
          <button aria-label="Fermer le chat" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setFocusChatOpen(false)} type="button"><CloseIcon /></button>
        ) : null}
      </header>

      {!conversation ? (
        <div className="grid flex-1 place-items-center p-6"><AITrainerEmptyState /></div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4">
            {conversation.messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-700"><MessageIcon /></span>
                  <p className="mt-3 text-sm text-slate-600">Posez votre première question par écrit ou avec le microphone.</p>
                </div>
              </div>
            ) : conversation.messages.map((message) => <AITrainerMessage key={message.id} message={message} sources={answerSources[message.id]} />)}
            <div ref={messagesEndRef} />
          </div>
          <AITrainerComposer disabled={isAsking || usage?.remainingToday === 0} onSubmit={(question) => submitQuestion(question, true).then(() => undefined)} />
        </>
      )}
    </section>
  );

  return (
    <div className={focusMode ? "fixed inset-0 z-[80] bg-slate-950 p-4" : "grid min-w-0 gap-5"}>
      {!focusMode ? (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-50 px-3 text-sm font-semibold text-indigo-900"><SparklesIcon className="h-4 w-4" /> Formateur contextuel</span>
              <span className="truncate text-sm text-slate-600">{selectedTraining?.title ?? "Sélectionnez une formation"}{selectedModule ? ` · ${selectedModule.title}` : ""}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {usage ? <span className={`inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold ${usage.remainingToday === 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{usage.remainingToday}/{usage.dailyLimit} questions</span> : null}
              <Button onClick={() => setConversationDrawerOpen(true)} variant="secondary"><HistoryIcon /> Conversations</Button>
              <Button disabled={!selectedTrainingId || !selectedModuleId || isStarting} onClick={() => void handleStartConversation()}>
                {isStarting ? <LoadingSpinner label="Création" /> : "Nouvelle conversation"}
              </Button>
            </div>
          </div>

          {!lockedContext ? (
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700" htmlFor="trainingId">
                Formation
                <select className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-[15px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" id="trainingId" onChange={(event) => { setSelectedTrainingId(event.target.value); setSelectedModuleId(""); }} value={selectedTrainingId}>
                  <option value="">Choisir une formation</option>
                  {trainingOptions.map((training) => <option key={training.id} value={training.id}>{training.title}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700" htmlFor="trainingModuleId">
                Module
                <select className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-[15px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" id="trainingModuleId" onChange={(event) => setSelectedModuleId(event.target.value)} value={selectedModuleId}>
                  <option value="">Selectionnez un module</option>
                  {selectedTraining?.modules.map((module) => <option key={module.id} value={module.id}>{module.orderIndex}. {module.title}</option>)}
                </select>
              </label>
            </div>
          ) : null}
          <ErrorMessage message={error} />
        </>
      ) : null}

      <div className={focusMode ? "h-full" : "grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_clamp(380px,27vw,440px)] xl:items-start"}>
        <AIAvatarPanel
          answerToSpeak={answerToSpeak}
          busy={isAsking}
          conversationId={conversation?.id ?? null}
          disabled={usage?.remainingToday === 0}
          focusMode={focusMode}
          onOpenChat={() => setFocusChatOpen(true)}
          onToggleFocus={() => {
            setFocusMode((current) => !current);
            setFocusChatOpen(false);
          }}
          onVoiceQuestion={(question) => submitQuestion(question, false)}
        />
        {!focusMode ? chatPanel : null}
      </div>

      {focusMode && focusChatOpen ? (
        <div className="drawer-overlay fixed inset-0 z-[90] bg-slate-950/55" onMouseDown={(event) => event.target === event.currentTarget && setFocusChatOpen(false)}>
          <div className="drawer-panel ml-auto h-full w-[min(92vw,440px)]">{chatPanel}</div>
        </div>
      ) : null}

      {conversationDrawerOpen ? (
        <div className="drawer-overlay fixed inset-0 z-[95] bg-slate-950/55 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setConversationDrawerOpen(false)}>
          <aside aria-label="Historique des conversations" aria-modal="true" className="drawer-panel flex h-full w-[min(92vw,360px)] flex-col bg-white shadow-2xl" ref={drawerRef} role="dialog">
            <header className="flex min-h-[72px] items-center justify-between border-b border-slate-200 px-5">
              <div><h2 className="text-lg font-bold text-slate-950">Conversations</h2><p className="text-sm text-slate-500">{visibleConversations.length} enregistrée{visibleConversations.length > 1 ? "s" : ""}</p></div>
              <button aria-label="Fermer l’historique" autoFocus className="grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setConversationDrawerOpen(false)} type="button"><CloseIcon /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
              <AIConversationSidebar activeConversationId={conversation?.id ?? null} conversations={visibleConversations} onDelete={handleDeleteConversation} onSelect={handleSelectConversation} />
            </div>
            <div className="border-t border-slate-200 p-4"><Button className="w-full" disabled={!selectedTrainingId || !selectedModuleId || isStarting} onClick={() => { setConversationDrawerOpen(false); void handleStartConversation(); }}>Nouvelle conversation</Button></div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}


