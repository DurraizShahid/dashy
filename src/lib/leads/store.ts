export interface StoredLead {
  leadId: string;
  companyName: string;
  product: string;
  source: string;
  market: string;
  country: string;
  contactName?: string;
  industry?: string;
  city?: string;
  sourceUrl?: string;
  leadScore: number;
  intentLevel?: string;
  status: string;
  painPoints?: string[];
  suggestedAngle?: string;
  aiSummary?: string;
  rawData?: Record<string, unknown>;
  duplicateKey: string;
  isDuplicate: boolean;
  createdAt: string;
}

const leads = new Map<string, StoredLead>();

export function addLead(lead: StoredLead): void {
  if (lead.sourceUrl) {
    leads.set(lead.sourceUrl, lead);
  }
  leads.set(lead.duplicateKey, lead);
}

export function getLeads(): StoredLead[] {
  return Array.from(leads.values()).filter(
    (lead, index, self) => self.findIndex((l) => l.leadId === lead.leadId) === index
  );
}

export function getAllLeads(): StoredLead[] {
  return getLeads();
}
