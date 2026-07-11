import { NextRequest, NextResponse } from "next/server";
import { getSessionFromNextRequest, encryptSession, getSessionCookieOptions } from "@/lib/auth/session";
import { refreshToken, makeDeleteSessionCookie, type RefreshedTokens } from "@/lib/auth/refresh";

const refreshPromises = new Map<string, Promise<RefreshedTokens | null>>();

async function refreshLockKey(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

    let refreshedSession: RefreshedTokens | null = null;
    if (backendResponse.status === 401 && session?.refreshToken) {
      const lockKey = await refreshLockKey(session.refreshToken);
      let refreshPromise = refreshPromises.get(lockKey);
      if (!refreshPromise) {
        refreshPromise = refreshToken(session.refreshToken).finally(() => {
          refreshPromises.delete(lockKey);
        });
        refreshPromises.set(lockKey, refreshPromise);
      }
      refreshedSession = await refreshPromise;

      if (refreshedSession) {
        headers["Authorization"] = `Bearer ${refreshedSession.accessToken}`;
        backendResponse = await fetch(targetUrl, { method, headers, body });
      } else {
        const deleteCookie = makeDeleteSessionCookie();
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

    if (refreshedSession && session) {
      const newSession = {
        ...session,
        accessToken: refreshedSession.accessToken,
        refreshToken: refreshedSession.refreshToken,
        idToken: refreshedSession.idToken ?? session.idToken,
      };
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

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
