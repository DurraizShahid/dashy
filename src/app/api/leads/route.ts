import { NextResponse } from "next/server";

const BACKEND_URL = process.env.HIVE_MIND_API_URL || process.env.NEXT_PUBLIC_HIVE_MIND_API_URL || "http://localhost:3001";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/crm/leads`, {
      headers: { "x-tenant-id": "default" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json({
      success: true,
      leads: data.data.map((l: any) => ({
        leadId: l.id,
        companyName: l.companyName,
        contactName: l.contactName,
        product: l.product,
        industry: l.industry,
        market: l.market,
        country: l.country,
        city: l.city,
        source: l.source,
        sourceUrl: l.sourceUrl,
        leadScore: l.leadScore,
        intentLevel: l.intentLevel,
        status: l.status,
        painPoints: l.painPoints,
        suggestedAngle: l.suggestedAngle,
        aiSummary: l.aiSummary,
        assignedUser: l.assignedUser,
        duplicateKey: l.duplicateKey,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
      total: data.total,
    });
  } catch {
    return NextResponse.json({ success: true, leads: [], total: 0 });
  }
}
