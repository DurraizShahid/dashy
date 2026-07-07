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

export function getAuthConfig(): AuthConfig {
  return {
    keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  };
}

/** Whether Keycloak auth is fully configured. */
export function isAuthEnabled(): boolean {
  const cfg = getAuthConfig();
  return !!(cfg.keycloakUrl && cfg.realm && cfg.clientId);
}
