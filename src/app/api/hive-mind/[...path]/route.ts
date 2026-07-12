import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const BACKEND_BASE = (
    process.env.HIVE_MIND_API_URL ||
    process.env.NEXT_PUBLIC_HIVE_MIND_API_URL ||
    ""
  ).replace(/\/+$/, "");
  const { path } = await params;
  const backendPath = path.join("/");
  const search = new URL(request.url).search;
  const targetUrl = `${BACKEND_BASE}/api/v1/${backendPath}${search}`;

  let userId: string | null = null;
  let token: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (userId) {
      token = await authResult.getToken();
    }
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    const errStack = err instanceof Error ? err.stack : undefined;
    console.error("[hive-mind-proxy] Auth failed:", {
      error: errMessage,
      stack: errStack,
      backendUrl: BACKEND_BASE,
    });
    return NextResponse.json(
      { error: "Auth unavailable", message: "Authentication service is temporarily unavailable" },
      { status: 503 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const method = request.method;
  const body =
    method !== "GET" && method !== "HEAD"
      ? await request.text().catch(() => undefined)
      : undefined;

  try {
    const backendResponse = await fetch(targetUrl, { method, headers, body });
    let responseBody = await backendResponse.text();

    // Sanitize backend error responses — strip stack traces before forwarding
    if (!backendResponse.ok) {
      try {
        const parsed = JSON.parse(responseBody);
        if (parsed && typeof parsed === "object") {
          delete parsed.stack;
          delete parsed.stackTrace;
          if (parsed.error && typeof parsed.error === "object") {
            delete parsed.error.stack;
            delete parsed.error.stackTrace;
          }
          responseBody = JSON.stringify(parsed);
        }
      } catch {
        // Not JSON — forward as-is
      }
    }

    const responseHeaders: Record<string, string> = {
      "Content-Type":
        backendResponse.headers.get("content-type") ?? "application/json",
      "X-Content-Type-Options": "nosniff",
    };

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error(`[hive-mind-proxy] Backend unavailable: ${targetUrl}`, err);
    return NextResponse.json(
      { error: "Backend unavailable", message: "The Hive Mind API is currently unreachable" },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
