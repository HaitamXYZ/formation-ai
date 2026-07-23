import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(30,41,59,0.06)] ${className}`}
      {...props}
    />
  );
}
