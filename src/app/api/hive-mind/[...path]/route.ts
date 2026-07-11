import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

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

  const session = await getSessionFromRequest(request);
  const method = request.method;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const body =
    method !== "GET" && method !== "HEAD"
      ? await request.text().catch(() => undefined)
      : undefined;

  try {
    const backendResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseBody = await backendResponse.text();
    const responseHeaders: Record<string, string> = {
      "Content-Type":
        backendResponse.headers.get("content-type") ?? "application/json",
    };

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Backend unavailable",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
