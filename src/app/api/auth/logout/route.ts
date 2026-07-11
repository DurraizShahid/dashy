import { NextRequest } from "next/server";
import { getSessionCookieOptions, getSessionFromNextRequest } from "@/lib/auth/session";
import { getAuthConfig, getBaseUrl } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  const session = await getSessionFromNextRequest(request);
  const cfg = getAuthConfig();
  const cookie = getSessionCookieOptions();
  const baseUrl = getBaseUrl();

  const deleteCookie = `${cookie.name}=; Path=${cookie.options.path}; HttpOnly; SameSite=${cookie.options.sameSite}; Max-Age=0${cookie.options.secure ? "; Secure" : ""}`;

  const headers = new Headers();
  headers.append("Set-Cookie", deleteCookie);

  if (session && cfg.keycloakUrl && cfg.realm) {
    const logoutUrl = `${cfg.keycloakUrl}/realms/${cfg.realm}/protocol/openid-connect/logout`;
    const params = new URLSearchParams({
      post_logout_redirect_uri: baseUrl,
    });
    if (session.idToken) {
      params.set("id_token_hint", session.idToken);
    }
    headers.set("Location", `${logoutUrl}?${params.toString()}`);
  } else {
    headers.set("Location", baseUrl);
  }

  return new Response(null, { status: 302, headers });
}
