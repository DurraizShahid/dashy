import { NextRequest, NextResponse } from "next/server";
import { getSessionFromNextRequest, encryptSession, getSessionCookieOptions } from "@/lib/auth/session";
import { getServerAuthConfig } from "@/lib/auth/config";

// Module-level lock to prevent concurrent token refreshes
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

function makeDeleteCookie(): string {
  const cookie = getSessionCookieOptions();
  return `${cookie.name}=; Path=${cookie.options.path}; HttpOnly; SameSite=${cookie.options.sameSite}; Max-Age=0${cookie.options.secure ? "; Secure" : ""}`;
}

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const BACKEND_BASE = (
    process.env.HIVE_MIND_API_URL ||
    process.env.NEXT_PUBLIC_HIVE_MIND_API_URL ||
    ""
  ).replace(/\/+$/, "");
  const { path } = await params;
  const backendPath = path.join("/");
  const search = new URL(request.url).search;
  const targetUrl = `${BACKEND_BASE}/api/v1/${backendPath}${search}`;

  const session = await getSessionFromNextRequest(request);
  const method = request.method;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const body =
    method !== "GET" && method !== "HEAD"
      ? await request.text().catch(() => undefined)
      : undefined;

  try {
    let backendResponse = await fetch(targetUrl, { method, headers, body });

    // Auto-refresh on 401 if we have a refresh token
    let refreshedSession: { accessToken: string; refreshToken: string } | null = null;
    if (backendResponse.status === 401 && session?.refreshToken) {
      // Use the shared refresh lock — if a refresh is already in flight, wait for it
      if (!refreshPromise) {
        refreshPromise = tryRefreshToken(session.refreshToken).finally(() => {
          refreshPromise = null;
        });
      }
      refreshedSession = await refreshPromise;

      if (refreshedSession) {
        headers["Authorization"] = `Bearer ${refreshedSession.accessToken}`;
        backendResponse = await fetch(targetUrl, { method, headers, body });
      } else {
        // Refresh failed — clear session and signal expiry to client
        const deleteCookie = makeDeleteCookie();
        const respHeaders = new Headers();
        respHeaders.append("Set-Cookie", deleteCookie);
        return NextResponse.json(
          { code: "SESSION_EXPIRED", message: "Session expired, please log in again" },
          { status: 401, headers: respHeaders }
        );
      }
    }

    const responseBody = await backendResponse.text();
    const responseHeaders: Record<string, string> = {
      "Content-Type":
        backendResponse.headers.get("content-type") ?? "application/json",
    };

    const nextResponse = new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });

    // Update session cookie if we refreshed
    if (refreshedSession && session) {
      const newSession = { ...session, accessToken: refreshedSession.accessToken, refreshToken: refreshedSession.refreshToken };
      const jwt = await encryptSession(newSession);
      const cookie = getSessionCookieOptions();
      nextResponse.cookies.set(cookie.name, jwt, cookie.options);
    }

    return nextResponse;
  } catch (err) {
    return NextResponse.json(
      {
        error: "Backend unavailable",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}

async function tryRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  const cfg = getServerAuthConfig();
  if (!cfg.keycloakUrl || !cfg.realm || !cfg.clientId) return null;

  const tokenParams: Record<string, string> = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: cfg.clientId,
  };
  if (cfg.clientSecret) {
    tokenParams.client_secret = cfg.clientSecret;
  }

  const tokenResponse = await fetch(
    `${cfg.keycloakUrl}/realms/${cfg.realm}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams),
    }
  );

  if (!tokenResponse.ok) return null;

  const tokens = await tokenResponse.json();
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? refreshToken,
  };
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
