"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    document.querySelector<HTMLButtonElement>("[data-dialog-cancel]")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPending, onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]" role="presentation">
      <section
        aria-describedby="confirm-description"
        aria-labelledby="confirm-title"
        aria-modal="true"
        className="page-enter w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <h2 className="text-xl font-bold text-slate-950" id="confirm-title">{title}</h2>
        <p className="mt-3 leading-7 text-slate-600" id="confirm-description">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button data-dialog-cancel disabled={isPending} onClick={onCancel} variant="secondary">Conserver l&apos;inscription</Button>
          <Button disabled={isPending} onClick={onConfirm} variant="danger">{isPending ? "Annulation..." : confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}
