/**
 * Keycloak / OIDC authentication configuration.
 *
 * All values are optional — when unset, the app runs in public-only mode
 * and protected features display a "requires authentication" message.
 *
 * To enable auth, set the following environment variables:
 *   NEXT_PUBLIC_KEYCLOAK_URL        https://keycloak.yourdomain.com
 *   NEXT_PUBLIC_KEYCLOAK_REALM      your-realm
 *   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID  your-client-id
 *   KEYCLOAK_CLIENT_SECRET          (server-only) your-client-secret
 */

export interface AuthConfig {
  keycloakUrl?: string;
  realm?: string;
  clientId?: string;
}

export interface ServerAuthConfig extends AuthConfig {
  clientSecret?: string;
}

/** Public-safe config — safe to pass to client components. */
export function getAuthConfig(): AuthConfig {
  return {
    keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  };
}

/** Server-only config — includes client secret. Never import in client code. */
export function getServerAuthConfig(): ServerAuthConfig {
  return {
    ...getAuthConfig(),
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  };
}

/** Whether Keycloak auth is fully configured. */
export function isAuthEnabled(): boolean {
  const cfg = getAuthConfig();
  return !!(cfg.keycloakUrl && cfg.realm && cfg.clientId);
}

/**
 * Canonical base URL for redirects.
 * Priority: NEXT_PUBLIC_BASE_URL > NEXT_PUBLIC_APP_URL
 * In production, throws if neither is set (avoids silent localhost redirects).
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
