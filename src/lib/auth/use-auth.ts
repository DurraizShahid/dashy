"use client";

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: {
    sub: string;
    email?: string | null;
    name?: string | null;
  } | null;
  user: {
    name: string | null;
    email: string | null;
  } | null;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const { isLoaded, isSignedIn, userId, signOut } = useClerkAuth();
  const { user } = useUser();
  const router = useRouter();

  const session = isLoaded && isSignedIn && userId
    ? {
        sub: userId,
        email: user?.emailAddresses?.[0]?.emailAddress ?? null,
        name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
      }
    : null;

  const login = useCallback(() => {
    router.push("/sign-in");
  }, [router]);

  const logout = useCallback(() => {
    signOut({ redirectUrl: "/" });
  }, [signOut]);

  return {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    session,
    user: session ? { name: session.name, email: session.email } : null,
    login,
    logout,
  };
}

export function useIsAuthConfigured(): boolean {
  // Clerk is always configured when the SDK is installed and ClerkProvider is mounted
  return true;
}
