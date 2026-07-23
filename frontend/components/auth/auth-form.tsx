import Link from "next/link";
import { SparklesIcon } from "@/components/ui/icons";

type AuthFormProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};

export function AuthForm({ title, description, children, onSubmit }: AuthFormProps) {
  return (
    <section className="page-enter grid w-full max-w-[1240px] overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_32px_100px_rgba(30,41,59,0.16)] lg:min-h-[680px] lg:grid-cols-[minmax(0,1fr)_560px]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <Link className="relative flex items-center gap-3 text-xl font-bold" href="/">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-xl shadow-indigo-950/40">F</span>
          FormationAI
        </Link>
        <div className="relative max-w-lg">
          <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-cyan-300"><SparklesIcon className="h-7 w-7" /></span>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Apprentissage augmenté</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.04em]">Un formateur IA qui vous écoute et vous répond.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">Progressez dans vos modules, posez vos questions à voix haute et recevez une réponse contextualisée par votre avatar formateur.</p>
        </div>
        <div className="relative grid grid-cols-3 gap-3 text-sm text-slate-300">
          <span className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3">Contenu structuré</span>
          <span className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3">Échange vocal</span>
          <span className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3">Suivi continu</span>
        </div>
      </aside>

      <div className="flex items-center p-6 sm:p-10 lg:p-12">
        <div className="mx-auto w-full max-w-[480px]">
          <Link className="mb-9 flex items-center gap-3 text-lg font-bold text-slate-950 lg:hidden" href="/">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-700 to-cyan-500 text-white">F</span>
            FormationAI
          </Link>
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700">Bienvenue</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
          </div>
          <form className="grid gap-5" onSubmit={onSubmit}>
            {children}
          </form>
        </div>
      </div>
    </section>
  );
}
