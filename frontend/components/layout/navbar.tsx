import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link className="flex items-center gap-3 text-lg font-bold text-slate-950" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-700 to-cyan-500 text-white shadow-lg shadow-indigo-200">F</span>
          FormationAI
        </Link>
        <div className="flex items-center gap-2">
          <Link className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/login">
            Connexion
          </Link>
          <Link className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800" href="/register">
            Inscription
          </Link>
        </div>
      </nav>
    </header>
  );
}
