"use client";

import { Button } from "@/components/ui/button";
import type { AIConversationListItem } from "@/lib/ai-trainer/ai-trainer-types";

type AIConversationSidebarProps = {
  conversations: AIConversationListItem[];
  activeConversationId: number | null;
  onSelect: (conversationId: number) => void;
  onDelete: (conversationId: number) => Promise<void>;
};

export function AIConversationSidebar({ conversations, activeConversationId, onSelect, onDelete }: AIConversationSidebarProps) {
  if (conversations.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">Aucune conversation enregistrée pour ce contexte.</p>;
  }

  return (
    <div className="grid gap-2.5">
      {conversations.map((conversation) => (
        <article className={`rounded-2xl border p-4 transition ${activeConversationId === conversation.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"}`} key={conversation.id}>
          <button className="block w-full text-left text-[15px] font-semibold text-slate-950" onClick={() => onSelect(conversation.id)} type="button">
            {conversation.title}
          </button>
          <p className="mt-1 text-xs text-slate-500">{conversation.trainingModuleTitle ?? "Toute la formation"}</p>
          <Button className="mt-3 min-h-10 px-3 py-1.5 text-sm" onClick={() => void onDelete(conversation.id)} variant="ghost">Supprimer</Button>
        </article>
      ))}
    </div>
  );
}
