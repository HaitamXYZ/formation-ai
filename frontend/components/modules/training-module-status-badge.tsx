export function TrainingModuleStatusBadge({ isPublished }: Readonly<{ isPublished: boolean }>) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
      {isPublished ? "Publie" : "Brouillon"}
    </span>
  );
}
