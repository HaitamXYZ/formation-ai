import { apiRequest } from "@/lib/api/api-client";
import type { AIUsageSummary } from "@/lib/catalog/catalog-types";

export function getAIUsage(): Promise<AIUsageSummary> {
  return apiRequest<AIUsageSummary>("/api/assistant/usage", { cache: "no-store" });
}

