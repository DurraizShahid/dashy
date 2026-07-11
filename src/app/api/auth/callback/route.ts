import { NextRequest, NextResponse } from "next/server";
import { getServerAuthConfig, getBaseUrl } from "@/lib/auth/config";
import { encryptSession, getSessionCookieOptions } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const cfg = getServerAuthConfig();
  if (!cfg.keycloakUrl || !cfg.realm || !cfg.clientId) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: `Keycloak error: ${error}` }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const savedState = request.cookies.get("oauth_state")?.value;
  if (!savedState || !state || state !== savedState) {
    return NextResponse.json({ error: "State mismatch or missing" }, { status: 400 });
  }

  const verifier = request.cookies.get("pkce_verifier")?.value;
  if (!verifier) {
    return NextResponse.json({ error: "Missing PKCE verifier cookie" }, { status: 400 });
  }

  const redirectUri = `${getBaseUrl()}/api/auth/callback`;

  const tokenParams: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: cfg.clientId,
    code_verifier: verifier,
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
    const body = await tokenResponse.text();
    return NextResponse.json(
      { error: `Token exchange failed: ${body}` },
      { status: 502 }
    );
  }

  const tokens = await tokenResponse.json();
  const idToken = tokens.id_token
    ? JSON.parse(
        Buffer.from(tokens.id_token.split(".")[1], "base64").toString()
      )
    : {};

  const sessionPayload = {
    sub: idToken.sub ?? tokens.access_token,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    email: idToken.email,
    name: idToken.name,
    preferredUsername: idToken.preferred_username,
  };

  const jwt = await encryptSession(sessionPayload);
  const cookie = getSessionCookieOptions();

  const response = NextResponse.redirect(`${getBaseUrl()}/hive-mind`);

  response.cookies.set(cookie.name, jwt, cookie.options);
  response.cookies.delete("pkce_verifier");
  response.cookies.delete("oauth_state");

  return response;
}
