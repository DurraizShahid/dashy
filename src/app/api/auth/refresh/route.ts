import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromNextRequest,
  encryptSession,
  getSessionCookieOptions,
} from "@/lib/auth/session";
import { getBaseUrl } from "@/lib/auth/config";
import { refreshToken, makeDeleteSessionCookie } from "@/lib/auth/refresh";

export async function POST(request: NextRequest) {
  const session = await getSessionFromNextRequest(request);
  if (!session?.refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const refreshed = await refreshToken(session.refreshToken);

  if (!refreshed) {
    const deleteCookie = makeDeleteSessionCookie();
    const headers = new Headers();
    headers.set("Location", `${getBaseUrl()}/api/auth/login`);
    headers.append("Set-Cookie", deleteCookie);
    return new Response(null, { status: 302, headers });
  }

  const newSession = {
    ...session,
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    idToken: refreshed.idToken ?? session.idToken,
  };

  const jwt = await encryptSession(newSession);
  const cookie = getSessionCookieOptions();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, jwt, cookie.options);

  return response;
}
