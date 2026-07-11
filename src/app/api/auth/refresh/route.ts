import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromNextRequest,
  encryptSession,
  getSessionCookieOptions,
} from "@/lib/auth/session";
import { getServerAuthConfig, getBaseUrl } from "@/lib/auth/config";

export async function POST(request: NextRequest) {
  const cfg = getServerAuthConfig();
  if (!cfg.keycloakUrl || !cfg.realm || !cfg.clientId) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const session = await getSessionFromNextRequest(request);
  if (!session?.refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const tokenParams: Record<string, string> = {
    grant_type: "refresh_token",
    refresh_token: session.refreshToken,
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

  if (!tokenResponse.ok) {
    const cookie = getSessionCookieOptions();
    const deleteCookie = `${cookie.name}=; Path=${cookie.options.path}; HttpOnly; SameSite=${cookie.options.sameSite}; Max-Age=0${cookie.options.secure ? "; Secure" : ""}`;
    const headers = new Headers();
    headers.set("Location", `${getBaseUrl()}/api/auth/login`);
    headers.append("Set-Cookie", deleteCookie);
    return new Response(null, { status: 302, headers });
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
