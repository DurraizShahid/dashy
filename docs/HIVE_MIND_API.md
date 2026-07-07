# Hive Mind API Client Design

## Overview

The Hive Mind API client provides type-safe access to the Hive Mind backend from Next.js frontend code.
All API calls go through a single client module to centralize configuration, error handling, and auth token management.

## Base Configuration

- **Base URL**: Read from `NEXT_PUBLIC_HIVE_MIND_API_URL` environment variable
- **Default timeout**: 15s (configurable per-request)
- **Auth**: Bearer token in `Authorization` header (via future Keycloak integration)

## Client Architecture

```
src/lib/hive-mind/
├── client.ts       # Main API client with fetch wrapper
├── types.ts        # Shared TypeScript types/enums
└── errors.ts       # Custom error classes
```

### Core Client (`client.ts`)

```typescript
// Design sketch — final implementation in src/lib/hive-mind/client.ts

class HiveMindClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  setToken(token: string) { this.token = token; }
  clearToken() { this.token = undefined; }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options?.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text().catch(() => ""));
    }

    return response.json() as Promise<T>;
  }

  // Convenience methods
  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body?: unknown) { return this.request<T>(path, { method: "POST", body: JSON.stringify(body) }); }
  put<T>(path: string, body?: unknown) { return this.request<T>(path, { method: "PUT", body: JSON.stringify(body) }); }
  delete<T>(path: string) { return this.request<T>(path, { method: "DELETE" }); }
}
```

### Endpoints

All endpoints are relative to `NEXT_PUBLIC_HIVE_MIND_API_URL`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Service info |
| GET | `/health` | No | Full health check |
| GET | `/api/v1/version` | No | Version info |
| GET | `/api/v1/service-registry` | Yes | Registered services |
| GET | `/api/v1/knowledge/search?q=...` | Yes | Knowledge search |
| POST | `/api/v1/ingest/url` | Yes | Ingest URL content |
| GET | `/api/v1/jobs/:id` | Yes | Job status |
| POST | `/api/v1/agent/context` | Yes | Agent context query |

### Error Handling

```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Hive Mind API ${status}: ${body}`);
    this.name = "ApiError";
  }

  get isUnauthenticated() { return this.status === 401; }
  get isNotFound() { return this.status === 404; }
  get isServerError() { return this.status >= 500; }
}
```

## React Integration

- `useHiveMind()` hook (future) — returns typed client instance, auth status, and connection state
- Client instantiated once and cached via module-level singleton or React context
- Auth token set via Keycloak token refresh callback

## Migration Path

1. Phase 1 (current): Basic client + health page (no auth)
2. Phase 2 (with Keycloak): Auth token injection, protected endpoints
3. Phase 3: React hooks, SWR/React Query integration, streaming support
