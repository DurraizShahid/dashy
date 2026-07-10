import { z } from 'zod';
import { SOURCE_TYPES, VISIBILITY_SCOPES } from './constants';

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
