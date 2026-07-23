import type { AITrainerAnswer } from "@/lib/ai-trainer/ai-trainer-types";

export type AvatarConnectionStatus =
  | "idle"
  | "connecting"
  | "permission"
  | "ready"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "muted"
  | "ended"
  | "error";

export type AvatarSessionState = {
  status: AvatarConnectionStatus;
  isActive: boolean;
  isMuted: boolean;
  error: string | null;
  expiresAt: string | null;
};

export type CreateAvatarSessionPayload = {
  conversationId: number;
};

export type AvatarSession = {
  sessionToken: string;
  expiresAt: string;
  provider: string;
};

export type AvatarError = {
  message: string;
  cause?: unknown;
};

export type VoiceQuestionHandler = (question: string) => Promise<AITrainerAnswer>;
