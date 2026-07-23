import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
          <div className="page-enter">
            <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-800">Formation · contenu · conversation réelle</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Apprenez avec un <span className="bg-gradient-to-r from-indigo-700 to-cyan-600 bg-clip-text text-transparent">formateur IA</span> disponible à tout moment.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Accédez à vos modules, posez vos questions par écrit ou parlez naturellement avec l’avatar Anam dans un même espace pédagogique.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-700 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-800" href="/register">Créer un compte apprenant</Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-800 hover:bg-slate-50" href="/login">Consulter les formations</Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-300/30 to-cyan-200/30 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 p-3 shadow-2xl">
              <div className="grid aspect-[4/3] grid-cols-[.7fr_1.3fr] gap-3 rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-indigo-950 p-4">
                <div className="grid content-between rounded-2xl bg-white/8 p-4">
                  <div><span className="block h-2 w-16 rounded bg-cyan-300/80" /><span className="mt-3 block h-2 w-24 rounded bg-white/20" /></div>
                  <div className="grid gap-2">{[1, 2, 3].map((item) => <span className="h-10 rounded-xl border border-white/10 bg-white/5" key={item} />)}</div>
                </div>
                <div className="grid gap-3">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/40 to-cyan-400/20">
                    <div className="absolute inset-x-10 bottom-0 h-[80%] rounded-t-[50%] bg-gradient-to-t from-slate-900 to-indigo-300/60" />
                    <div className="absolute bottom-5 left-5 rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-slate-950">FORMATEUR VOCAL PRÊT</div>
                  </div>
                  <div className="grid h-28 content-center gap-2 rounded-2xl bg-white p-4">
                    <span className="h-2 w-3/4 rounded bg-slate-200" />
                    <span className="h-2 w-1/2 rounded bg-indigo-200" />
                    <span className="mt-2 h-8 rounded-xl border border-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white/70">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Un parcours simple</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ["01", "Choisir une formation", "Explorez uniquement les formations réellement publiées."],
                ["02", "Accéder au contenu", "Consultez les modules, vidéos et documents disponibles."],
                ["03", "Parler au formateur IA", "Utilisez le texte ou votre microphone avec l’avatar Anam."],
              ].map(([number, title, description]) => (
                <article className="interactive-card rounded-2xl border border-slate-200 bg-white p-6" key={number}>
                  <span className="text-sm font-black text-cyan-600">{number}</span>
                  <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
                  <p className="mt-2 leading-7 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
