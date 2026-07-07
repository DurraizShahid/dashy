/**
 * API Proxy for Hive Mind backend.
 *
 * All requests to /api/hive-mind/* are forwarded to the Hive Mind API
 * with the user's Keycloak Bearer token attached server-side.
 *
 * This ensures:
 *  - The access token never reaches the browser
 *  - API keys are never exposed client-side
 *  - CORS is not an issue (same-origin requests)
 *  - 401 responses trigger session invalidation
 *
 * Route pattern:  GET /api/hive-mind/health  →  GET <HIVEMIND>/health
 *                POST /api/hive-mind/api/v1/knowledge/search  →  POST <HIVEMIND>/api/v1/knowledge/search
 */

import { NextResponse } from "next/server";
import {
  getSessionPayload,
  clearSessionCookie,
  isKeycloakConfigured,
} from "@/lib/auth/session";

// ─── Config ──────────────────────────────────────────────────────

function getHiveMindBaseUrl(): string {
  // Use server-side env var first (private network on Railway), fallback to public
  return (
    process.env.HIVEMIND_API_URL ||
    process.env.NEXT_PUBLIC_HIVEMIND_API_URL ||
    ""
  );
}

// ─── Route Handler ───────────────────────────────────────────────

async function handleRequest(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  const baseUrl = getHiveMindBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Hive Mind API URL is not configured" },
      { status: 503 }
    );
  }

  // Construct the target URL
  const targetUrl = `${baseUrl.replace(/\/+$/, "")}/${pathStr}`;

  // Get auth state
  const configured = isKeycloakConfigured();
  const session = await getSessionPayload();
  const accessToken = session?.accessToken;

  // Check if this endpoint requires auth
  const isProtectedEndpoint = !pathStr.startsWith("health") && pathStr !== "";

  if (isProtectedEndpoint && configured && !accessToken) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  // Build headers
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  // Attach Bearer token if available
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Forward method and body
  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward body for POST/PUT/PATCH
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.body
  ) {
    // Read the body as-is and forward it
    const bodyText = await request.text();
    fetchOptions.body = bodyText;
  } else if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    !request.body
  ) {
    // Some POST endpoints need an empty body
    fetchOptions.body = "{}";
  }

  try {
    const proxyResponse = await fetch(targetUrl, fetchOptions);

    // Handle 401 — session token may be expired
    if (proxyResponse.status === 401 && configured) {
      // Clear session cookie so the client re-authenticates
      const errorResponse = NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 }
      );
      await clearSessionCookie();
      return errorResponse;
    }

    // For non-JSON responses, pass through as text
    const contentType = proxyResponse.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await proxyResponse.json();
      return NextResponse.json(data, { status: proxyResponse.status });
    } else {
      const text = await proxyResponse.text();
      return new NextResponse(text, {
        status: proxyResponse.status,
        headers: {
          "content-type": contentType,
        },
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error connecting to Hive Mind API";
    console.error("[hive-mind-proxy] Network error:", message);
    return NextResponse.json(
      { error: `Hive Mind API unreachable: ${message}` },
      { status: 502 }
    );
  }
}

// ─── Export HTTP method handlers ─────────────────────────────────

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
