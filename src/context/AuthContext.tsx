"use client";

import {
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";
import type { PublicUser } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: PublicUser | null;
  token: string | null;
  /** Legacy no-op; real sign-in uses `useLoginMutation`. */
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) setSessionCookie();
    else clearSessionCookie();
  }, [token]);

  useEffect(() => {
    return useAuthStore.persist.onFinishHydration(() => {
      if (useAuthStore.getState().token) setSessionCookie();
    });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    clearSessionCookie();
    queryClient.removeQueries({ queryKey: ["auth"] });
    router.push("/signin");
    router.refresh();
  }, [clearSession, queryClient, router]);

  const login = useCallback(() => {
    setSessionCookie();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: !!token && !!user,
      user,
      token,
      login,
      logout,
    }),
    [token, user, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
