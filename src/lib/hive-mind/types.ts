// ─── Public Endpoints ────────────────────────────────────────────

export interface HiveMindServiceInfo {
  service: string;
  version: string;
  status: "operational" | "degraded" | "down";
}

export interface HealthCheckService {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  error?: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  timestamp: string;
  services: HealthCheckService[];
}

export interface VersionInfo {
  service: string;
  version: string;
  commit?: string;
  buildTime?: string;
  nodeVersion: string;
}

// ─── Protected Endpoints ─────────────────────────────────────────

export interface ServiceRegistryEntry {
  id: string;
  name: string;
  url: string;
  status: "registered" | "unreachable" | "unknown";
  lastSeen: string;
  metadata?: Record<string, string>;
}

export interface KnowledgeSearchResult {
  id: string;
  title: string;
  snippet: string;
  source: string;
  relevance: number;
  url?: string;
}

export interface KnowledgeSearchResponse {
  results: KnowledgeSearchResult[];
  total: number;
  query: string;
}

export interface JobStatus {
  id: string;
  type: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  createdAt: string;
  updatedAt: string;
  result?: unknown;
  error?: string;
}

export interface AgentContextRequest {
  query: string;
  context?: Record<string, string>;
}

export interface AgentContextResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

// ─── New Backend API Types ──────────────────────────────────────

export interface MeResponse {
  id: string;
  email: string;
  name?: string;
  actorType: "user" | "system" | "agent";
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  projectCount?: number;
  memberCount?: number;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  createdAt: string;
  description?: string;
  documentCount?: number;
}

export interface HiveMindDocument {
  id: string;
  title: string;
  status: "pending" | "processing" | "indexed" | "failed";
  source: string;
  type: string;
  chunksCount: number;
  createdAt: string;
  updatedAt: string;
  visibility: "private" | "tenant" | "public";
  sensitivity: "low" | "medium" | "high" | "critical";
  tenantId: string;
  projectId?: string;
}

export interface DocumentListResponse {
  documents: HiveMindDocument[];
  nextCursor?: string;
  total: number;
}

export interface HiveMindJob {
  id: string;
  jobType: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  stage: string;
  documentId?: string;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  tenantId: string;
  projectId?: string;
}

export interface JobListResponse {
  jobs: HiveMindJob[];
  nextCursor?: string;
  total: number;
}

// ─── API Key Management ─────────────────────────────────────────

export interface ApiKey {
  id: string;
  tenantId?: string;
  name: string;
  scopes: string[];
  status: "active" | "revoked" | "expired";
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  plaintextKey: string;
}

export interface ApiKeyListResponse {
  apiKeys: ApiKey[];
  nextCursor?: string;
  total: number;
}

// ─── Audit Log ──────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string;
  actorType: string;
  targetType: string;
  targetId: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogListResponse {
  logs: AuditLogEntry[];
  nextCursor?: string;
  total: number;
}

export interface DocumentDetailResponse extends HiveMindDocument {
  chunks?: Array<{
    id: string;
    content: string;
    index: number;
    indexed: boolean;
  }>;
}

// ─── API Client Configuration ────────────────────────────────────

export interface HiveMindClientConfig {
  baseUrl: string;
  timeout?: number;
}
