import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
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

  const expectedNonce = request.cookies.get("oauth_nonce")?.value;
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

  // Verify the ID token signature and validate claims
  let idTokenPayload: Record<string, unknown> = {};
  if (tokens.id_token) {
    try {
      const JWKS = createRemoteJWKSet(
        new URL(`${cfg.keycloakUrl}/realms/${cfg.realm}/protocol/openid-connect/certs`)
      );
      const { payload } = await jwtVerify(tokens.id_token, JWKS, {
        audience: cfg.clientId,
        issuer: `${cfg.keycloakUrl}/realms/${cfg.realm}`,
      });
      idTokenPayload = payload as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "ID token verification failed" }, { status: 502 });
    }
  } else {
    return NextResponse.json({ error: "Missing ID token" }, { status: 502 });
  }

  // Validate nonce if it was provided in the original auth request
  if (expectedNonce && idTokenPayload.nonce && idTokenPayload.nonce !== expectedNonce) {
    return NextResponse.json({ error: "Nonce mismatch" }, { status: 400 });
  }

  const sessionPayload = {
    sub: String(idTokenPayload.sub ?? tokens.access_token),
    accessToken: tokens.access_token as string,
    refreshToken: tokens.refresh_token as string | undefined,
    idToken: tokens.id_token as string | undefined,
    email: typeof idTokenPayload.email === "string" ? idTokenPayload.email : undefined,
    name: typeof idTokenPayload.name === "string" ? idTokenPayload.name : undefined,
    preferredUsername: typeof idTokenPayload.preferred_username === "string" ? idTokenPayload.preferred_username : undefined,
  } satisfies import("@/lib/auth/session").SessionPayload;

  const jwt = await encryptSession(sessionPayload);
  const cookie = getSessionCookieOptions();

  const cookieOpts = cookie.options;
  const cookieStr = `${cookie.name}=${jwt}; Path=${cookieOpts.path}; HttpOnly; SameSite=${cookieOpts.sameSite}; Max-Age=${cookieOpts.maxAge}${cookieOpts.secure ? "; Secure" : ""}`;
  const headers = new Headers();
  headers.set("Location", `${getBaseUrl()}/hive-mind`);
  headers.append("Set-Cookie", cookieStr);
  headers.append("Set-Cookie", `pkce_verifier=; Path=/; HttpOnly; Max-Age=0`);
  headers.append("Set-Cookie", `oauth_state=; Path=/; HttpOnly; Max-Age=0`);
  headers.append("Set-Cookie", `oauth_nonce=; Path=/; HttpOnly; Max-Age=0`);

  return new Response(null, { status: 302, headers });
}
