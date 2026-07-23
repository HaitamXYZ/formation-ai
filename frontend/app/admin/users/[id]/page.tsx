"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UserRoleBadge, UserStatusBadge } from "@/components/users/user-badges";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getUser } from "@/lib/api/user-api";
import { getErrorMessage } from "@/lib/api/api-error";
import { trainingStatusLabels } from "@/lib/trainings/training-labels";
import type { UserDetails } from "@/lib/users/user-types";

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const item = await getUser(params.id);
        if (isMounted) setUser(item);
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadUser();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  return (
    <DashboardLayout expectedRole="Admin" title="Detail utilisateur">
      <AdminNavigation />
      <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href="/admin/users">Retour aux utilisateurs</Link>
      {isLoading ? <LoadingSpinner label="Chargement de l'utilisateur" /> : null}
      <ErrorMessage message={error} />
      {!isLoading && user ? (
        <div className="mt-5 grid gap-5">
          <section className="rounded-md border border-slate-200 bg-white p-5">
            <h2 className="text-2xl font-bold text-slate-950">{user.fullName}</h2>
            <p className="mt-1 text-sm text-slate-600">{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <UserStatusBadge isActive={user.isActive} />
              {user.roles.map((role) => <UserRoleBadge key={role} role={role} />)}
            </div>
            <p className="mt-4 text-sm text-slate-600">Inscrit le {formatDate(user.createdAt)}</p>
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-950">Formations attribuees</h3>
            {user.assignedTrainings.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">Aucune formation attribuee.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {user.assignedTrainings.map((training) => (
                  <Link className="rounded-md border border-slate-200 p-3 hover:bg-slate-50" href={`/admin/trainings/${training.id}`} key={training.id}>
                    <div className="font-semibold text-slate-950">{training.title}</div>
                    <div className="text-sm text-slate-600">{training.categoryName} - {trainingStatusLabels[training.status]}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}
