import type { Lead, Company, Contact, ScraperRun, SourceHealth } from "@/data/types";

const BASE = "/api";

async function getJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}

export async function fetchLeads(): Promise<Lead[]> {
  const data = await getJson(`${BASE}/leads`);
  if (data.success && Array.isArray(data.leads)) {
    return data.leads.map(mapApiLead);
  }
  return [];
}

export async function fetchCompanies(): Promise<Company[]> {
  const data = await getJson(`${BASE}/crm/companies`);
  return data.success ? (data.data ?? []) : [];
}

export async function fetchContacts(): Promise<Contact[]> {
  const data = await getJson(`${BASE}/crm/contacts`);
  return data.success ? (data.data ?? []) : [];
}

export async function fetchSources(): Promise<SourceHealth[]> {
  const data = await getJson(`${BASE}/crm/sources`);
  return data.success ? (data.data ?? []) : [];
}

export async function fetchScraperRuns(): Promise<ScraperRun[]> {
  const data = await getJson(`${BASE}/crm/sources/other/runs`);
  return data.success ? (data.data ?? []) : [];
}

function mapApiLead(apiLead: Record<string, unknown>): Lead {
  return {
    id: (apiLead.leadId as string) || (apiLead.id as string),
    companyName: apiLead.companyName as string,
    contactName: (apiLead.contactName as string) || "Unknown",
    product: (apiLead.product as Lead["product"]) || "Review",
    industry: (apiLead.industry as string) || "",
    market: (apiLead.market as Lead["market"]) || "Other",
    country: (apiLead.country as string) || "",
    city: (apiLead.city as string) || "",
    source: (apiLead.source as Lead["source"]) || "Other",
    sourceUrl: (apiLead.sourceUrl as string) || "",
    leadScore: (apiLead.leadScore as number) || 0,
    intentLevel: (apiLead.intentLevel as Lead["intentLevel"]) || "Unclear",
    status: (apiLead.status as Lead["status"]) || "New",
    painPoints: (apiLead.painPoints as string[]) || [],
    suggestedAngle: (apiLead.suggestedAngle as string) || "",
    aiSummary: (apiLead.aiSummary as string) || "",
    assignedUser: "Unassigned",
    createdAt: (apiLead.createdAt as string)?.slice(0, 10) || "",
    updatedAt: "",
    lastSeenAt: "",
    duplicateKey: (apiLead.duplicateKey as string) || "",
  };
}
