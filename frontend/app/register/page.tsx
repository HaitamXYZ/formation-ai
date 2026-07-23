"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { register } from "@/lib/api/auth-api";
import { getErrorMessage } from "@/lib/api/api-error";
import { getDashboardPath, getPrimaryRole } from "@/lib/auth/auth-utils";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, primaryRole, setAuthenticatedUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!firstName.trim() || !lastName.trim() || !email.includes("@")) {
      setError("Veuillez renseigner votre prénom, votre nom et une adresse e-mail valide.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await register({
        firstName,
        lastName,
        email,
        password,
      });
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
        title="Inscription"
        description="Créez un compte apprenant. Les rôles formateur et administrateur seront gérés séparément."
        onSubmit={handleSubmit}
      >
        <ErrorMessage message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            autoComplete="given-name"
            label="Prénom"
            name="firstName"
            onChange={(event) => setFirstName(event.target.value)}
            required
            type="text"
            value={firstName}
          />
          <FormField
            autoComplete="family-name"
            label="Nom"
            name="lastName"
            onChange={(event) => setLastName(event.target.value)}
            required
            type="text"
            value={lastName}
          />
        </div>
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
          autoComplete="new-password"
          label="Mot de passe"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <FormField
          autoComplete="new-password"
          label="Confirmer le mot de passe"
          name="confirmPassword"
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          type="password"
          value={confirmPassword}
        />
        <Button disabled={isSubmitting || isLoading} type="submit">
          {isSubmitting ? <LoadingSpinner label="Inscription" /> : "Créer mon compte"}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Vous avez déjà un compte ?{" "}
          <Link className="font-semibold text-teal-700 hover:text-teal-800" href="/login">
            Se connecter
          </Link>
        </p>
      </AuthForm>
    </main>
  );
}
