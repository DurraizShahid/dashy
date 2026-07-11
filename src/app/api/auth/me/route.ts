import { NextRequest, NextResponse } from "next/server";
import { getSessionFromNextRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await getSessionFromNextRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    sub: session.sub,
    email: session.email ?? null,
    name: session.name ?? null,
    preferredUsername: session.preferredUsername ?? null,
  });
}
