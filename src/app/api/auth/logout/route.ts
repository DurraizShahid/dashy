/**
 * GET /api/auth/logout
 *
 * Clears the session cookie and optionally redirects to Keycloak's
 * logout endpoint to end the SSO session.
 */

import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  getSessionPayload,
  isKeycloakConfigured,
  getKeycloakIssuer,
} from "@/lib/auth/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo") || "/";

  // Get the current session to possibly redirect to Keycloak logout
  const payload = await getSessionPayload();

  await clearSessionCookie();

  if (isKeycloakConfigured() && payload?.accessToken) {
    const issuer = getKeycloakIssuer();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const logoutUrl = new URL(`${issuer}/protocol/openid-connect/logout`);
    logoutUrl.searchParams.set(
      "redirect_uri",
      `${origin.replace(/\/+$/, "")}${redirectTo}`
    );
    logoutUrl.searchParams.set("id_token_hint", payload.accessToken);

    return NextResponse.redirect(logoutUrl);
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
