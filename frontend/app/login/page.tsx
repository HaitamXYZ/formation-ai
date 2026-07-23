"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/components/auth/auth-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { login } from "@/lib/api/auth-api";
import { getErrorMessage } from "@/lib/api/api-error";
import { getDashboardPath, getPrimaryRole } from "@/lib/auth/auth-utils";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, primaryRole, setAuthenticatedUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getDashboardPath(primaryRole));
    }
  }, [isAuthenticated, isLoading, primaryRole, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.includes("@") || password.length === 0) {
      setError("Veuillez saisir une adresse e-mail valide et un mot de passe.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      setAuthenticatedUser(user);
      router.replace(getDashboardPath(getPrimaryRole(user)));
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
      <AuthForm
        title="Connexion"
        description="Accédez à votre espace FormationAI avec votre compte."
        onSubmit={handleSubmit}
      >
        <ErrorMessage message={error} />
        <FormField
          autoComplete="email"
          label="Adresse e-mail"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <FormField
          autoComplete="current-password"
          label="Mot de passe"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <Button disabled={isSubmitting || isLoading} type="submit">
          {isSubmitting ? <LoadingSpinner label="Connexion" /> : "Se connecter"}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link className="font-semibold text-teal-700 hover:text-teal-800" href="/register">
            Créer un compte apprenant
          </Link>
        </p>
      </AuthForm>
    </main>
  );
}
