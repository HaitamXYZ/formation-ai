"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/trainings", label: "Formations" },
  { href: "/admin/users", label: "Utilisateurs" },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation administrateur secondaire" className="flex h-14 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-2 shadow-sm">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            className={`inline-flex h-10 shrink-0 items-center rounded-lg border-b-2 px-4 text-sm font-semibold transition ${
              isActive
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
