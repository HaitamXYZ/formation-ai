import { Button } from "@/components/ui/button";
import type { UserListItem } from "@/lib/users/user-types";

type UserActionsProps = {
  user: UserListItem;
  pending: boolean;
  onStatus: (user: UserListItem) => void;
};

export function UserActions({ user, pending, onStatus }: UserActionsProps) {
  return (
    <Button className="min-h-9 px-3 py-2 text-xs" disabled={pending} onClick={() => onStatus(user)} variant={user.isActive ? "ghost" : "secondary"}>
      {user.isActive ? "Desactiver" : "Reactiver"}
    </Button>
  );
}
