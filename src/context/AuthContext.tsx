"use client";

import {
  clearSessionCookie,
  hasSessionCookie,
  setSessionCookie,
} from "@/lib/auth-session";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(hasSessionCookie());
  }, []);

  const login = useCallback(() => {
    setSessionCookie();
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearSessionCookie();
    setIsAuthenticated(false);
    router.push("/signin");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout]
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
