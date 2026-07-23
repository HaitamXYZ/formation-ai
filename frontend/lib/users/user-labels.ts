import type { UserRole } from "@/lib/users/user-types";

export const userRoleLabels: Record<UserRole, string> = {
  Admin: "Administrateur",
  Learner: "Apprenant",
};

export const userRoles: UserRole[] = ["Admin", "Learner"];
