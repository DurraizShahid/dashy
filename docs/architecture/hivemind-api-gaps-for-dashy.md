# Hive Mind API — Frontend Blockers and Required Endpoints

This document lists endpoints that the Hive Mind backend needs to provide
for Dashy to deliver a complete user experience.

## Required Endpoints

### User / Session
| Endpoint | Purpose | Priority |
|---|---|---|
| `GET /api/v1/me` | Current user info, roles, permissions | High |
| `GET /api/v1/tenants` | List accessible tenants (organizations) | High |
| `GET /api/v1/projects` | List accessible projects within a tenant | High |

Without these:
- No tenant/project selector (manual ID entry only)
- Cannot verify user permissions before showing UI
- No multi-tenant context switching

### Documents
| Endpoint | Purpose | Priority |
|---|---|---|
| `GET /api/v1/documents` | List all indexed documents | Medium |
| `GET /api/v1/documents/:id` | Single document detail (exists) | - |

Without `GET /api/v1/documents`:
- No document browser UI possible
- Users cannot see what's been indexed

### Jobs
| Endpoint | Purpose | Priority |
|---|---|---|
| `GET /api/v1/jobs` | List all jobs (ingestion, processing) | Medium |
| `GET /api/v1/jobs/:id` | Single job detail (exists) | - |

Without `GET /api/v1/jobs`:
- Jobs page shows manual ID lookup only
- No "recent jobs" overview

### Audit / Admin
| Endpoint | Purpose | Priority |
|---|---|---|
| `GET /api/v1/audit-logs` | Usage and access audit trail | Low |
| `POST /api/v1/api-keys` | Create API keys for programmatic access | Low |
| `DELETE /api/v1/api-keys/:id` | Revoke API keys | Low |

## Existing Endpoints (Verified or Assumed)

| Endpoint | Method | Status |
|---|---|---|
| `GET /` | Service info | Verified |
| `GET /health` | Health check | Verified |
| `GET /api/v1/version` | Version info | Verified |
| `GET /api/v1/service-registry` | Registered services | Assumed |
| `POST /api/v1/knowledge/search` | Knowledge search | Assumed |
| `POST /api/v1/ingest/url` | URL ingestion | Assumed |
| `POST /api/v1/ingest/file` | File upload ingestion | Assumed |
| `GET /api/v1/jobs/:id` | Job status | Assumed |
| `GET /api/v1/documents/:id` | Document info | Assumed |
| `POST /api/v1/agent/context` | Agent context query | Assumed |

## Request/Response Mismatches Already Fixed in Frontend

| Issue | Frontend Fix |
|---|---|
| `searchKnowledge(q)` was GET with `?q=` | Now sends POST with JSON body `{query, tenantId, projectId, limit}` |
| `queryAgentContext({query, context})` sent wrong field name | Now sends `{task, agentType, tenantId, projectId, limit, context}` |
| `AgentContextResponse` expected `{answer, sources, confidence}` | Now expects `{mission, relevantDocuments, relevantChunks, citations, retrievalSummary, warnings}` |
| `ingestUrl(url, {source})` sent wrong field names | Now sends `{url, sourceName, tenantId, projectId, visibilityScope, sensitivityLevel, tags}` |
| API key in `NEXT_PUBLIC_` env var | Removed. Auth is now Bearer JWT via server-side proxy only |

## Next Actions (Backend Phase)

1. Implement `GET /api/v1/me` — user info with roles
2. Implement `GET /api/v1/tenants` — list accessible tenants
3. Implement `GET /api/v1/projects?tenantId=xxx` — list projects
4. Implement `GET /api/v1/documents` — list indexed documents (with pagination)
5. Implement `GET /api/v1/jobs` — list jobs (with pagination, status filter)
6. Verify all existing endpoints return correct response shapes
7. Add CORS headers for Dashy origin (if direct browser calls are ever needed)
