/**
 * AuthGate — wraps content that requires authentication.
 *
 * Uses the server-side Keycloak session for auth state.
 * No localStorage tokens are used.
 *
 * When Keycloak is not configured, shows an informative message.
 * When Keycloak IS configured but the user is not authenticated,
 * shows a prompt to log in.
 *
 * Usage:
 *   <AuthGate>
 *     <ProtectedContent />
 *   </AuthGate>
 */

"use client";

import { useAuth, useIsAuthConfigured } from "@/lib/auth/use-auth";
import { ShieldAlert, Lock, Loader2 } from "lucide-react";

interface AuthGateProps {
  children: React.ReactNode;
  /** Title for the unauthorized state. */
  title?: string;
  /** Description of what this section does (shown when unauth'd). */
  description?: string;
}

export function AuthGate({
  children,
  title = "Authentication Required",
  description,
}: AuthGateProps) {
  const { isAuthenticated, isLoading, login } = useAuth();
  const isConfigured = useIsAuthConfigured();

  // Still loading auth state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="size-4 animate-spin" />
        <span>Checking authentication...</span>
      </div>
    );
  }

  // Authenticated — render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Auth not configured — show informative message
  if (!isConfigured) {
    return (
      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <div className="flex items-start gap-3">
          <Lock className="size-5 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-poppins font-semibold text-foreground text-sm">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description ||
                "This feature requires authentication with the Hive Mind API. " +
                  "Authentication will be available once Keycloak is configured and deployed."}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Set up Keycloak environment variables to enable protected features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Auth configured but not logged in
  return (
    <div className="rounded-[20px] bg-card p-6 shadow-card">
      <div className="flex items-start gap-3">
        <ShieldAlert className="size-5 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <h3 className="font-poppins font-semibold text-foreground text-sm">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {description || "Please log in to access this feature."}
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
          >
            Sign in with Keycloak
          </button>
        </div>
      </div>
    </div>
  );
}
