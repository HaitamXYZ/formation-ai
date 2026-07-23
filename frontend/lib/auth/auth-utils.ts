import type { AppUser, UserRole } from "@/lib/auth/auth-types";

export const AUTH_COOKIE_NAME = "formationai.auth";

export const roleLabels: Record<UserRole, string> = {
  Admin: "Administrateur",
  Learner: "Apprenant",
};

const rolePriority: UserRole[] = ["Admin", "Learner"];

export function getPrimaryRole(user: AppUser | null): UserRole | null {
  if (!user) return null;
  return rolePriority.find((role) => user.roles.includes(role)) ?? null;
}

export function getDashboardPath(role: UserRole | null): string {
  switch (role) {
    case "Admin":
      return "/admin";
    case "Learner":
      return "/learner";
    default:
      return "/login";
  }
}

export function canAccessDashboard(pathname: string, role: UserRole | null): boolean {
  if (pathname.startsWith("/admin")) return role === "Admin";
  if (pathname.startsWith("/learner")) return role === "Learner";
  return true;
}
