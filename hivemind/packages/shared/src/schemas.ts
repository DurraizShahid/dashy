import { z } from 'zod';
import { SOURCE_TYPES, VISIBILITY_SCOPES, CRM_PRODUCTS, CRM_MARKETS, CRM_SOURCES, CRM_INTENT_LEVELS, CRM_LEAD_STATUSES, INVOICE_TYPES, INVOICE_STATUSES, PAYMENT_TYPES } from './constants';

export const agentContextRequestSchema = z.object({
  query: z.string().min(1).max(10_000),
  projectSlug: z.string().optional(),
  tenantSlug: z.string().optional(),
  maxTokens: z.coerce.number().int().min(1).max(100_000).optional(),
  options: z.record(z.unknown()).optional(),
});

export const ingestUrlRequestSchema = z.object({
  url: z.string().url().max(4096),
  projectSlug: z.string().optional(),
  tenantSlug: z.string().optional(),
  sourceType: z.enum(SOURCE_TYPES).default('web'),
  visibilityScope: z.enum(VISIBILITY_SCOPES).default('private'),
});

export const ingestFileRequestSchema = z.object({
  filename: z.string().min(1).max(512),
  contentType: z.string().optional(),
  projectSlug: z.string().optional(),
  tenantSlug: z.string().optional(),
  visibilityScope: z.enum(VISIBILITY_SCOPES).default('private'),
});

export const serviceRegistryEntrySchema = z.object({
  key: z.string(),
  displayName: z.string(),
  category: z.string(),
  purpose: z.string(),
  requiredForPhase2: z.boolean(),
  publicExposureRecommended: z.boolean(),
});

export const healthReportSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  checks: z.record(z.object({
    status: z.enum(['ok', 'error', 'skipped']),
    latencyMs: z.number(),
    error: z.string().optional(),
  })),
});

// ── CRM Schemas ──

export const createLeadSchema = z.object({
  companyName: z.string().min(1).max(500),
  contactName: z.string().max(200).optional(),
  product: z.enum(CRM_PRODUCTS).or(z.string().min(1)),
  industry: z.string().max(200).optional(),
  market: z.enum(CRM_MARKETS).or(z.string().min(1)),
  country: z.string().min(1).max(200),
  city: z.string().max(200).optional(),
  source: z.enum(CRM_SOURCES).or(z.string().min(1)),
  sourceUrl: z.string().max(2048).optional(),
  leadScore: z.coerce.number().int().min(0).max(100).optional(),
  intentLevel: z.enum(CRM_INTENT_LEVELS).optional(),
  status: z.enum(CRM_LEAD_STATUSES).optional(),
  painPoints: z.array(z.string()).optional(),
  suggestedAngle: z.string().max(500).optional(),
  aiSummary: z.string().max(2000).optional(),
  assignedUser: z.string().max(200).optional(),
  rawData: z.record(z.unknown()).optional(),
  duplicateKey: z.string().max(500).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadIngestSchema = z.object({
  companyName: z.string().min(1).max(500).optional(),
  product: z.string().min(1),
  source: z.string().min(1),
  market: z.string().optional(),
  country: z.string().optional(),
  contactName: z.string().max(200).optional(),
  industry: z.string().max(200).optional(),
  city: z.string().max(200).optional(),
  sourceUrl: z.string().max(2048).optional(),
  leadScore: z.coerce.number().int().min(0).max(100).optional(),
  intentLevel: z.string().optional(),
  status: z.string().optional(),
  painPoints: z.array(z.string()).optional(),
  suggestedAngle: z.string().max(500).optional(),
  aiSummary: z.string().max(2000).optional(),
  rawData: z.record(z.unknown()).optional(),
  duplicateKey: z.string().max(500).optional(),
  title: z.string().optional(),
  selftext: z.string().optional(),
  author: z.string().optional(),
  score: z.coerce.number().optional(),
  url: z.string().optional(),
  sourceId: z.string().optional(),
  subreddit: z.string().optional(),
  upvotes: z.number().optional(),
  comments: z.number().optional(),
  productMatches: z.array(z.string()).optional(),
  painMatches: z.array(z.string()).optional(),
  company: z.string().optional(),
}).passthrough();

export const createCompanySchema = z.object({
  name: z.string().min(1).max(500),
  website: z.string().max(2048).optional(),
  industry: z.string().max(200).optional(),
  productFit: z.enum(CRM_PRODUCTS).optional(),
  country: z.string().max(200).optional(),
  city: z.string().max(200).optional(),
  phone: z.string().max(100).optional(),
  email: z.string().email().max(500).optional().or(z.literal('')),
  linkedInUrl: z.string().max(2048).optional(),
  employeeCount: z.coerce.number().int().min(0).optional(),
  leadCount: z.coerce.number().int().min(0).optional(),
  description: z.string().max(2000).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createContactSchema = z.object({
  companyId: z.string().uuid().optional(),
  companyName: z.string().max(500).optional(),
  fullName: z.string().min(1).max(300),
  jobTitle: z.string().max(300).optional(),
  email: z.string().email().max(500).optional().or(z.literal('')),
  phone: z.string().max(100).optional(),
  linkedInUrl: z.string().max(2048).optional(),
  country: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  status: z.string().max(100).optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const invoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
});

export const createInvoiceSchema = z.object({
  type: z.enum(INVOICE_TYPES),
  number: z.string().min(1).max(100),
  status: z.enum(INVOICE_STATUSES).optional(),
  date: z.string().min(1),
  dueDate: z.string().min(1),
  clientName: z.string().min(1).max(500),
  clientEmail: z.string().email().max(500).optional().or(z.literal('')),
  clientAddress: z.string().max(1000).optional(),
  companyName: z.string().max(500).optional(),
  items: z.array(invoiceItemSchema).min(1),
  subtotal: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  total: z.coerce.number().min(0),
  notes: z.string().max(2000).optional(),
  paymentType: z.enum(PAYMENT_TYPES).optional(),
  amountPaid: z.coerce.number().min(0).optional(),
  relatedInvoiceId: z.string().uuid().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const createScraperSourceSchema = z.object({
  name: z.string().min(1).max(200),
  status: z.string().optional(),
});

export const createScraperRunSchema = z.object({
  source: z.string().min(1).max(200),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  duration: z.string().max(100).optional(),
  leadsFound: z.coerce.number().int().min(0).optional(),
  leadsAdded: z.coerce.number().int().min(0).optional(),
  duplicatesSkipped: z.coerce.number().int().min(0).optional(),
  errors: z.coerce.number().int().min(0).optional(),
  status: z.string().optional(),
  errorMessage: z.string().max(1000).optional(),
});

export const createNotificationSchema = z.object({
  channel: z.string().min(1).max(500),
  type: z.string().min(1).max(200),
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
});

export const updateNotificationSchema = createNotificationSchema.partial();

export const createCrmSettingsSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.record(z.unknown()),
});
