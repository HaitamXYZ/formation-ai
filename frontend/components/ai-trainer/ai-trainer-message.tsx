import type { AIMessage } from "@/lib/ai-trainer/ai-trainer-types";

export function AITrainerMessage({ message, sources = [] }: Readonly<{ message: AIMessage; sources?: string[] }>) {
  const isUser = message.role === "User";

  return (
    <article className={`chat-message-enter rounded-2xl border p-4 ${isUser ? "ml-5 border-indigo-100 bg-indigo-50" : "mr-5 border-slate-200 bg-white"}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{isUser ? "Vous" : "Formateur IA"}</p>
        <time className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString("fr-FR")}</time>
      </div>
      <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{message.content}</p>
      {!isUser && sources.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3" aria-label="Sources utilisees">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sources</span>
          {sources.map((source) => <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700" key={source}>{source}</span>)}
        </div>
      ) : null}
    </article>
  );
}
