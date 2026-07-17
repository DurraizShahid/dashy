import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.HIVE_MIND_API_URL ||
  process.env.NEXT_PUBLIC_HIVE_MIND_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = path.join("/");
  const search = new URL(request.url).search;
  const targetUrl = `${BACKEND_URL}/api/v1/crm/${backendPath}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-tenant-id": "default",
  };

  const method = request.method;
  const body = method !== "GET" && method !== "HEAD"
    ? await request.text().catch(() => undefined)
    : undefined;

  try {
    const backendResponse = await fetch(targetUrl, { method, headers, body });
    const responseBody = await backendResponse.text();

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
