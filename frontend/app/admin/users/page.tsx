"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminNavigation } from "@/components/layout/admin-navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UserActions } from "@/components/users/user-actions";
import { UserRoleBadge, UserStatusBadge } from "@/components/users/user-badges";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getErrorMessage } from "@/lib/api/api-error";
import { getUsers, updateUserStatus } from "@/lib/api/user-api";
import { userRoles } from "@/lib/users/user-labels";
import type { PaginatedUsersResponse, UserFilters, UserListItem } from "@/lib/users/user-types";

const initialFilters: UserFilters = {
  page: 1,
  pageSize: 10,
  search: "",
  role: "",
  isActive: "",
  sortBy: "createdAt",
  sortDirection: "desc",
};

export default function AdminUsersPage() {
  const [response, setResponse] = useState<PaginatedUsersResponse | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh(currentFilters = filters) {
    setIsLoading(true);
    setError(null);
    try {
      setResponse(await getUsers(currentFilters));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        const users = await getUsers(filters);
        if (isMounted) setResponse(users);
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadUsers();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  function updateFilter(name: keyof UserFilters, value: string) {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  }

  async function handleStatus(user: UserListItem) {
    const confirmed = window.confirm(user.isActive ? "Desactiver cet utilisateur ?" : "Reactiver cet utilisateur ?");
    if (!confirmed) return;

    setPendingId(user.id);
    setFeedback(null);
    setError(null);
    try {
      await updateUserStatus(user.id, { isActive: !user.isActive });
      await refresh();
      setFeedback(user.isActive ? "Utilisateur desactive." : "Utilisateur reactive.");
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    } finally {
      setPendingId(null);
    }
  }
  return (
    <DashboardLayout expectedRole="Admin" title="Gestion des utilisateurs">
      <AdminNavigation />
      <div className="grid gap-5">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Utilisateurs</h2>
          <p className="mt-1 text-sm text-slate-600">Consultez les comptes, les statuts et les roles.</p>
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
          <input className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("search", event.target.value)} placeholder="Recherche" value={filters.search} />
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("role", event.target.value)} value={filters.role}>
            <option value="">Tous les roles</option>
            {userRoles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("isActive", event.target.value)} value={filters.isActive}>
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => updateFilter("sortBy", event.target.value)} value={filters.sortBy}>
            <option value="createdAt">Date</option>
            <option value="firstName">Prenom</option>
            <option value="lastName">Nom</option>
            <option value="email">Email</option>
            <option value="status">Statut</option>
          </select>
        </div>

        {feedback ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}
        <ErrorMessage message={error} />
        {isLoading ? <LoadingSpinner label="Chargement des utilisateurs" /> : null}

        {!isLoading && response?.items.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">Aucun utilisateur trouve.</div>
        ) : null}

        {!isLoading && response && response.items.length > 0 ? (
          <>
            <div className="data-surface overflow-x-auto">
              <table className="min-w-[980px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Roles</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Formations</th>
                    <th className="px-4 py-3">Inscription</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {response.items.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3">
                        <Link className="font-semibold text-slate-950 hover:text-teal-700" href={`/admin/users/${user.id}`}>{user.fullName}</Link>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{user.roles.map((role) => <UserRoleBadge key={role} role={role} />)}</div></td>
                      <td className="px-4 py-3"><UserStatusBadge isActive={user.isActive} /></td>
                      <td className="px-4 py-3">{user.assignedTrainingsCount}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3"><UserActions user={user} pending={pendingId === user.id} onStatus={(item) => void handleStatus(item)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination response={response} setFilters={setFilters} />
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function Pagination({ response, setFilters }: Readonly<{ response: PaginatedUsersResponse; setFilters: React.Dispatch<React.SetStateAction<UserFilters>> }>) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>Page {response.page} sur {response.totalPages || 1} - {response.totalItems} utilisateur(s)</span>
      <div className="flex gap-2">
        <Button disabled={response.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} variant="secondary">Precedent</Button>
        <Button disabled={response.totalPages === 0 || response.page >= response.totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} variant="secondary">Suivant</Button>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

