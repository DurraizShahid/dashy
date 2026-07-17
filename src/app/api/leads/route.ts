import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/leads/store";

export async function GET() {
  const leads = getAllLeads();

  return NextResponse.json({
    success: true,
    leads,
    total: leads.length,
  });
}
