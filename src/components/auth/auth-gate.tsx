/**
 * AuthGate — wraps content that requires authentication.
 *
 * Uses Clerk for auth state.
 *
 * Usage:
 *   <AuthGate>
 *     <ProtectedContent />
 *   </AuthGate>
 */

"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { ShieldAlert, Loader2 } from "lucide-react";

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
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
