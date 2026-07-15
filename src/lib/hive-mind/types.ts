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

export interface KnowledgeSearchCitation {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  sourceUrl?: string;
}

export interface KnowledgeSearchResult {
  id: string;
  chunkId: string;
  documentId: string;
  title: string;
  documentTitle: string;
  snippet: string;
  content: string;
  source: string;
  relevance: number;
  score: number;
  url?: string;
  sourceUrl?: string;
  citation: KnowledgeSearchCitation;
  metadata: Record<string, unknown>;
}

export interface KnowledgeSearchResponse {
  results: KnowledgeSearchResult[];
  total: number;
  query: string;
  citations: KnowledgeSearchCitation[];
  qdrantCollection: string;
  totalLatencyMs: number;
  embeddingLatencyMs: number;
  searchLatencyMs: number;
  minScore: number;
  warnings: string[];
}

export interface JobStatus {
  id: string;
  jobType: string;
  status: string;
  stage?: string | null;
  documentId?: string | null;
  sourceId?: string | null;
  rawObjectId?: string | null;
  queueJobId?: string | null;
  input?: unknown;
  output?: unknown;
  error?: string | null;
  attempts?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface AgentContextRequest {
  query: string;
  tenantId?: string;
  projectId?: string;
  scope?: string;
  maxResults?: number;
  includeGraph?: boolean;
  graphDepth?: number;
  maxGraphEntities?: number;
  maxGraphRelationships?: number;
}

export interface AgentContextRelevantDocument {
  documentId: string;
  title: string;
  sourceUrl: string | null;
  topScore: number;
}

export interface AgentContextRelevantChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  snippet: string;
  score: number;
  citation: KnowledgeSearchCitation;
}

export interface AgentContextGraphEntity {
  id: string;
  name: string;
  entityType: string;
  mentionCount: number;
}

export interface AgentContextGraphRelationship {
  sourceEntityId: string;
  sourceEntityName: string;
  targetEntityId: string;
  targetEntityName: string;
  relationshipType: string;
  confidence?: number;
  evidenceChunkIds?: string[];
}

export interface AgentContextRelatedDocument {
  documentId: string;
  title: string;
  relevance: string;
}

export interface AgentContextResponse {
  mission: string;
  relevantDocuments: AgentContextRelevantDocument[];
  relevantChunks: AgentContextRelevantChunk[];
  citations: KnowledgeSearchCitation[];
  graphEntities?: AgentContextGraphEntity[];
  graphRelationships?: AgentContextGraphRelationship[];
  relatedDocuments?: AgentContextRelatedDocument[];
  retrievalSummary: string;
  warnings: string[];
  qdrantCollection: string;
  totalLatencyMs: number;
  embeddingLatencyMs: number;
  searchLatencyMs: number;
  graphLatencyMs?: number;
  minScore: number;
}

// ─── Auth / /me Types ──────────────────────────────────────────

export interface MeUserInfo {
  id: string;
  email?: string | null;
  name?: string | null;
  keycloakSubject?: string;
  clerkSubject?: string | null;
  status: "active" | "inactive" | "suspended";
}

export interface MeServiceAccountInfo {
  id: string;
  name: string;
  tenantId?: string | null;
  scopes: string[];
}

export interface MeTenantMembership {
  id: string;
  slug: string;
  name: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  status: "active" | "suspended" | "archived";
}

export interface MeProjectMembership {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  status: "active" | "archived" | "deleted";
}

export interface MeResponse {
  actorType: "user" | "agent" | "system" | "api";
  user?: MeUserInfo;
  serviceAccount?: MeServiceAccountInfo;
  systemRoles: string[];
  tenants: MeTenantMembership[];
  projects: MeProjectMembership[];
}

// ─── Tenant & Project (list endpoints) ─────────────────────────

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: "active" | "suspended" | "archived";
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  projectCount: number;
  documentCount: number;
}

export interface Project {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  status: "active" | "archived" | "deleted";
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  documentCount: number;
  jobCount: number;
}

export interface HiveMindDocument {
  id: string;
  tenantId: string;
  projectId?: string | null;
  sourceId?: string | null;
  title: string;
  status: string;
  documentType: string;
  visibilityScope?: string | null;
  sensitivityLevel?: string | null;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  documents: HiveMindDocument[];
  nextCursor?: string | null;
}

export interface HiveMindJob {
  id: string;
  tenantId: string;
  projectId?: string | null;
  documentId?: string | null;
  sourceId?: string | null;
  jobType: string;
  status: string;
  stage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  error?: string | null;
}

export interface JobListResponse {
  jobs: HiveMindJob[];
  nextCursor?: string | null;
}

// ─── API Key Management ─────────────────────────────────────────

export interface ApiKey {
  id: string;
  tenantId?: string | null;
  name: string;
  scopes: string[];
  status: string;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  plaintextKey: string;
}

export interface ApiKeyListResponse {
  apiKeys: ApiKey[];
  nextCursor?: string | null;
}

// ─── Audit Log ──────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  tenantId?: string | null;
  actorType: string;
  actorId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  createdAt: string;
}

export interface AuditLogListResponse {
  auditLogs: AuditLogEntry[];
  nextCursor?: string | null;
}

export interface DocumentDetailResponse {
  id: string;
  title: string;
  documentType: string;
  status: string;
  summary?: string | null;
  source: {
    id: string;
    name: string;
    sourceType: string;
    uri: string;
  } | null;
  sourceId?: string | null;
  rawObjectId?: string | null;
  sourceUrl?: string | null;
  visibilityScope?: string | null;
  sensitivityLevel?: string | null;
  chunkCount: number;
  indexedChunkCount: number;
  indexed: boolean;
  qdrantCollection?: string | null;
  vectorCount?: number | null;
  parseError?: string | null;
  metadata?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
  processedAt?: string | null;
}

// ─── Graph Memory ─────────────────────────────────────────────────

export interface ExtractionMethodStat {
  method: string;
  count: number;
}

export interface EntityTypeCount {
  type: string;
  count: number;
}

export interface RelationshipTypeCount {
  type: string;
  count: number;
}

export interface GraphOverviewResponse {
  entityCount: number;
  relationshipCount: number;
  documentNodeCount: number;
  topEntities: Array<{ id: string; name: string; entityType: string; mentionCount: number }>;
  recentDocuments: Array<{ id: string; title: string }>;
  extractionMethodStats?: ExtractionMethodStat[];
  entityTypeCounts?: EntityTypeCount[];
  relationshipTypeCounts?: RelationshipTypeCount[];
  recentGraphIndexedDocuments?: Array<{ id: string; title: string }>;
  graphHealth: 'healthy' | 'unhealthy';
  warnings?: string[];
}

export interface GraphEntitySummary {
  id: string;
  name: string;
  entityType: string;
  mentionCount: number;
  documentCount: number;
  confidence?: number;
  aliases?: string[];
}

export interface GraphEntitiesResponse {
  entities: GraphEntitySummary[];
  nextCursor: string | null;
}

export interface GraphEntityEvidenceChunk {
  id: string;
  chunkIndex: number;
  documentId: string;
  snippet?: string;
}

export interface GraphEntityDetailResponse {
  entity: {
    id: string;
    name: string;
    entityType: string;
    metadata: Record<string, unknown>;
    confidence?: number;
    aliases?: string[];
    extractionMethod?: string;
  } | null;
  relatedEntities: Array<{
    id: string;
    name: string;
    entityType: string;
    relationship: string;
    confidence?: number;
    evidenceChunkIds?: string[];
  }>;
  mentionedInDocuments: Array<{ id: string; title: string }>;
  mentionedInChunks: Array<{ id: string; chunkIndex: number; documentId: string; snippet?: string }>;
}

export interface GraphDocumentEntity {
  id: string;
  name: string;
  entityType: string;
  confidence?: number;
  aliases?: string[];
  mentionCount?: number;
  extractionMethod?: string;
}

export interface GraphDocumentRelationship {
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  relationship: string;
  confidence?: number;
  evidenceChunkIds?: string[];
}

export interface GraphDocumentChunk {
  id: string;
  chunkIndex: number;
  snippet?: string;
}

export interface GraphDocumentDetailResponse {
  document: {
    id: string;
    title: string;
    tenantId: string;
    projectId?: string;
  } | null;
  entities: GraphDocumentEntity[];
  chunks: GraphDocumentChunk[];
  relationships: GraphDocumentRelationship[];
}

export interface GraphSearchResponse {
  matchingEntities: Array<{ id: string; name: string; entityType: string; mentionCount: number }>;
  matchingDocuments: Array<{ id: string; title: string }>;
  relatedEntities: Array<{ id: string; name: string; entityType: string }>;
  warnings: string[];
}

// ─── API Client Configuration ────────────────────────────────────

export interface HiveMindClientConfig {
  baseUrl: string;
  timeout?: number;
}
