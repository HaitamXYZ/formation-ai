import Link from "next/link";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminPage() {
  return (
    <DashboardLayout expectedRole="Admin" title="Tableau de bord">
      <PageHeader eyebrow="Administration" title="Pilotez la plateforme" description="Gerez les referentiels, les contenus et les acces." />
      <AdminNavigation />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["/admin/categories", "Categories", "Structurer le catalogue"],
          ["/admin/trainings", "Formations", "Publier et organiser les modules"],
          ["/admin/users", "Utilisateurs", "Gerer les acces"],
        ].map(([href, title, description]) => (
          <Link href={href} key={href}>
            <Card className="interactive-card h-full">
              <h2 className="text-lg font-bold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              <span className="mt-5 block text-sm font-bold text-indigo-700">Ouvrir {"->"}</span>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}

