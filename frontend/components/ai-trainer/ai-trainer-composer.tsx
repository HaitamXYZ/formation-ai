"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type AITrainerComposerProps = {
  disabled: boolean;
  onSubmit: (question: string) => Promise<void>;
};

const maxQuestionLength = 2000;

export function AITrainerComposer({ disabled, onSubmit }: AITrainerComposerProps) {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion || normalizedQuestion.length > maxQuestionLength) return;

    setIsSubmitting(true);
    try {
      await onSubmit(normalizedQuestion);
      setQuestion("");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = disabled || isSubmitting || !question.trim() || question.length > maxQuestionLength;

  return (
    <form className="grid gap-3 border-t border-slate-200 bg-white p-4" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="aiQuestion">
        Votre question au formateur IA
      </label>
      <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
        <textarea
          className="min-h-24 w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-6 text-slate-950 outline-none placeholder:text-slate-400"
          disabled={disabled || isSubmitting}
          id="aiQuestion"
          maxLength={maxQuestionLength}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Écrivez votre question…"
          value={question}
        />
        <div className="flex items-center justify-between gap-3 px-1 pb-1">
          <span className="text-xs text-slate-500">{question.length}/{maxQuestionLength}</span>
          <Button className="min-h-10 px-4 py-2" disabled={isDisabled} type="submit">
            {isSubmitting ? <LoadingSpinner label="Envoi" /> : "Envoyer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
