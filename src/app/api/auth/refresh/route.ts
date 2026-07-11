import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromRequest,
  encryptSession,
  getSessionCookieOptions,
} from "@/lib/auth/session";
import { getAuthConfig, getBaseUrl } from "@/lib/auth/config";

export async function POST(request: NextRequest) {
  const cfg = getAuthConfig();
  if (!cfg.keycloakUrl || !cfg.realm || !cfg.clientId) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const session = await getSessionFromRequest(request);
  if (!session?.refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const tokenResponse = await fetch(
    `${cfg.keycloakUrl}/realms/${cfg.realm}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: session.refreshToken,
        client_id: cfg.clientId,
      }),
    }
  );

  if (!tokenResponse.ok) {
    const response = NextResponse.redirect(`${getBaseUrl()}/api/auth/login`);
    const cookie = getSessionCookieOptions();
    response.cookies.set(cookie.name, "", { ...cookie.options, maxAge: 0 });
    return response;
  }

  const tokens = await tokenResponse.json();

  const newSession = {
    ...session,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? session.refreshToken,
  };

  const jwt = await encryptSession(newSession);
  const cookie = getSessionCookieOptions();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, jwt, cookie.options);

  return response;
}
