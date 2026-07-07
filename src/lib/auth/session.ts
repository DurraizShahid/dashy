/**
 * Server-side JWT session utilities.
 *
 * Uses `jose` to sign/verify a session JWT containing
 * the Keycloak access token, refresh token, and user info.
 *
 * The session cookie is HTTP-only and never exposed to browser JS.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ─── Constants ───────────────────────────────────────────────────

const SESSION_COOKIE = "hm_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ─── Types ────────────────────────────────────────────────────────

export interface SessionPayload {
  /** Keycloak user ID (sub claim). */
  sub: string;
  /** Keycloak access token (Bearer). */
  accessToken: string;
  /** Keycloak refresh token. */
  refreshToken: string;
  /** Access token expiry (epoch seconds). */
  expiresAt: number;
  /** User display name. */
  name?: string;
  /** User email. */
  email?: string;
}

export interface SessionInfo {
  authenticated: boolean;
  configured: boolean;
  user?: {
    name?: string;
    email?: string;
  };
}

// ─── Key Management ───────────────────────────────────────────────

function getSigningKey(): Uint8Array {
  const secret = process.env.SESSION_ENCRYPTION_KEY;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[auth] SESSION_ENCRYPTION_KEY not set. Using derived key — " +
          "sessions will not persist across restarts."
      );
      return new TextEncoder().encode("dashy-dev-session-key-32chars!");
    }
    throw new Error(
      "SESSION_ENCRYPTION_KEY is required in production. " +
        "Generate one with: openssl rand -hex 32"
    );
  }
  const key = Buffer.from(secret, "hex");
  if (key.length !== 32) {
    throw new Error(
      `SESSION_ENCRYPTION_KEY must be 32 bytes (64 hex chars), got ${key.length} bytes`
    );
  }
  return key;
}

// ─── Session Cookie Helpers ───────────────────────────────────────

/**
 * Sign a session payload into a JWT and set it as an HTTP-only cookie.
 */
export async function setSessionCookie(
  payload: SessionPayload
): Promise<void> {
  const key = getSigningKey();
  const cookieStore = await cookies();

  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(key);

  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

/**
 * Read and verify the session cookie.
 * Returns null if the cookie is missing, expired, or invalid.
 */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie?.value) return null;

  try {
    const key = getSigningKey();
    const { payload } = await jwtVerify(cookie.value, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    // Token expired, tampered, or invalid
    return null;
  }
}

/**
 * Remove the session cookie (logout).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

/**
 * Returns client-safe session info (no tokens).
 */
export async function getSessionInfo(): Promise<SessionInfo> {
  const configured = isKeycloakConfigured();
  if (!configured) {
    return { authenticated: false, configured: false };
  }

  const payload = await getSessionPayload();
  if (!payload) {
    return { authenticated: false, configured: true };
  }

  return {
    authenticated: true,
    configured: true,
    user: {
      name: payload.name,
      email: payload.email,
    },
  };
}

// ─── Config helpers ───────────────────────────────────────────────

export function getKeycloakConfig() {
  return {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "",
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "",
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
  };
}

export function isKeycloakConfigured(): boolean {
  const cfg = getKeycloakConfig();
  return !!(cfg.url && cfg.realm && cfg.clientId && cfg.clientSecret);
}

/**
 * Build the Keycloak OIDC issuer URL.
 */
export function getKeycloakIssuer(): string {
  const cfg = getKeycloakConfig();
  return `${cfg.url.replace(/\/+$/, "")}/realms/${cfg.realm}`;
}

/**
 * Build the full callback URL for this Dashy instance.
 */
export function getCallbackUrl(): string {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${origin.replace(/\/+$/, "")}/api/auth/callback`;
}
