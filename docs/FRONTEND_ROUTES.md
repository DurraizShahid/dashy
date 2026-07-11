# Frontend Routes — Hive Mind Module (Release Candidate v1)

## Route Structure

All Hive Mind pages live under `/hive-mind/` to keep a clean module boundary.
All routes are implemented and compile successfully (37 routes total).

```
/hive-mind/
├── overview            → /hive-mind/overview            # Dashboard with health, recent docs/jobs
├── health              → /hive-mind/health              # Detailed health dashboard
├── services            → /hive-mind/services            # Service registry browser
├── knowledge           → /hive-mind/knowledge           # Knowledge base search
├── ingest              → /hive-mind/ingest              # URL/file ingestion
├── documents           → /hive-mind/documents           # Document list with status filters
├── documents/:id       → /hive-mind/documents/[id]      # Single document detail with chunks
├── jobs                → /hive-mind/jobs                # Job list with status filters
├── jobs/:id            → /hive-mind/jobs/[id]           # Single job detail
├── agents              → /hive-mind/agents              # Agent context queries
├── settings            → /hive-mind/settings            # Module configuration & status
├── admin/
│   ├── api-keys        → /hive-mind/admin/api-keys      # API key management (create, list, revoke)
│   └── audit-logs      → /hive-mind/admin/audit-logs    # Audit trail viewer
```

## Route Properties

- **○ (Static)**: `/hive-mind/health`, `/hive-mind/services`, `/hive-mind/knowledge`, `/hive-mind/ingest`, `/hive-mind/settings`, `/hive-mind/admin/api-keys`, `/hive-mind/admin/audit-logs`
- **ƒ (Dynamic)**: `/hive-mind/documents/[id]`, `/hive-mind/jobs/[id]`
- All pages are `"use client"` with data fetching in effects
- API calls go through `/api/hive-mind/*` server-side proxy

## Layout

Hive Mind pages reuse the `CRMSidebar + CRMTopbar` shell. The layout is auth-aware:

1. If Hive Mind not configured → "Not Configured" message
2. If auth configured and loading → "Checking authentication..."
3. If auth configured and not signed in → "Authentication Required" with Sign In button
4. If auth configured, signed in, loading tenants → "Loading organizations..."
5. If signed in and no tenant access → "No Organization Memberships"
6. If tenant error → error message
7. Otherwise → normal shell with sidebar + content

## Sidebar Navigation

The sidebar includes three sections:
- **CRM** (existing): Dashboard, Leads, Products, Sources, etc.
- **Hive Mind**: Overview, Health, Services, Knowledge, Ingest, Documents, Jobs, Agents
- **Admin**: API Keys, Audit Logs
