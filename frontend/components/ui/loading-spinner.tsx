export function LoadingSpinner({ label = "Chargement" }: Readonly<{ label?: string }>) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-inherit" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
      <span>{label}</span>
    </span>
  );
}
