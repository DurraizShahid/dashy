import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieOptions, getSessionFromRequest } from "@/lib/auth/session";
import { getAuthConfig } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const cfg = getAuthConfig();
  const cookie = getSessionCookieOptions();

  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}`
  );
  response.cookies.set(cookie.name, "", { ...cookie.options, maxAge: 0 });

  if (session && cfg.keycloakUrl && cfg.realm) {
    const logoutUrl = `${cfg.keycloakUrl}/realms/${cfg.realm}/protocol/openid-connect/logout`;
    const idTokenHint = session.accessToken;
    return NextResponse.redirect(
      `${logoutUrl}?id_token_hint=${idTokenHint}&post_logout_redirect_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
      )}`
    );
  }

  return response;
}
