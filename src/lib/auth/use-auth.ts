"use client";

import { useState, useEffect, useCallback } from "react";
import { isAuthEnabled } from "./config";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: {
    sub: string;
    email?: string | null;
    name?: string | null;
    preferredUsername?: string | null;
  } | null;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<AuthState["session"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated) {
        setSession({
          sub: data.sub,
          email: data.email,
          name: data.name,
          preferredUsername: data.preferredUsername,
        });
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(() => {
    window.location.href = "/api/auth/login";
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/auth/logout";
  }, []);

  return {
    isAuthenticated: session !== null,
    isLoading,
    session,
    login,
    logout,
  };
}

export function useIsAuthConfigured(): boolean {
  const [configured] = useState(isAuthEnabled);
  return configured;
}
