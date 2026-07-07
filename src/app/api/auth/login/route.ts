/**
 * GET /api/auth/login
 *
 * Initiates the Keycloak OIDC Authorization Code + PKCE flow.
 * Generates a state and code_verifier, stores them in a temporary cookie,
 * then redirects to Keycloak for authentication.
 */

import { NextResponse } from "next/server";
import {
  getKeycloakConfig,
  getKeycloakIssuer,
  getCallbackUrl,
  isKeycloakConfigured,
} from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!isKeycloakConfigured()) {
    return NextResponse.json(
      { error: "Keycloak is not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo") || "/hive-mind";

  const cfg = getKeycloakConfig();
  const issuer = getKeycloakIssuer();
  const callbackUrl = getCallbackUrl();

  // Generate PKCE challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Generate anti-forgery state token
  const state = generateState();

  // Store state + verifier + redirect in a temporary cookie (5 min TTL)
  const tempPayload = JSON.stringify({ state, codeVerifier, redirectTo });
  const tempCookie = Buffer.from(tempPayload).toString("base64url");

  const response = NextResponse.redirect(
    `${issuer}/protocol/openid-connect/auth` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(cfg.clientId)}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&state=${encodeURIComponent(state)}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&code_challenge_method=S256` +
      `&scope=${encodeURIComponent("openid profile email")}`
  );

  response.cookies.set("hm_oauth_state", tempCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 minutes
    path: "/",
  });

  return response;
}

// ─── PKCE Helpers ─────────────────────────────────────────────────

function generateCodeVerifier(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => chars[byte % chars.length])
    .join("");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest)
    .toString("base64url");
}

function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64url");
}
