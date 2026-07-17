export const HIVEMIND_VERSION = '0.1.0';
export const API_PREFIX = '/api/v1';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const QUEUE_NAMES = {
  INGEST_URL: 'ingest.url',
  INGEST_FILE: 'ingest.file',
  PARSE_DOCUMENT: 'parse.document',
  INDEX_VECTOR: 'index.vector',
  INDEX_GRAPH: 'index.graph',
  SUMMARIZE_DOCUMENT: 'summarize.document',
} as const;

export const HEALTH_TIMEOUT_MS = 5_000;

export const SOURCE_TYPES = ['web', 'file', 'api', 'email', 'rss', 'manual'] as const;
export const VISIBILITY_SCOPES = ['private', 'team', 'tenant', 'public'] as const;

export const CRM_PRODUCTS = ['Dilivygo', 'Marlin', 'Terro', 'Haigo', 'Review'] as const;
export const CRM_MARKETS = ['USA', 'UK', 'Australia', 'GCC', 'Other'] as const;
export const CRM_SOURCES = [
  'Reddit', 'LinkedIn', 'Google Maps', 'YouTube', 'X / Twitter',
  'Facebook', 'Instagram', 'Directory', 'Website', 'Manual', 'Referral', 'Other',
] as const;
export const CRM_INTENT_LEVELS = ['Hot Lead', 'Warm Lead', 'Pain Signal', 'Low Intent', 'Unclear'] as const;
export const CRM_LEAD_STATUSES = [
  'New', 'Needs Review', 'Qualified', 'Contacted', 'Follow-up Scheduled',
  'Demo Booked', 'Won', 'Lost', 'Rejected', 'Duplicate',
] as const;
export const CRM_SOURCE_STATUSES = ['Active', 'Paused', 'Error'] as const;
export const INVOICE_TYPES = ['invoice', 'receipt', 'quotation'] as const;
export const INVOICE_STATUSES = ['draft', 'sent', 'partially_received', 'balance_received', 'closed'] as const;
export const PAYMENT_TYPES = ['full', 'partial'] as const;
