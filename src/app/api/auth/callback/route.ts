/**
 * GET /api/auth/callback
 *
 * Handles the Keycloak OIDC callback.
 * Exchanges the authorization code for tokens, creates a session,
 * and redirects to the originally requested page.
 */

import { NextResponse } from "next/server";
import {
  getKeycloakConfig,
  getKeycloakIssuer,
  getCallbackUrl,
  isKeycloakConfigured,
  setSessionCookie,
  type SessionPayload,
} from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!isKeycloakConfigured()) {
    return NextResponse.json(
      { error: "Keycloak not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Keycloak reported an error
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/login?error=missing_params", request.url)
    );
  }

  // Read the temporary OAuth state cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const tempCookie = extractCookie(cookieHeader, "hm_oauth_state");
  if (!tempCookie) {
    return NextResponse.redirect(
      new URL("/login?error=session_expired", request.url)
    );
  }

  let storedState: string;
  let codeVerifier: string;
  let redirectTo: string;

  try {
    const decoded = JSON.parse(
      Buffer.from(tempCookie, "base64url").toString("utf-8")
    );
    storedState = decoded.state;
    codeVerifier = decoded.codeVerifier;
    redirectTo = decoded.redirectTo || "/hive-mind";
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url)
    );
  }

  // Verify state matches (anti-CSRF)
  if (state !== storedState) {
    return NextResponse.redirect(
      new URL("/login?error=state_mismatch", request.url)
    );
  }

  // Exchange authorization code for tokens
  const cfg = getKeycloakConfig();
  const issuer = getKeycloakIssuer();
  const callbackUrl = getCallbackUrl();

  const tokenResponse = await fetch(
    `${issuer}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        code_verifier: codeVerifier,
      }),
    }
  );

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text().catch(() => "unknown");
    console.error("[auth] Token exchange failed:", tokenResponse.status, errorBody);
    return NextResponse.redirect(
      new URL(`/login?error=token_exchange_failed`, request.url)
    );
  }

  const tokens = await tokenResponse.json();

  // Decode the ID token to get user info
  let userInfo: { name?: string; email?: string; sub: string } = {
    sub: "unknown",
  };
  if (tokens.id_token) {
    try {
      const parts = tokens.id_token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64url").toString("utf-8")
        );
        userInfo = {
          sub: payload.sub || "unknown",
          name: payload.name || payload.preferred_username,
          email: payload.email,
        };
      }
    } catch {
      // Non-fatal: user info won't be available
    }
  }

  // Create session
  const sessionPayload: SessionPayload = {
    sub: userInfo.sub,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || "",
    expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
    name: userInfo.name,
    email: userInfo.email,
  };

  const response = NextResponse.redirect(
    new URL(redirectTo, request.url)
  );

  // Set session cookie
  await setSessionCookie(sessionPayload);

  // Clear the temporary OAuth state cookie
  response.cookies.set("hm_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}

function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${escapeRegex(name)}\\s*=\\s*([^;]+)`)
  );
  return match ? match[1] : null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
