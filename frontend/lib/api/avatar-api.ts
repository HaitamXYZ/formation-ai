import { apiRequest } from "@/lib/api/api-client";
import type { AvatarSession, CreateAvatarSessionPayload } from "@/lib/avatar/avatar-types";

export function createAvatarSession(payload: CreateAvatarSessionPayload): Promise<AvatarSession> {
  return apiRequest<AvatarSession>("/api/ai-avatar/session", {
    method: "POST",
    body: payload,
  });
}
