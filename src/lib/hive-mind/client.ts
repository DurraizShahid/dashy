import {
  type HiveMindClientConfig,
  type HiveMindServiceInfo,
  type HealthCheckResponse,
  type VersionInfo,
  type ServiceRegistryEntry,
  type KnowledgeSearchResponse,
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
    return request<Tenant[]>("tenants");
  }

  async function listProjects(params?: { tenantId?: string }) {
    const qs = params?.tenantId
      ? `?tenantId=${encodeURIComponent(params.tenantId)}`
      : "";
    return request<Project[]>(`projects${qs}`);
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

  function searchKnowledge(query: string) {
    const encoded = encodeURIComponent(query);
    return request<KnowledgeSearchResponse>(
      `knowledge/search?q=${encoded}`
    );
  }

  function ingestUrl(
    url: string,
    options?: { source?: string; tenantId?: string; projectId?: string }
  ) {
    return request<{ jobId: string; documentId?: string }>("ingest/url", {
      method: "POST",
      body: JSON.stringify({ url, ...options }),
    });
  }

  function ingestFile(
    file: File,
    options?: { source?: string; tenantId?: string; projectId?: string }
  ) {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.source) formData.append("source", options.source);
    if (options?.tenantId) formData.append("tenantId", options.tenantId);
    if (options?.projectId) formData.append("projectId", options.projectId);
    return request<{ jobId: string; documentId?: string }>("ingest/file", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set multipart boundary
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
    return request<AgentContextResponse>("agent/context", {
      method: "POST",
      body: JSON.stringify(req),
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

  return {
    // Auth
    getMe,

    // Tenants & Projects
    listTenants,
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

    // Raw access for one-off endpoints
    request,
  };
}

export type HiveMindClient = ReturnType<typeof createClient>;
