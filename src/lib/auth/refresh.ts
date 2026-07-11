import { getServerAuthConfig } from "@/lib/auth/config";
import { getSessionCookieOptions } from "@/lib/auth/session";

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
}

export async function refreshToken(
  currentRefreshToken: string
): Promise<RefreshedTokens | null> {
  const cfg = getServerAuthConfig();
  if (!cfg.keycloakUrl || !cfg.realm || !cfg.clientId) return null;

  const params: Record<string, string> = {
    grant_type: "refresh_token",
    refresh_token: currentRefreshToken,
    client_id: cfg.clientId,
  };
  if (cfg.clientSecret) {
    params.client_secret = cfg.clientSecret;
  }

  const res = await fetch(
    `${cfg.keycloakUrl}/realms/${cfg.realm}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params),
    }
  );

  if (!res.ok) return null;

  const tokens = await res.json();
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? currentRefreshToken,
    idToken: tokens.id_token,
  };
}

export function makeDeleteSessionCookie(): string {
  const cookie = getSessionCookieOptions();
  return `${cookie.name}=; Path=${cookie.options.path}; HttpOnly; SameSite=${cookie.options.sameSite}; Max-Age=0${cookie.options.secure ? "; Secure" : ""}`;
}
