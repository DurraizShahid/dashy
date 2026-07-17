import { NextResponse } from "next/server";

const BACKEND_URL = process.env.HIVE_MIND_API_URL || process.env.NEXT_PUBLIC_HIVE_MIND_API_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/v1/crm/leads/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-tenant-id": "default" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
