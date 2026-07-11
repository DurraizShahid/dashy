import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieOptions, getSessionFromRequest } from "@/lib/auth/session";
import { getAuthConfig, getBaseUrl } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const cfg = getAuthConfig();
  const cookie = getSessionCookieOptions();

  const baseUrl = getBaseUrl();
  const response = NextResponse.redirect(baseUrl);
  response.cookies.set(cookie.name, "", { ...cookie.options, maxAge: 0 });

  if (session && cfg.keycloakUrl && cfg.realm) {
    const logoutUrl = `${cfg.keycloakUrl}/realms/${cfg.realm}/protocol/openid-connect/logout`;
    const params = new URLSearchParams({
      post_logout_redirect_uri: baseUrl,
    });
    if (session.idToken) {
      params.set("id_token_hint", session.idToken);
    }
    return NextResponse.redirect(`${logoutUrl}?${params.toString()}`);
  }

  return response;
}
