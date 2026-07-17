import { NextResponse } from "next/server";
import { addLead } from "@/lib/leads/store";

const VALID_PRODUCTS = ["Dilivygo", "Marlin", "Terro", "Haigo", "Review"];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      product,
      source,
      market,
      country,
      contactName,
      industry,
      city,
      sourceUrl,
      leadScore,
      intentLevel,
      status,
      painPoints,
      suggestedAngle,
      aiSummary,
      rawData,
      duplicateKey: providedDuplicateKey,
    } = body;

    if (!companyName || !product || !source || !market || !country) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: companyName, product, source, market, country" },
        { status: 400 }
      );
    }

    const duplicateKey = providedDuplicateKey || `${companyName}_${country}_${city || ""}`.toLowerCase();

    const normalizedProduct = VALID_PRODUCTS.includes(product) ? product : "Needs Review";

    let leadStatus = status || "new";
    let shouldSendToSlack = false;

    const score = leadScore ?? 0;
    if (score >= 80) {
      leadStatus = "Hot Lead";
      shouldSendToSlack = true;
    }

    if (normalizedProduct === "Needs Review") {
      leadStatus = "Needs Review";
    }

    const lead = {
      leadId: generateId(),
      companyName,
      product: normalizedProduct,
      source,
      market,
      country,
      contactName,
      industry,
      city,
      sourceUrl,
      leadScore: score,
      intentLevel,
      status: leadStatus,
      painPoints,
      suggestedAngle,
      aiSummary,
      rawData,
      duplicateKey,
      isDuplicate: false,
      createdAt: new Date().toISOString(),
    };

    addLead(lead);

    return NextResponse.json({
      success: true,
      status: "created",
      leadId: lead.leadId,
      isDuplicate: false,
      shouldSendToSlack,
      message: "Lead created successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
