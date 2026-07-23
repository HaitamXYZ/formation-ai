"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/components/auth/auth-provider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CatalogIcon, CloseIcon, HomeIcon, MenuIcon, TrainingIcon, UsersIcon } from "@/components/ui/icons";
import type { UserRole } from "@/lib/auth/auth-types";
import { canAccessDashboard, getDashboardPath, roleLabels } from "@/lib/auth/auth-utils";

type DashboardLayoutProps = {
  expectedRole: UserRole;
  title: string;
  children: React.ReactNode;
  immersive?: boolean;
};

const navigation: Record<UserRole, { href: string; label: string; icon: typeof HomeIcon }[]> = {
  Admin: [
    { href: "/admin", label: "Vue d'ensemble", icon: HomeIcon },
    { href: "/admin/categories", label: "Catégories", icon: CatalogIcon },
    { href: "/admin/trainings", label: "Formations", icon: TrainingIcon },
    { href: "/admin/users", label: "Utilisateurs", icon: UsersIcon },
  ],
  Learner: [
    { href: "/learner", label: "Accueil", icon: HomeIcon },
    { href: "/learner/catalog", label: "Catalogue", icon: CatalogIcon },
    { href: "/learner/trainings", label: "Mes formations", icon: TrainingIcon },
  ],
};

export function DashboardLayout({ expectedRole, title, children, immersive = false }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, primaryRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canAccessDashboard(`/${expectedRole.toLowerCase()}`, primaryRole)) {
      router.replace(getDashboardPath(primaryRole));
    }
  }, [expectedRole, isLoading, primaryRole, router, user]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>("a, button:not([disabled])"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  if (isLoading || !user || primaryRole !== expectedRole) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <LoadingSpinner label="Vérification de la session" />
      </main>
    );
  }

  const navItems = navigation[primaryRole];
  const sidebarContent = (
    <>
      <Link className="flex items-center gap-3 rounded-2xl px-2 py-3 text-xl font-bold tracking-tight text-white" href="/" onClick={() => setMobileOpen(false)}>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-base shadow-lg shadow-indigo-950/30">F</span>
        FormationAI
      </Link>
      <p className="mt-8 px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{roleLabels[primaryRole]}</p>
      <nav aria-label={`Navigation ${roleLabels[primaryRole]}`} className="mt-3 grid gap-1.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== getDashboardPath(primaryRole) && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition ${active ? "bg-white text-slate-950 shadow-sm before:absolute before:-left-2 before:h-7 before:w-1 before:rounded-full before:bg-cyan-400" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              href={item.href}
              key={item.href}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className={active ? "text-indigo-700" : "text-slate-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
        <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>
        <div className="mt-4"><LogoutButton /></div>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen ${immersive ? "" : "lg:grid lg:grid-cols-[272px_minmax(0,1fr)]"}`}>
      <aside className={`${immersive ? "hidden" : "hidden border-r border-white/5 bg-slate-950 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-5"}`}>
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className={`drawer-overlay fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm ${immersive ? "" : "lg:hidden"}`} onMouseDown={(event) => event.target === event.currentTarget && setMobileOpen(false)}>
          <aside aria-label="Menu principal" aria-modal="true" className="drawer-panel flex h-full w-[min(88vw,320px)] flex-col bg-slate-950 p-5 text-white shadow-2xl" ref={drawerRef} role="dialog">
            <button aria-label="Fermer le menu" className="ml-auto grid h-11 w-11 place-items-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setMobileOpen(false)} type="button">
              <CloseIcon />
            </button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-40 h-[72px] border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className={`mx-auto flex h-full items-center justify-between gap-4 ${immersive ? "max-w-none" : "max-w-[1500px]"}`}>
            <div className="flex min-w-0 items-center gap-3">
              <button aria-label="Ouvrir le menu" className={`h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 ${immersive ? "grid" : "grid lg:hidden"}`} onClick={() => setMobileOpen(true)} type="button">
                <MenuIcon />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">{roleLabels[primaryRole]}</p>
                <p className="truncate text-lg font-bold text-slate-950 sm:text-xl">{title}</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
            </div>
          </div>
        </header>

        <main className={`page-enter mx-auto grid content-start min-h-[calc(100vh-72px)] w-full gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10 ${immersive ? "max-w-none" : "max-w-[1500px]"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}



