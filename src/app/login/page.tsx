/**
 * Login page — redirects to Keycloak or shows configuration status.
 *
 * If Keycloak is configured, renders a "Sign in with Keycloak" button.
 * If not configured, shows a clear informational message.
 */

"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Loader2, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";

interface LoginState {
  status: "loading" | "configured" | "unconfigured";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [state, setState] = useState<LoginState>({ status: "loading" });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/hive-mind");
        } else if (data.configured) {
          setState({ status: "configured" });
        } else {
          setState({ status: "unconfigured" });
        }
      })
      .catch(() => {
        setState({ status: "unconfigured" });
      });
  }, [router]);

  function handleLogin() {
    const redirectTo = searchParams.get("redirectTo") || "/hive-mind";
    window.location.href = `/api/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`;
  }

  return (
    <div className="bg-background h-screen overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        {state.status === "loading" && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Checking authentication...</p>
          </div>
        )}

        {state.status === "unconfigured" && (
          <div className="rounded-[20px] bg-card p-8 shadow-card text-center">
            <ShieldOff className="size-10 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-poppins text-xl font-semibold text-foreground mb-2">
              Authentication Not Configured
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              Keycloak authentication is not configured. To enable login, set
              the required environment variables:
            </p>
            <div className="text-left bg-muted rounded-xl p-3 text-xs font-mono text-muted-foreground space-y-1 mb-4">
              <p>NEXT_PUBLIC_KEYCLOAK_URL</p>
              <p>NEXT_PUBLIC_KEYCLOAK_REALM</p>
              <p>NEXT_PUBLIC_KEYCLOAK_CLIENT_ID</p>
              <p>KEYCLOAK_CLIENT_SECRET</p>
              <p>SESSION_ENCRYPTION_KEY</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Once configured, restart the server and this page will show the
              login button.
            </p>
          </div>
        )}

        {state.status === "configured" && (
          <div className="rounded-[20px] bg-card p-8 shadow-card text-center">
            <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="size-7 text-primary" />
            </div>
            <h1 className="font-poppins text-xl font-semibold text-foreground mb-2">
              Sign in to Dashy
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Authenticate with your Keycloak account to access Hive Mind and
              protected features.
            </p>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3 mb-4 text-left">
                <p className="text-xs text-destructive font-medium">
                  Authentication error
                </p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full justify-center"
            >
              <LogIn className="size-4" />
              Sign in with Keycloak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background h-screen overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
