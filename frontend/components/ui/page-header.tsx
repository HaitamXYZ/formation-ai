type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
