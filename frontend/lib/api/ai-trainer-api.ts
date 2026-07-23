import { apiRequest } from "@/lib/api/api-client";
import type {
  AIConversation,
  AIConversationListItem,
  AITrainerAnswer,
  AITrainerTrainingOption,
  AskAITrainerPayload,
  CreateAIConversationPayload,
} from "@/lib/ai-trainer/ai-trainer-types";

export function getAITrainerTrainingOptions(): Promise<AITrainerTrainingOption[]> {
  return apiRequest<AITrainerTrainingOption[]>("/api/assistant/trainings", { method: "GET", cache: "no-store" });
}

export function createAIConversation(payload: CreateAIConversationPayload): Promise<AIConversation> {
  return apiRequest<AIConversation>("/api/assistant/conversations", { method: "POST", body: payload });
}

export function getAIConversations(moduleId?: number): Promise<AIConversationListItem[]> {
  const query = moduleId ? `?moduleId=${moduleId}` : "";
  return apiRequest<AIConversationListItem[]>(`/api/assistant/conversations${query}`, { method: "GET", cache: "no-store" });
}

export function getAIConversation(id: number): Promise<AIConversation> {
  return apiRequest<AIConversation>(`/api/assistant/conversations/${id}`, { method: "GET", cache: "no-store" });
}

export function askAITrainer(payload: AskAITrainerPayload): Promise<AITrainerAnswer> {
  return apiRequest<AITrainerAnswer>("/api/assistant/ask", { method: "POST", body: payload });
}

export function deleteAIConversation(id: number): Promise<void> {
  return apiRequest<void>(`/api/assistant/conversations/${id}`, { method: "DELETE" });
}

