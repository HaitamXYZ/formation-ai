"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExpandIcon, InterruptIcon, MessageIcon, MicrophoneIcon, MicrophoneOffIcon, StopIcon } from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createAvatarSession } from "@/lib/api/avatar-api";
import { AnamAvatarClient, getLatestUserMessage } from "@/lib/avatar/anam-avatar-client";
import { getErrorMessage } from "@/lib/api/api-error";
import type { AITrainerAnswer } from "@/lib/ai-trainer/ai-trainer-types";
import type { AvatarConnectionStatus, VoiceQuestionHandler } from "@/lib/avatar/avatar-types";
import type { Message } from "@anam-ai/js-sdk";

type AIAvatarPanelProps = {
  conversationId: number | null;
  answerToSpeak: { id: string; text: string } | null;
  onVoiceQuestion: VoiceQuestionHandler;
  disabled?: boolean;
  busy?: boolean;
  focusMode?: boolean;
  onToggleFocus?: () => void;
  onOpenChat?: () => void;
};

const statusLabels: Record<AvatarConnectionStatus, string> = {
  idle: "Inactif",
  connecting: "Connexion en cours",
  permission: "Autorisation du microphone",
  ready: "Prêt",
  listening: "À l’écoute",
  transcribing: "Transcription en cours",
  thinking: "Réflexion",
  speaking: "Le formateur parle",
  muted: "Microphone coupé",
  ended: "Session terminée",
  error: "Erreur",
};

const statusStyles: Record<AvatarConnectionStatus, string> = {
  idle: "border-white/15 bg-white/10 text-slate-200",
  connecting: "border-amber-300/30 bg-amber-300/15 text-amber-100",
  permission: "border-amber-300/30 bg-amber-300/15 text-amber-100",
  ready: "border-emerald-300/30 bg-emerald-300/15 text-emerald-100",
  listening: "border-cyan-300/40 bg-cyan-300/20 text-cyan-50",
  transcribing: "border-cyan-300/40 bg-cyan-300/20 text-cyan-50",
  thinking: "border-indigo-300/40 bg-indigo-300/20 text-indigo-50",
  speaking: "border-violet-300/40 bg-violet-300/20 text-violet-50",
  muted: "border-slate-300/30 bg-slate-300/15 text-slate-100",
  ended: "border-white/15 bg-white/10 text-slate-200",
  error: "border-rose-300/40 bg-rose-400/20 text-rose-50",
};

export function AIAvatarPanel({
  conversationId,
  answerToSpeak,
  onVoiceQuestion,
  disabled = false,
  busy = false,
  focusMode = false,
  onToggleFocus,
  onOpenChat,
}: AIAvatarPanelProps) {
  const [status, setStatus] = useState<AvatarConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const clientRef = useRef<AnamAvatarClient | null>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const processedContentsRef = useRef<Set<string>>(new Set());
  const isProcessingQuestionRef = useRef(false);
  const sessionActiveRef = useRef(false);
  const isMutedRef = useRef(false);
  const disabledRef = useRef(disabled);
  const spokenAnswerIdsRef = useRef<Set<string>>(new Set());

  const videoElementId = useMemo(() => `anam-avatar-video-${conversationId ?? "none"}`, [conversationId]);
  const isActive = status !== "idle" && status !== "ended" && status !== "error";
  const isAnimatedStatus = status === "thinking" || status === "connecting" || status === "transcribing";

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const video = document.getElementById(videoElementId) as HTMLVideoElement | null;
    if (!video) return;
    const bounds = video.getBoundingClientRect();
    console.info("[FormationAI][Anam]", {
      status,
      naturalResolution: video.videoWidth && video.videoHeight ? `${video.videoWidth}x${video.videoHeight}` : "indisponible",
      cssSize: `${Math.round(bounds.width)}x${Math.round(bounds.height)}`,
      naturalRatio: naturalRatio ? Number(naturalRatio.toFixed(4)) : null,
    });
  }, [naturalRatio, status, videoElementId]);

  const stopSession = useCallback(async () => {
    const client = clientRef.current;
    clientRef.current = null;
    sessionActiveRef.current = false;
    processedMessageIdsRef.current.clear();
    processedContentsRef.current.clear();
    setExpiresAt(null);
    setIsMuted(false);
    isMutedRef.current = false;

    if (client) {
      try {
        await client.stop();
      } catch {
        // The provider may already have closed the WebRTC session.
      }
    }

    const video = document.getElementById(videoElementId) as HTMLVideoElement | null;
    if (video) {
      if (video.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
    }

    setStatus("ended");
  }, [videoElementId]);

  useEffect(() => () => { void stopSession(); }, [stopSession]);

  useEffect(() => {
    disabledRef.current = disabled;
    if (disabled && clientRef.current?.isStreaming() && !isMutedRef.current) {
      try {
        const audioState = clientRef.current.mute();
        isMutedRef.current = audioState?.isMuted ?? true;
        queueMicrotask(() => {
          setIsMuted(true);
          setStatus("muted");
        });
      } catch (micError) {
        queueMicrotask(() => setError(toAvatarError(micError)));
      }
    }
  }, [disabled]);

  useEffect(() => {
    async function speakTextAnswer() {
      if (!answerToSpeak || spokenAnswerIdsRef.current.has(answerToSpeak.id) || !clientRef.current?.isStreaming()) return;
      spokenAnswerIdsRef.current.add(answerToSpeak.id);
      setStatus("speaking");
      try {
        await clientRef.current.talk(answerToSpeak.text);
        setStatus(isMutedRef.current ? "muted" : "ready");
      } catch (talkError) {
        setError(toAvatarError(talkError));
        setStatus("error");
      }
    }
    void speakTextAnswer();
  }, [answerToSpeak]);

  async function startSession() {
    if (!conversationId || disabled || busy || isStarting || clientRef.current?.isStreaming()) return;
    setIsStarting(true);
    setError(null);
    setStatus("connecting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Aucun microphone n'a été détecté.");
      const session = await createAvatarSession({ conversationId });
      setExpiresAt(session.expiresAt);
      const client = new AnamAvatarClient(videoElementId, {
        onReady: () => setStatus("ready"),
        onConnectionClosed: () => {
          setStatus("ended");
          sessionActiveRef.current = false;
          clientRef.current = null;
        },
        onMicrophonePending: () => {
          setStatus("permission");
          setError("Autorisez l'accès au microphone pour parler au formateur.");
        },
        onMicrophoneGranted: () => {
          setError(null);
          setIsMuted(false);
          isMutedRef.current = false;
        },
        onMicrophoneDenied: () => {
          setError("L'accès au microphone a été refusé.");
          setStatus("error");
        },
        onUserSpeechStarted: () => setStatus("listening"),
        onUserSpeechEnded: () => setStatus("transcribing"),
        onMessageHistoryUpdated: (messages) => { void handleMessageHistoryUpdated(messages); },
        onTalkInterrupted: () => setStatus(isMutedRef.current ? "muted" : "ready"),
        onError: (message) => {
          setError(message || "Une erreur Anam.ai est survenue.");
          setStatus("error");
        },
      });

      clientRef.current = client;
      sessionActiveRef.current = true;
      await client.start(session.sessionToken);
    } catch (startError) {
      setError(toAvatarError(startError));
      setStatus("error");
      clientRef.current = null;
      sessionActiveRef.current = false;
    } finally {
      setIsStarting(false);
    }
  }

  async function handleMessageHistoryUpdated(messages: Message[]) {
    const latestUserMessage = getLatestUserMessage(messages);
    if (!latestUserMessage || disabledRef.current || isMutedRef.current || !sessionActiveRef.current || processedMessageIdsRef.current.has(latestUserMessage.id) || isProcessingQuestionRef.current) return;

    const question = latestUserMessage.content.trim();
    const normalizedQuestion = question.toLocaleLowerCase("fr-FR").replace(/\s+/g, " ");
    if (!question || processedContentsRef.current.has(normalizedQuestion)) return;

    processedMessageIdsRef.current.add(latestUserMessage.id);
    processedContentsRef.current.add(normalizedQuestion);
    isProcessingQuestionRef.current = true;
    setStatus("thinking");
    setError(null);

    try {
      const answer: AITrainerAnswer = await onVoiceQuestion(question);
      setStatus("speaking");
      await clientRef.current?.talk(answer.answer);
      setStatus(isMutedRef.current ? "muted" : "ready");
    } catch (questionError) {
      setError(getErrorMessage(questionError));
      setStatus("error");
    } finally {
      isProcessingQuestionRef.current = false;
    }
  }

  function toggleMicrophone() {
    if (!clientRef.current) return;
    try {
      if (isMuted) {
        const audioState = clientRef.current.unmute();
        const nextMuted = audioState?.isMuted ?? false;
        setIsMuted(nextMuted);
        isMutedRef.current = nextMuted;
        setStatus("ready");
      } else {
        const audioState = clientRef.current.mute();
        const nextMuted = audioState?.isMuted ?? true;
        setIsMuted(nextMuted);
        isMutedRef.current = nextMuted;
        setStatus("muted");
      }
    } catch (micError) {
      setError(toAvatarError(micError));
      setStatus("error");
    }
  }

  function interrupt() {
    try {
      clientRef.current?.interrupt();
      setStatus(isMutedRef.current ? "muted" : "ready");
    } catch (interruptError) {
      setError(toAvatarError(interruptError));
    }
  }

  return (
    <section className="min-w-0" aria-label="Avatar du formateur IA">
      <div
        className={`avatar-stage relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-[#050817] shadow-[0_28px_80px_rgba(15,23,42,0.25)] transition duration-300 ${focusMode ? "!h-[calc(100vh-32px)] !max-h-none !min-h-0 rounded-[24px]" : ""}`}
        data-status={status}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(79,70,229,.28),transparent_42%),linear-gradient(180deg,#0b1026,#030511)]" />
        <video
          autoPlay
          className="relative z-10 h-full w-full bg-transparent object-contain object-center opacity-100 filter-none transform-none [image-rendering:auto]"
          id={videoElementId}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              setNaturalRatio(video.videoWidth / video.videoHeight);
            }
          }}
          playsInline
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-slate-950/85 via-slate-950/10 via-35% to-transparent to-65%" />

        <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4 sm:p-5">
          <div aria-live="polite" className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold backdrop-blur-md ${statusStyles[status]}`} role="status">
            <span className={`h-2.5 w-2.5 rounded-full ${status === "listening" ? "animate-pulse bg-cyan-300" : status === "speaking" ? "bg-violet-300" : status === "error" ? "bg-rose-300" : "bg-current opacity-70"}`} />
            {statusLabels[status]}
            {isAnimatedStatus ? <span className="status-dots ml-1 inline-flex gap-1" aria-hidden="true"><span>•</span><span>•</span><span>•</span></span> : null}
          </div>
          <div className="flex gap-2">
            {focusMode && onOpenChat ? (
              <button aria-label="Afficher le chat" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-slate-950/55 text-white backdrop-blur-md transition hover:bg-white/15" onClick={onOpenChat} title="Afficher le chat" type="button"><MessageIcon /></button>
            ) : null}
            {onToggleFocus ? (
              <button aria-label={focusMode ? "Quitter le mode concentration" : "Activer le mode concentration"} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-slate-950/55 text-white backdrop-blur-md transition hover:bg-white/15" onClick={onToggleFocus} title={focusMode ? "Quitter le mode concentration" : "Mode concentration"} type="button"><ExpandIcon /></button>
            ) : null}
          </div>
        </div>

        {!isActive ? (
          <div className="absolute inset-0 z-20 grid place-items-center p-6">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-white/15 bg-white/10 text-cyan-300 backdrop-blur"><MicrophoneIcon className="h-9 w-9" /></div>
              <h3 className="text-2xl font-bold text-white">Votre formateur vocal</h3>
              <p className="mt-3 text-base leading-7 text-slate-300">Démarrez une conversation, autorisez le microphone et échangez naturellement avec l’avatar.</p>
              <Button className="mt-6 min-w-64" disabled={!conversationId || disabled || busy || isStarting} onClick={() => void startSession()}>
                {isStarting ? <LoadingSpinner label="Connexion" /> : <><MicrophoneIcon /> Démarrer le formateur</>}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-5">
          {error ? <div className="mb-3 rounded-2xl border border-rose-300/30 bg-rose-950/80 px-4 py-3 text-sm text-rose-50 backdrop-blur" role="alert">{error}</div> : null}
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/65 p-2.5 shadow-xl backdrop-blur-xl">
            {!isActive ? (
              <Button className="min-h-11" disabled={!conversationId || disabled || busy || isStarting} onClick={() => void startSession()}>
                {isStarting ? <LoadingSpinner label="Connexion" /> : <><MicrophoneIcon /> Démarrer</>}
              </Button>
            ) : null}
            <Button className="min-h-11 border-white/15 bg-white/10 text-white hover:bg-white/20" disabled={!isActive || disabled || busy} onClick={toggleMicrophone} variant="secondary">
              {isMuted ? <><MicrophoneOffIcon /> Réactiver le micro</> : <><MicrophoneIcon /> Couper le micro</>}
            </Button>
            <Button className="min-h-11 text-white hover:bg-white/10" disabled={!isActive || status !== "speaking"} onClick={interrupt} variant="ghost">
              <InterruptIcon /> Interrompre
            </Button>
            <Button className="min-h-11 border-white/15 bg-white/10 text-white hover:bg-white/20" disabled={!isActive} onClick={() => void stopSession()} variant="secondary">
              <StopIcon /> Arrêter
            </Button>
          </div>
          {expiresAt ? <p className="mt-2 text-center text-xs text-slate-400">Session sécurisée jusqu’à {new Date(expiresAt).toLocaleTimeString("fr-FR")}</p> : null}
        </div>
      </div>
      <p className="mt-3 px-2 text-sm leading-6 text-slate-500">Les réponses vocales utilisent le contenu pédagogique sélectionné et sont enregistrées dans votre historique.</p>
    </section>
  );
}

function toAvatarError(error: unknown): string {
  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("permission")) return "L'accès au microphone a été refusé.";
    if (lower.includes("microphone")) return error.message;
    if (lower.includes("webrtc") || lower.includes("connection")) return "La connexion audio/vidéo avec Anam.ai a échoué.";
    return error.message;
  }
  return "Une erreur est survenue pendant la session avatar.";
}
