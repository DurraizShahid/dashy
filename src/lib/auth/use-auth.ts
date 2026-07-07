/**
 * useAuth hook — manages authentication state via server-side session.
 *
 * Reads session state from GET /api/auth/session.
 * No tokens are stored in localStorage.
 *
 * Usage:
 *   const { isAuthenticated, isLoading, user, login, logout } = useAuth();
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { isAuthEnabled } from "./config";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { name?: string; email?: string } | null;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user ?? null);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    window.location.href = "/api/auth/login";
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/auth/logout";
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
}

/**
 * Whether the app should treat auth as "available" (Keycloak configured).
 */
export function useIsAuthConfigured(): boolean {
  const [configured] = useState(isAuthEnabled);
  return configured;
}
