/**
 * Shared types for Hive Mind API.
 *
 * These represent known response shapes from the Hive Mind backend.
 * Add types as new endpoints are integrated.
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

// ─── API Client Configuration ────────────────────────────────────

export interface HiveMindClientConfig {
  baseUrl: string;
  token?: string;
  timeout?: number; // ms, default 15000
}
