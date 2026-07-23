"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, logout as logoutRequest } from "@/lib/api/auth-api";
import { ApiError } from "@/lib/api/api-error";
import type { AppUser, AuthContextValue } from "@/lib/auth/auth-types";
import { getPrimaryRole } from "@/lib/auth/auth-utils";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        console.error(error);
      }

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          console.error(error);
        }

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      primaryRole: getPrimaryRole(user),
      setAuthenticatedUser: setUser,
      refreshUser,
      logout,
    }),
    [isLoading, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
