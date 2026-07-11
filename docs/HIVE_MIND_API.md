# Hive Mind API Client (Release Candidate v1)

## Overview

The Hive Mind API client provides type-safe access to the Hive Mind backend through a server-side proxy.
All API calls go through `/api/hive-mind/*` — the browser never has direct access to the backend.

## Client Architecture

```
src/lib/hive-mind/
├── client.ts         # API client — all calls via `/api/hive-mind/*` proxy
├── types.ts          # Shared TypeScript types (Me, Tenant, Project, Document, Job, ApiKey, AuditLog)
├── errors.ts         # Custom error classes (HiveMindApiError, HiveMindNetworkError)
├── hive-mind-context.tsx  # React context (client, tenant/project state, loading)
└── provider.tsx       # Provider wrapper
```

## Proxy Design

All requests go through a server-side route handler at `src/app/api/hive-mind/[...path]/route.ts`:

```
Browser fetch(/api/hive-mind/me)
  → Next.js Route Handler
    → Reads `hm_session` HTTP-only cookie
    → Decrypts JWT to get accessToken
    → Fetches NEXT_PUBLIC_HIVE_MIND_API_URL/api/v1/me with Authorization: Bearer <token>
    → Returns response to browser
```

## Auth Flow

- Client never has access to access tokens
- Session is encrypted in an HTTP-only cookie (`hm_session`)
- Proxy decrypts the session and attaches Bearer token server-side
- No X-API-Key in browser code
- No localStorage token storage
- PKCE uses S256 challenge method (SHA-256 hash)
- Callback fails if PKCE verifier or oauth_state cookie is missing

## Endpoints

All methods are accessed through the client object returned by `createClient()`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/` | No | Service info |
| GET | `/api/v1/health` | No | Full health check |
| GET | `/api/v1/version` | No | Version info |
| GET | `/api/v1/me` | Yes | Current user info |
| GET | `/api/v1/tenants` | Yes | List tenants |
| GET | `/api/v1/projects?tenantId=` | Yes | List projects |
| GET | `/api/v1/service-registry` | Yes | Registered services |
| GET | `/api/v1/knowledge/search?q=` | Yes | Knowledge search |
| POST | `/api/v1/ingest/url` | Yes | Ingest URL content |
| POST | `/api/v1/ingest/file` | Yes | Ingest file upload |
| GET | `/api/v1/jobs/:id` | Yes | Job status |
| GET | `/api/v1/documents` | Yes | List documents (cursor pagination) |
| GET | `/api/v1/documents/:id` | Yes | Document detail with chunks |
| GET | `/api/v1/jobs` | Yes | List jobs (cursor pagination) |
| POST | `/api/v1/agent/context` | Yes | Agent context query |
| GET | `/api/v1/api-keys` | Yes | List API keys |
| POST | `/api/v1/api-keys` | Yes | Create API key |
| POST | `/api/v1/api-keys/:id/revoke` | Yes | Revoke API key |
| GET | `/api/v1/audit-logs` | Yes | List audit logs |

## Error Handling

- `HiveMindApiError(status, statusText, body)` — backend returned error status
- `HiveMindNetworkError(message)` — network failure or timeout
- All pages handle 401 (session expired), 403 (permission denied), 404 (not found)
- No stack traces shown to users

## Security Properties

| Property | Status |
|----------|--------|
| Browser has access to bearer token | ❌ No (server-side only) |
| Browser has access to refresh token | ❌ No (server-side only) |
| localStorage contains auth tokens | ❌ No (only tenant/project preferences) |
| X-API-Key used in browser code | ❌ No |
| Plaintext API key persisted in browser | ❌ No (shown once, cleared on close) |
| PKCE uses S256 challenge | ✅ Yes |
| Callback fails without verifier | ✅ Yes |
| State verified strictly | ✅ Yes |
