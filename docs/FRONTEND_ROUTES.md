# Frontend Route Plan — Hive Mind Module

## Route Structure

All Hive Mind pages live under `/hive-mind/` to keep a clean module boundary.

```
/hive-mind/
├── (overview)        → /hive-mind                    # Module landing / health status
├── health            → /hive-mind/health             # Detailed health dashboard
├── knowledge         → /hive-mind/knowledge          # Knowledge base search & management
├── ingest            → /hive-mind/ingest              # URL/content ingestion
├── jobs              → /hive-mind/jobs                # Job history & status
├── jobs/:id          → /hive-mind/jobs/[id]           # Single job detail
├── services          → /hive-mind/services            # Service registry browser
├── agents            → /hive-mind/agents              # Agent management
└── settings          → /hive-mind/settings            # Module-level configuration
```

## Page Ownership & Implementation Order

| Priority | Route | Description | Dependencies |
|----------|-------|-------------|-------------|
| P0 | `/hive-mind` | Health/service overview page | Env vars, API client |
| P0 | `/hive-mind/health` | Full health dashboard with service status | API client |
| P1 | `/hive-mind/services` | Service registry browser | Auth (Keycloak) |
| P1 | `/hive-mind/knowledge` | Knowledge search + results | Auth |
| P2 | `/hive-mind/ingest` | URL/content ingestion form | Auth |
| P2 | `/hive-mind/jobs` | Job list + status | Auth |
| P2 | `/hive-mind/jobs/[id]` | Job detail view | Auth |
| P3 | `/hive-mind/agents` | Agent configuration & context | Auth |
| P3 | `/hive-mind/settings` | Hive Mind integration settings | Auth |

## Navigation Integration

Add a "Hive Mind" section to the CRM sidebar (collapsible group) containing:

- **Hive Mind** → `/hive-mind` (overview)
- **Health** → `/hive-mind/health`
- **Services** → `/hive-mind/services`
- **Knowledge** → `/hive-mind/knowledge`

These entries sit below the existing CRM items, separated by a visual divider.
The link entry is gated by a `NEXT_PUBLIC_HIVE_MIND_API_URL` being set.

## Layout

Hive Mind pages reuse the same `CRMSidebar + CRMTopbar` shell as CRM pages for visual consistency.
The sidebar `activeItem` prop maps to the Hive Mind section when on `/hive-mind/*` routes.

## Phase 1: Current Scope

- `/hive-mind` — basic health status page (no auth needed)
- Sidebar entry added (conditional on env var)
