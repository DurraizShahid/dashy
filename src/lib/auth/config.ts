/**
 * Clerk auth configuration.
 *
 * This module provides compatibility helpers.
 * Clerk handles all auth state via its own SDK.
 */

export interface AuthConfig {
  /** Always true when Clerk is configured */
  isConfigured: boolean;
}

/** Whether Clerk auth is available. */
export function isAuthEnabled(): boolean {
  // Clerk is always configured when ClerkProvider is mounted
  return true;
}

/**
 * Canonical base URL for redirects.
 * Priority: NEXT_PUBLIC_BASE_URL > NEXT_PUBLIC_APP_URL
 */
export function getBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_BASE_URL or NEXT_PUBLIC_APP_URL must be set in production"
      );
    }
    return "http://localhost:3000";
  }

  return url.replace(/\/+$/, "");
}
