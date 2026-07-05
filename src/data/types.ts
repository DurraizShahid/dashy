export type Product = "Dilivygo" | "Marlin" | "Terro" | "Haigo" | "Review";
export type Market = "USA" | "UK" | "Australia" | "GCC" | "Other";
export type Source = "Reddit" | "LinkedIn" | "Google Maps" | "YouTube" | "X / Twitter" | "Facebook" | "Instagram" | "Directory" | "Website" | "Manual" | "Referral" | "Other";
export type IntentLevel = "Hot Lead" | "Warm Lead" | "Pain Signal" | "Low Intent" | "Unclear";
export type LeadStatus = "New" | "Needs Review" | "Qualified" | "Contacted" | "Follow-up Scheduled" | "Demo Booked" | "Won" | "Lost" | "Rejected" | "Duplicate";
export type SourceStatus = "Active" | "Paused" | "Error";

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  product: Product;
  industry: string;
  market: Market;
  country: string;
  city: string;
  source: Source;
  sourceUrl: string;
  leadScore: number;
  intentLevel: IntentLevel;
  status: LeadStatus;
  painPoints: string[];
  suggestedAngle: string;
  aiSummary: string;
  assignedUser: string;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  duplicateKey: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  productFit: Product;
  country: string;
  city: string;
  phone: string;
  email: string;
  linkedInUrl: string;
  employeeCount: number;
  leadCount: number;
  description: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  companyId: string;
  companyName: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedInUrl: string;
  country: string;
  source: Source;
  status: string;
  createdAt: string;
}

export interface ScraperRun {
  id: string;
  source: Source;
  startedAt: string;
  completedAt: string | null;
  duration: string;
  leadsFound: number;
  leadsAdded: number;
  duplicatesSkipped: number;
  errors: number;
  status: "Running" | "Completed" | "Failed";
  errorMessage: string | null;
}

export interface SourceHealth {
  name: Source;
  status: SourceStatus;
  leadsFound: number;
  hotLeads: number;
  lastRun: string;
  lastSuccess: string;
  errorCount: number;
  successRate: number;
  avgScore: number;
}
