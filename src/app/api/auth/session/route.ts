/**
 * GET /api/auth/session
 *
 * Returns client-safe session information (no tokens exposed).
 * Used by the useAuth hook to determine authentication state.
 *
 * Response:
 *   { authenticated: boolean, configured: boolean, user?: { name?, email? } }
 */

import { NextResponse } from "next/server";
import { getSessionInfo, getSessionPayload, getKeycloakConfig } from "@/lib/auth/session";

export async function GET() {
  const info = await getSessionInfo();

  // If authenticated but token is near expiry, attempt refresh
  if (info.authenticated) {
    const payload = await getSessionPayload();
    if (payload) {
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutes = 300;

      // If token expires within 5 minutes, try to refresh
      if (payload.expiresAt - now < fiveMinutes && payload.refreshToken) {
        try {
          await refreshAccessToken(payload);
          // Re-fetch session info after refresh
          const refreshed = await getSessionInfo();
          return NextResponse.json(refreshed);
        } catch {
          // Refresh failed — session is still valid until actual expiry
          // The proxy layer will handle 401 by redirecting to login
        }
      }
    }
  }

  return NextResponse.json(info);
}

/**
 * Attempt to refresh the access token using the refresh token.
 */
async function refreshAccessToken(payload: {
  refreshToken: string;
}): Promise<void> {
  const cfg = getKeycloakConfig();
  const issuer = `${cfg.url.replace(/\/+$/, "")}/realms/${cfg.realm}`;

  const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: payload.refreshToken,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const tokens = await response.json();
  // Re-encrypt the session with new tokens
  const { setSessionCookie } = await import("@/lib/auth/session");
  await setSessionCookie({
    sub: "",
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || payload.refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
  });
}
