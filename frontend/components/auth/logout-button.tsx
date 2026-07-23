"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    await logout();
    router.replace("/login");
  }

  return (
    <Button disabled={isSubmitting} onClick={handleLogout} variant="secondary">
      {isSubmitting ? "Déconnexion..." : "Se déconnecter"}
    </Button>
  );
}
