import {
  type HiveMindClientConfig,
  type HiveMindServiceInfo,
  type HealthCheckResponse,
  type VersionInfo,
  type ServiceRegistryEntry,
  type KnowledgeSearchResponse,
  type KnowledgeSearchCitation,
  type JobStatus,
  type AgentContextRequest,
  type AgentContextResponse,
  type MeResponse,
  type Tenant,
  type Project,
  type DocumentListResponse,
  type DocumentDetailResponse,
  type JobListResponse,
  type AuditLogListResponse,
  type ApiKeyListResponse,
  type CreateApiKeyResponse,
  type ApiKey,
  type GraphOverviewResponse,
  type GraphEntitiesResponse,
  type GraphEntityDetailResponse,
  type GraphDocumentDetailResponse,
  type GraphSearchResponse,
  type MergeSuggestionsResponse,
  type MergeEntitiesResponse,
  type MergeEntitiesPreviewResponse,
  type IgnoreMergeSuggestionResponse,
  type RevertMergeResponse,
  type MergeHistoryResponse,
  type ReindexResponse,
  type BackfillGraphResponse,
  type ResearchRunListResponse,
  type CreateResearchRunRequest,
  type CreateResearchRunResponse,
  type RetryResearchRunResponse,
  type ResearchRun,
  type ResearchSourceListResponse,
  type ResearchFindingListResponse,
  type ResearchScheduleListResponse,
  type CreateResearchScheduleRequest,
  type CreateResearchScheduleResponse,
  type ResearchSchedule,
  type ResearchAlertListResponse,
  type ResearchAlert,
} from "./types";
import {
  HiveMindApiError,
  HiveMindNetworkError,
} from "./errors";

const DEFAULT_TIMEOUT = 15_000;

function proxyPath(endpoint: string): string {
  const clean = endpoint.replace(/^\//, "");
  return `/api/hive-mind/${clean}`;
}

interface KnowledgeSearchOptions {
  tenantId?: string;
  projectId?: string;
  maxResults?: number;
  minScore?: number;
}

interface BackendKnowledgeSearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  snippet: string;
  score: number;
  sourceUrl?: string;
  citation: KnowledgeSearchCitation;
  metadata: Record<string, unknown>;
}

interface BackendKnowledgeSearchResponse {
  query: string;
  results: BackendKnowledgeSearchResult[];
  citations: KnowledgeSearchCitation[];
  qdrantCollection: string;
  totalLatencyMs: number;
  embeddingLatencyMs: number;
  searchLatencyMs: number;
  minScore: number;
  warnings: string[];
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

export function createClient(config?: Partial<HiveMindClientConfig>) {
  const timeout = config?.timeout ?? DEFAULT_TIMEOUT;

  async function request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = proxyPath(path);
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new HiveMindApiError(
          response.status,
          response.statusText,
          body
        );
      }

      const json = (await response.json()) as Record<string, unknown>;

      // Backend wraps responses in { success, data, meta } — unwrap the data field
      if (json && typeof json === "object" && "data" in json) {
        return json.data as T;
      }

      return json as T;
    } catch (error) {
      if (error instanceof HiveMindApiError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new HiveMindNetworkError(`Request timed out after ${timeout}ms`);
      }
      throw new HiveMindNetworkError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── Auth ────────────────────────────────────────────────────

  async function getMe() {
    return request<MeResponse>("me");
  }

  // ─── Tenants & Projects ──────────────────────────────────────

  async function listTenants() {
    const result = await request<Record<string, unknown>>("tenants");
    if (Array.isArray(result)) return result as Tenant[];
    if (result && typeof result === "object" && Array.isArray(result.tenants)) return result.tenants as Tenant[];
    return [];
  }

  async function createTenant(input: { name: string }) {
    return request<Tenant>("tenants", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async function listProjects(params?: { tenantId?: string }) {
    const qs = params?.tenantId
      ? `?tenantId=${encodeURIComponent(params.tenantId)}`
      : "";
    const result = await request<Record<string, unknown>>(`projects${qs}`);
    if (Array.isArray(result)) return result as Project[];
    if (result && typeof result === "object" && Array.isArray(result.projects)) return result.projects as Project[];
    return [];
  }

  // ─── Public Endpoints ────────────────────────────────────────

  function getServiceInfo() {
    return request<HiveMindServiceInfo>("");
  }

  function getHealth() {
    return request<HealthCheckResponse>("health");
  }

  function getVersion() {
    return request<VersionInfo>("version");
  }

  // ─── Protected Endpoints ─────────────────────────────────────

  function getServiceRegistry() {
    return request<ServiceRegistryEntry[]>("service-registry");
  }

  async function searchKnowledge(
    query: string,
    options?: KnowledgeSearchOptions
  ): Promise<KnowledgeSearchResponse> {
    const response = await request<BackendKnowledgeSearchResponse>(
      "knowledge/search",
      {
        method: "POST",
        body: JSON.stringify({ query, ...options }),
      }
    );

  return {
      query: response.query,
      total: response.results.length,
      results: response.results.map((result) => ({
        id: result.chunkId,
        chunkId: result.chunkId,
        documentId: result.documentId,
        title: result.documentTitle,
        documentTitle: result.documentTitle,
        snippet: result.snippet,
        content: result.content,
        source: result.documentId,
        relevance: result.score,
        score: result.score,
        url: result.sourceUrl,
        sourceUrl: result.sourceUrl,
        citation: result.citation,
        metadata: result.metadata,
      })),
      citations: response.citations,
      qdrantCollection: response.qdrantCollection,
      totalLatencyMs: response.totalLatencyMs,
      embeddingLatencyMs: response.embeddingLatencyMs,
      searchLatencyMs: response.searchLatencyMs,
      minScore: response.minScore,
      warnings: response.warnings,
    };
  }

  function ingestUrl(
    url: string,
    options?: { source?: string; tenantId?: string; projectId?: string }
  ) {
    return request<{ jobId: string; documentId?: string }>("ingest/url", {
      method: "POST",
      body: JSON.stringify({
        url,
        sourceName: options?.source,
        tenantId: options?.tenantId,
        projectId: options?.projectId,
      }),
    });
  }

  async function ingestFile(
    file: File,
    options?: { source?: string; tenantId?: string; projectId?: string }
  ) {
    const contentBase64 = await fileToBase64(file);
    return request<{ jobId: string; documentId?: string }>("ingest/file", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || undefined,
        contentBase64,
        sourceName: options?.source,
        tenantId: options?.tenantId,
        projectId: options?.projectId,
      }),
    });
  }

  function getJobStatus(jobId: string) {
    return request<JobStatus>(`jobs/${encodeURIComponent(jobId)}`);
  }

  function getDocument(documentId: string) {
    return request<DocumentDetailResponse>(
      `documents/${encodeURIComponent(documentId)}`
    );
  }

  function queryAgentContext(req: AgentContextRequest) {
    const body: Record<string, unknown> = { query: req.query };
    if (req.tenantId) body.tenantId = req.tenantId;
    if (req.projectId) body.projectId = req.projectId;
    if (req.scope) body.scope = req.scope;
    if (req.maxResults) body.maxResults = req.maxResults;
    if (req.includeGraph) body.includeGraph = req.includeGraph;
    return request<AgentContextResponse>("agent/context", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // ─── List Endpoints ──────────────────────────────────────────

  function listDocuments(params: {
    tenantId: string;
    projectId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    const qs = new URLSearchParams();
    qs.set("tenantId", params.tenantId);
    if (params.projectId) qs.set("projectId", params.projectId);
    if (params.status) qs.set("status", params.status);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return request<DocumentListResponse>(`documents?${qs}`);
  }

  function listJobs(params: {
    tenantId: string;
    projectId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    const qs = new URLSearchParams();
    qs.set("tenantId", params.tenantId);
    if (params.projectId) qs.set("projectId", params.projectId);
    if (params.status) qs.set("status", params.status);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return request<JobListResponse>(`jobs?${qs}`);
  }

  // ─── API Key Management ────────────────────────────────────

  function listApiKeys(params?: {
    tenantId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.tenantId) qs.set("tenantId", params.tenantId);
    if (params?.status) qs.set("status", params.status);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.cursor) qs.set("cursor", params.cursor);
    return request<ApiKeyListResponse>(`api-keys?${qs}`);
  }

  function createApiKey(input: {
    name: string;
    tenantId?: string;
    scopes: string[];
    expiresAt?: string;
  }) {
    return request<CreateApiKeyResponse>("api-keys", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  function revokeApiKey(id: string, input?: { reason?: string }) {
    return request<{ apiKey: ApiKey }>(`api-keys/${encodeURIComponent(id)}/revoke`, {
      method: "POST",
      body: input ? JSON.stringify(input) : undefined,
    });
  }

  function listAuditLogs(params?: {
    tenantId?: string;
    limit?: number;
    cursor?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.tenantId) qs.set("tenantId", params.tenantId);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.cursor) qs.set("cursor", params.cursor);
    return request<AuditLogListResponse>(`audit-logs?${qs}`);
  }

  // ─── Graph Memory ─────────────────────────────────────────────

  function getGraphOverview(params: { tenantId: string; projectId?: string }) {
    const qs = new URLSearchParams({ tenantId: params.tenantId });
    if (params.projectId) qs.set("projectId", params.projectId);
    return request<GraphOverviewResponse>(`graph/overview?${qs}`);
  }

  function listGraphEntities(params: {
    tenantId: string;
    projectId?: string;
    search?: string;
    type?: string;
    limit?: number;
    cursor?: string;
  }) {
    const qs = new URLSearchParams({ tenantId: params.tenantId });
    if (params.projectId) qs.set("projectId", params.projectId);
    if (params.search) qs.set("search", params.search);
    if (params.type) qs.set("type", params.type);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return request<GraphEntitiesResponse>(`graph/entities?${qs}`);
  }

  function getGraphEntity(entityId: string, params: { tenantId: string; projectId?: string }) {
    const qs = new URLSearchParams({ tenantId: params.tenantId });
    if (params.projectId) qs.set("projectId", params.projectId);
    return request<GraphEntityDetailResponse>(`graph/entities/${encodeURIComponent(entityId)}?${qs}`);
  }

  function getDocumentGraph(documentId: string, params: { tenantId: string }) {
    const qs = new URLSearchParams({ tenantId: params.tenantId });
    return request<GraphDocumentDetailResponse>(`graph/documents/${encodeURIComponent(documentId)}?${qs}`);
  }

  function searchGraph(params: {
    tenantId: string;
    projectId?: string;
    query: string;
    limit?: number;
  }) {
    return request<GraphSearchResponse>("graph/search", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // ── Graph Quality: Merge Suggestions ──

  function getMergeSuggestions(params: {
    tenantId: string;
    projectId?: string;
    limit?: number;
    cursor?: string;
  }) {
    const query = new URLSearchParams({ tenantId: params.tenantId });
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.cursor) query.set("cursor", params.cursor);
    return request<MergeSuggestionsResponse>(`graph/entities/merge-suggestions?${query}`);
  }

  function mergeEntities(params: {
    tenantId: string;
    keepId: string;
    mergeId: string;
  }) {
    return request<MergeEntitiesResponse>(`graph/entities/${params.keepId}/merge`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  function ignoreMergeSuggestion(params: {
    tenantId: string;
    entityId: string;
    duplicateId: string;
  }) {
    return request<IgnoreMergeSuggestionResponse>(`graph/entities/${params.entityId}/ignore-merge-suggestion`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  function getMergePreview(params: {
    tenantId: string;
    keepId: string;
    mergeId: string;
  }) {
    return request<MergeEntitiesPreviewResponse>("graph/entities/merge-preview", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  function revertMerge(params: {
    tenantId: string;
    entityId: string;
  }) {
    return request<RevertMergeResponse>("graph/entities/revert-merge", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  function getMergeHistory(params: {
    tenantId: string;
    projectId?: string;
    limit?: number;
    cursor?: string;
  }) {
    const query = new URLSearchParams({ tenantId: params.tenantId });
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.cursor) query.set("cursor", params.cursor);
    return request<MergeHistoryResponse>(`graph/entities/merge-history?${query}`);
  }

  function backfillGraph(params: {
    tenantId: string;
    projectId?: string;
    documentId?: string;
    scope: "document" | "project" | "tenant" | "failed";
    dryRun?: boolean;
  }) {
    return request<BackfillGraphResponse>("graph/admin/backfill", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // ── Graph Rebuild Controls ──

  function reindexDocument(params: {
    tenantId: string;
    documentId: string;
    projectId?: string;
    dryRun?: boolean;
    clearFirst?: boolean;
  }) {
    return request<ReindexResponse>("graph/admin/reindex-document", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  function reindexTenant(params: {
    tenantId: string;
    projectId?: string;
    dryRun?: boolean;
    clearFirst?: boolean;
  }) {
    return request<ReindexResponse>("graph/admin/reindex-tenant", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // ─── Research Memory ─────────────────────────────────────────

  function listResearchRuns(params?: {
    tenantId?: string;
    projectId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.tenantId) qs.set("tenantId", params.tenantId);
    if (params?.projectId) qs.set("projectId", params.projectId);
    if (params?.status) qs.set("status", params.status);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.cursor) qs.set("cursor", params.cursor);
    const query = qs.toString();
    return request<ResearchRunListResponse>(`research/runs${query ? `?${query}` : ""}`);
  }

  function createResearchRun(input: CreateResearchRunRequest) {
    const sourceModeMap: Record<string, string> = {
      auto: "mixed",
      manual: "manual",
      hybrid: "mixed",
    };
    const body = {
      query: input.query,
      sourceMode: sourceModeMap[input.sourceMode ?? "auto"] ?? "mixed",
      tenantId: input.tenantId,
      projectId: input.projectId,
      maxSources: input.maxSources,
      urls: input.urls,
    };
    return request<ResearchRun>("research/runs", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  function getResearchRun(runId: string) {
    return request<ResearchRun>(`research/runs/${encodeURIComponent(runId)}`);
  }

  function cancelResearchRun(runId: string) {
    return request<{ success: boolean }>(`research/runs/${encodeURIComponent(runId)}/cancel`, {
      method: "POST",
    });
  }

  function retryResearchRun(runId: string) {
    return request<RetryResearchRunResponse>(`research/runs/${encodeURIComponent(runId)}/retry`, {
      method: "POST",
    });
  }

  function getResearchRunSources(runId: string) {
    return request<ResearchSourceListResponse>(`research/runs/${encodeURIComponent(runId)}/sources`);
  }

  function getResearchRunFindings(runId: string) {
    return request<ResearchFindingListResponse>(`research/runs/${encodeURIComponent(runId)}/findings`);
  }

  // ─── Research Schedules ─────────────────────────────────────────

  function listResearchSchedules(params?: {
    tenantId?: string;
    projectId?: string;
    enabled?: boolean;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.tenantId) qs.set("tenantId", params.tenantId);
    if (params?.projectId) qs.set("projectId", params.projectId);
    if (params?.enabled !== undefined) qs.set("enabled", String(params.enabled));
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return request<ResearchScheduleListResponse>(`research/schedules${query ? `?${query}` : ""}`);
  }

  function createResearchSchedule(input: CreateResearchScheduleRequest) {
    const sourceModeMap: Record<string, string> = {
      auto: "mixed",
      manual: "manual",
      hybrid: "mixed",
    };
    const body = {
      query: input.query,
      sourceMode: sourceModeMap[input.sourceMode ?? "auto"] ?? "mixed",
      maxSources: input.maxSources,
      recurrence: input.recurrence,
      timezone: input.timezone,
      tenantId: input.tenantId,
      projectId: input.projectId,
    };
    return request<CreateResearchScheduleResponse>("research/schedules", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  function getResearchSchedule(scheduleId: string) {
    return request<ResearchSchedule>(`research/schedules/${encodeURIComponent(scheduleId)}`);
  }

  function updateResearchSchedule(scheduleId: string, input: Partial<CreateResearchScheduleRequest>) {
    return request<ResearchSchedule>(`research/schedules/${encodeURIComponent(scheduleId)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  function deleteResearchSchedule(scheduleId: string) {
    return request<void>(`research/schedules/${encodeURIComponent(scheduleId)}`, { method: "DELETE" });
  }

  function runResearchScheduleNow(scheduleId: string) {
    return request<{ runId: string }>(`research/schedules/${encodeURIComponent(scheduleId)}/run-now`, { method: "POST" });
  }

  function listResearchScheduleRuns(scheduleId: string, params?: { limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return request<ResearchRunListResponse>(`research/schedules/${encodeURIComponent(scheduleId)}/runs${query ? `?${query}` : ""}`);
  }

  // ─── Research Alerts ────────────────────────────────────────────

  function listResearchAlerts(params?: {
    tenantId?: string;
    projectId?: string;
    scheduleId?: string;
    acknowledged?: boolean;
    severity?: string;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.tenantId) qs.set("tenantId", params.tenantId);
    if (params?.projectId) qs.set("projectId", params.projectId);
    if (params?.scheduleId) qs.set("scheduleId", params.scheduleId);
    if (params?.acknowledged !== undefined) qs.set("acknowledged", String(params.acknowledged));
    if (params?.severity) qs.set("severity", params.severity);
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return request<ResearchAlertListResponse>(`research/alerts${query ? `?${query}` : ""}`);
  }

  function acknowledgeResearchAlert(alertId: string) {
    return request<ResearchAlert>(`research/alerts/${encodeURIComponent(alertId)}/acknowledge`, { method: "POST" });
  }

  return {
    // Auth
    getMe,

    // Tenants & Projects
    listTenants,
    createTenant,
    listProjects,

    // Public
    getServiceInfo,
    getHealth,
    getVersion,

    // Protected
    getServiceRegistry,
    searchKnowledge,
    ingestUrl,
    ingestFile,
    getJobStatus,
    getDocument,
    queryAgentContext,

    // Lists
    listDocuments,
    listJobs,
    listAuditLogs,

    // API Keys
    listApiKeys,
    createApiKey,
    revokeApiKey,

    // Graph Memory
    getGraphOverview,
    listGraphEntities,
    getGraphEntity,
    getDocumentGraph,
    searchGraph,

    // Graph Quality
    getMergeSuggestions,
    mergeEntities,
    ignoreMergeSuggestion,
    getMergePreview,
    revertMerge,
    getMergeHistory,
    backfillGraph,
    reindexDocument,
    reindexTenant,

    // Research Memory
    listResearchRuns,
    createResearchRun,
    getResearchRun,
    cancelResearchRun,
    retryResearchRun,
    getResearchRunSources,
    getResearchRunFindings,

    // Research Schedules
    listResearchSchedules,
    createResearchSchedule,
    getResearchSchedule,
    updateResearchSchedule,
    deleteResearchSchedule,
    runResearchScheduleNow,
    listResearchScheduleRuns,

    // Research Alerts
    listResearchAlerts,
    acknowledgeResearchAlert,

    // Raw access for one-off endpoints
    request,
  };
}

export type HiveMindClient = ReturnType<typeof createClient>;
