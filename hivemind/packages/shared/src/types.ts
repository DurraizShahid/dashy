export type DocumentType = 'pdf' | 'docx' | 'html' | 'md' | 'txt' | 'image' | 'audio' | 'video' | 'code' | 'email' | 'other';
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error' | 'archived';
export type SourceType = 'web' | 'file' | 'api' | 'email' | 'rss' | 'manual';
export type VisibilityScope = 'private' | 'team' | 'tenant' | 'public';
export type SensitivityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
export type JobType = 'ingest.url' | 'ingest.file' | 'parse.document' | 'index.vector' | 'index.graph' | 'summarize.document';
export type JobStatus = 'queued' | 'active' | 'completed' | 'failed' | 'retrying';
export type PrincipalType = 'user' | 'group' | 'service';
export type AssetType = 'insight' | 'pattern' | 'decision' | 'summary';
export type TenantStatus = 'active' | 'suspended' | 'archived';
export type ProjectStatus = 'active' | 'archived';

// ── CRM Types ──

export type CrmProduct = 'Dilivygo' | 'Marlin' | 'Terro' | 'Haigo' | 'Review';
export type CrmMarket = 'USA' | 'UK' | 'Australia' | 'GCC' | 'Other';
export type CrmSource =
  | 'Reddit' | 'LinkedIn' | 'Google Maps' | 'YouTube' | 'X / Twitter'
  | 'Facebook' | 'Instagram' | 'Directory' | 'Website' | 'Manual' | 'Referral' | 'Other';
export type CrmIntentLevel = 'Hot Lead' | 'Warm Lead' | 'Pain Signal' | 'Low Intent' | 'Unclear';
export type CrmLeadStatus =
  | 'New' | 'Needs Review' | 'Qualified' | 'Contacted' | 'Follow-up Scheduled'
  | 'Demo Booked' | 'Won' | 'Lost' | 'Rejected' | 'Duplicate';
export type CrmSourceStatus = 'Active' | 'Paused' | 'Error';
export type InvoiceType = 'invoice' | 'receipt' | 'quotation';
export type InvoiceStatus = 'draft' | 'sent' | 'partially_received' | 'balance_received' | 'closed';
export type PaymentType = 'full' | 'partial';

export interface LeadData {
  id: string;
  tenantId: string;
  companyName: string;
  contactName?: string | null;
  product: string;
  industry?: string | null;
  market: string;
  country: string;
  city?: string | null;
  source: string;
  sourceUrl?: string | null;
  leadScore: number;
  intentLevel?: string | null;
  status: string;
  painPoints: string[];
  suggestedAngle?: string | null;
  aiSummary?: string | null;
  assignedUser?: string | null;
  duplicateKey?: string | null;
  isDuplicate: boolean;
  rawData?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  lastSeenAt?: string | null;
}

export interface CompanyData {
  id: string;
  tenantId: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  productFit?: string | null;
  country?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  linkedInUrl?: string | null;
  employeeCount?: number | null;
  leadCount: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactData {
  id: string;
  tenantId: string;
  companyId?: string | null;
  companyName?: string | null;
  fullName: string;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedInUrl?: string | null;
  country?: string | null;
  source?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceData {
  id: string;
  tenantId: string;
  type: string;
  number: string;
  status: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail?: string | null;
  clientAddress?: string | null;
  companyName?: string | null;
  items: InvoiceItemData[];
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  notes?: string | null;
  paymentType?: string | null;
  amountPaid?: string | null;
  relatedInvoiceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItemData {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
}

export interface ScraperSourceData {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  leadsFound: number;
  hotLeads: number;
  lastRun?: string | null;
  lastSuccess?: string | null;
  errorCount: number;
  successRate: number;
  avgScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScraperRunData {
  id: string;
  tenantId: string;
  source: string;
  startedAt: string;
  completedAt?: string | null;
  duration?: string | null;
  leadsFound: number;
  leadsAdded: number;
  duplicatesSkipped: number;
  errors: number;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
}

export interface CrmNotificationData {
  id: string;
  tenantId: string;
  channel: string;
  type: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CrmSettingsData {
  id: string;
  tenantId: string;
  key: string;
  value: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CrmDashboardStats {
  totalLeads: number;
  hotLeads: number;
  newLeads: number;
  convertedLeads: number;
  totalCompanies: number;
  totalContacts: number;
  monthlyLeadData: Array<{ month: string; leads: number; hot: number; converted: number }>;
  leadsByProduct: Array<{ product: string; count: number; hot: number }>;
  leadsBySource: Array<{ source: string; count: number }>;
  leadsByMarket: Array<{ market: string; count: number; hot: number }>;
  painPointData: Array<{ pain: string; count: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
