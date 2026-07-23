import { userRoleLabels } from "@/lib/users/user-labels";
import type { UserRole } from "@/lib/users/user-types";

export function UserStatusBadge({ isActive }: Readonly<{ isActive: boolean }>) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
      {isActive ? "Actif" : "Inactif"}
    </span>
  );
}

export function UserRoleBadge({ role }: Readonly<{ role: UserRole }>) {
  return (
    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
      {userRoleLabels[role] ?? role}
    </span>
  );
}
