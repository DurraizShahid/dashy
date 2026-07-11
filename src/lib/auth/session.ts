import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "hm_session";
const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

let cachedKey: Uint8Array | null = null;

async function getSecret(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey;
  const raw = process.env.SESSION_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("SESSION_ENCRYPTION_KEY is not set");
  }
  // Derive a fixed 32-byte key for HS256 (SHA-256 hash the raw secret)
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  cachedKey = new Uint8Array(hash);
  return cachedKey;
}

export interface SessionPayload {
  sub: string;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(await getSecret());
}

export async function decryptSession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, await getSecret(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(): {
  name: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
  };
} {
  return {
    name: SESSION_COOKIE,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    },
  };
}

export async function getSessionFromRequest(
  request: Request
): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  return await decryptSession(token);
}

/** Version that uses NextRequest's built-in cookies API for more reliable cookie access. */
export async function getSessionFromNextRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await decryptSession(token);
}
