/**
 * Shared types for Hive Mind API.
 *
 * These represent known request/response shapes from the Hive Mind backend.
 * See docs/architecture/hivemind-api-gaps-for-dashy.md for missing endpoints.
 */

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

// ─── Knowledge Search ────────────────────────────────────────────

export interface KnowledgeSearchRequest {
  query: string;
  tenantId?: string;
  projectId?: string;
  limit?: number;
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

// ─── Agent Context ───────────────────────────────────────────────

export interface AgentContextRequest {
  task: string;
  agentType: string;
  tenantId?: string;
  projectId?: string;
  limit?: number;
  /** Optional extra context key/value pairs. */
  context?: Record<string, string>;
}

/** A relevant document chunk returned by the agent. */
export interface RelevantChunk {
  content: string;
  source: string;
  score?: number;
}

/** A citation linking to an original source. */
export interface Citation {
  title?: string;
  url?: string;
  source?: string;
}

export interface AgentContextResponse {
  mission: string;
  relevantDocuments: string[];
  relevantChunks: RelevantChunk[];
  citations: Citation[];
  retrievalSummary?: string;
  warnings?: string[];
}

// ─── Ingest URL ──────────────────────────────────────────────────

export interface IngestUrlRequest {
  url: string;
  tenantId?: string;
  projectId?: string;
  sourceName?: string;
  visibilityScope?: string;
  sensitivityLevel?: string;
  tags?: string[];
}

export interface IngestUrlResponse {
  jobId: string;
  documentId?: string;
}

// ─── Jobs ────────────────────────────────────────────────────────

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

// ─── Document ────────────────────────────────────────────────────

export interface DocumentInfo {
  id: string;
  title: string;
  url?: string;
  source?: string;
  status: "processing" | "indexed" | "failed";
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ─── Tenant / Project Context ────────────────────────────────────

export interface TenantProjectContext {
  tenantId?: string;
  projectId?: string;
  tenantName?: string;
  projectName?: string;
}

// ─── API Client Configuration ────────────────────────────────────

export interface HiveMindClientConfig {
  baseUrl: string;
  timeout?: number; // ms, default 15000
}
