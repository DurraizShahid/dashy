/**
 * Hive Mind API Client.
 *
 * Type-safe fetch wrapper around the Hive Mind API, routed through
 * the server-side proxy at /api/hive-mind/*.
 *
 * All auth (Keycloak Bearer token) is handled server-side by the proxy.
 * No tokens or API keys are managed in the browser.
 *
 * Usage:
 *   const client = createClient();
 *   const health = await client.getHealth();
 */

import {
  type HiveMindClientConfig,
  type HiveMindServiceInfo,
  type HealthCheckResponse,
  type VersionInfo,
  type ServiceRegistryEntry,
  type KnowledgeSearchRequest,
  type KnowledgeSearchResponse,
  type AgentContextRequest,
  type AgentContextResponse,
  type IngestUrlRequest,
  type IngestUrlResponse,
  type JobStatus,
  type DocumentInfo,
} from "./types";
import {
  HiveMindApiError,
  HiveMindNetworkError,
} from "./errors";

const DEFAULT_TIMEOUT = 15_000;

/**
 * Creates a Hive Mind API client that routes through the server-side proxy.
 */
export function createClient(config?: Partial<HiveMindClientConfig>) {
  // When baseUrl is provided and is NOT the proxy path, use it directly
  // (e.g., for server-side usage with HIVEMIND_API_URL).
  // Otherwise, default to the Next.js API proxy route.
  const proxyBase = "/api/hive-mind";
  const baseUrl = config?.baseUrl ?? proxyBase;

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const timeout = config?.timeout ?? DEFAULT_TIMEOUT;

  async function request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${normalizedBase}${path}`;
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

      return response.json() as Promise<T>;
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

  // ─── Public Endpoints ────────────────────────────────────────

  function getServiceInfo() {
    return request<HiveMindServiceInfo>("/");
  }

  function getHealth() {
    return request<HealthCheckResponse>("/health");
  }

  function getVersion() {
    return request<VersionInfo>("/api/v1/version");
  }

  // ─── Protected Endpoints ─────────────────────────────────────

  function getServiceRegistry() {
    return request<ServiceRegistryEntry[]>("/api/v1/service-registry");
  }

  function searchKnowledge(req: KnowledgeSearchRequest) {
    return request<KnowledgeSearchResponse>("/api/v1/knowledge/search", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  function ingestUrl(req: IngestUrlRequest) {
    return request<IngestUrlResponse>("/api/v1/ingest/url", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  function getJobStatus(jobId: string) {
    return request<JobStatus>(`/api/v1/jobs/${encodeURIComponent(jobId)}`);
  }

  function getDocument(documentId: string) {
    return request<DocumentInfo>(
      `/api/v1/documents/${encodeURIComponent(documentId)}`
    );
  }

  function queryAgentContext(req: AgentContextRequest) {
    return request<AgentContextResponse>("/api/v1/agent/context", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  return {
    // Public
    getServiceInfo,
    getHealth,
    getVersion,

    // Protected
    getServiceRegistry,
    searchKnowledge,
    ingestUrl,
    getJobStatus,
    getDocument,
    queryAgentContext,

    // Raw access for one-off endpoints
    request,
  };
}

export type HiveMindClient = ReturnType<typeof createClient>;
