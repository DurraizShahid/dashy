/**
 * useAuth hook — manages authentication state.
 *
 * In Phase 1 (pre-Keycloak), auth state is driven by a manually-set token
 * stored in localStorage. Once Keycloak is deployed, this hook will be
 * replaced with real OIDC token management.
 *
 * Usage:
 *   const { isAuthenticated, isLoading, token, login, logout } = useAuth();
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { isAuthEnabled } from "./config";

const TOKEN_STORAGE_KEY = "hm_auth_token";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  // Lazy initialize from localStorage (safe: only runs client-side)
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [isLoading] = useState(false);

  const login = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
  }, []);

  return {
    isAuthenticated: !!token,
    isLoading,
    token,
    login,
    logout,
  };
}

/**
 * Whether the app should treat auth as "available" (Keycloak configured).
 * If auth isn't configured, protected sections show a message rather than
 * a login prompt.
 *
 * Reads env vars which are inlined at build time, so this is synchronous.
 */
export function useIsAuthConfigured(): boolean {
  const [configured] = useState(isAuthEnabled);
  return configured;
}
