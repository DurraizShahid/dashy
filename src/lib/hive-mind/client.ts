/**
 * Hive Mind API Client.
 *
 * Type-safe fetch wrapper around the Hive Mind REST API.
 * All endpoints are relative to the configured base URL.
 *
 * Usage:
 *   const client = createClient();
 *   const health = await client.getHealth();
 */

import { getPublicEnv } from "@/lib/env";
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
} from "./types";
import {
  HiveMindApiError,
  HiveMindConfigError,
  HiveMindNetworkError,
} from "./errors";

const DEFAULT_TIMEOUT = 15_000;

/**
 * Creates a Hive Mind API client.
 *
 * When `config` is omitted, reads base URL from
 * `NEXT_PUBLIC_HIVE_MIND_API_URL` env var.
 */
export function createClient(config?: Partial<HiveMindClientConfig>) {
  const baseUrl =
    config?.baseUrl ?? getPublicEnv("NEXT_PUBLIC_HIVE_MIND_API_URL");

  if (!baseUrl) {
    throw new HiveMindConfigError(
      "Hive Mind API URL is not configured. " +
        "Set NEXT_PUBLIC_HIVE_MIND_API_URL in your .env.local file."
    );
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const timeout = config?.timeout ?? DEFAULT_TIMEOUT;
  let token: string | undefined = config?.token;

  async function request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${normalizedBase}${path}`;
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
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

  // ─── Auth ────────────────────────────────────────────────────

  function setAuth(newToken: string) {
    token = newToken;
  }

  function clearAuth() {
    token = undefined;
  }

  function getToken(): string | undefined {
    return token;
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

  function searchKnowledge(query: string) {
    const encoded = encodeURIComponent(query);
    return request<KnowledgeSearchResponse>(
      `/api/v1/knowledge/search?q=${encoded}`
    );
  }

  function ingestUrl(url: string, options?: { source?: string }) {
    return request<{ jobId: string }>("/api/v1/ingest/url", {
      method: "POST",
      body: JSON.stringify({ url, ...options }),
    });
  }

  function getJobStatus(jobId: string) {
    return request<JobStatus>(`/api/v1/jobs/${encodeURIComponent(jobId)}`);
  }

  function queryAgentContext(req: AgentContextRequest) {
    return request<AgentContextResponse>("/api/v1/agent/context", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  return {
    // Auth
    setAuth,
    clearAuth,
    getToken,

    // Public
    getServiceInfo,
    getHealth,
    getVersion,

    // Protected
    getServiceRegistry,
    searchKnowledge,
    ingestUrl,
    getJobStatus,
    queryAgentContext,

    // Raw access for one-off endpoints
    request,
  };
}

export type HiveMindClient = ReturnType<typeof createClient>;
