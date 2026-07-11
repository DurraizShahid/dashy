# Dashy — Product Architecture

## Overview

Dashy is a Next.js 16 (App Router) dashboard application acting as the frontend for the **Hive Mind** backend platform.
It currently hosts the **HelpTribe CRM** module (lead scraping/tracking) and will grow to include the full Hive Mind
administration surface.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (App Router) |
| UI Components | shadcn/ui (base-nova style) |
| Base Library | @base-ui/react |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Charts | recharts |
| Theme | next-themes |
| Formatting | date-fns, class-variance-authority, tailwind-merge |

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (fonts, providers)
│   ├── page.tsx            # Redirects to /dashboard
│   ├── globals.css         # Global styles, CSS variables, theme
│   ├── (pages)/            # Placeholder for route-group layouts
│   ├── api/                # API routes (Next.js Route Handlers)
│   ├── auth/               # Auth endpoints (login, callback, logout, refresh, me)
│   └── hive-mind/[...path] # Proxy to Hive Mind backend API
├── hive-mind/          # Hive Mind module
│   ├── layout.tsx         # Auth-aware shell with sidebar + tenant/project selectors
│   ├── page.tsx           # Redirects to /hive-mind/overview
│   ├── overview/          # Dashboard overview with health, recent docs/jobs
│   ├── health/            # Service health status
│   ├── services/          # Service registry
│   ├── knowledge/         # Knowledge base search
│   ├── ingest/            # URL/file ingestion
│   ├── documents/         # Document list + detail
│   ├── jobs/              # Job list + detail
│   ├── agents/            # Agent context queries
│   ├── settings/          # Module configuration & status
│   └── admin/             # Admin section
│       ├── api-keys/      # API key management (create, list, revoke)
│       └── audit-logs/    # Audit trail viewer
├── dashboard/          # HelpTribe dashboard
│   ├── leads/              # Lead management
│   ├── contacts/           # Contact management
│   ├── companies/          # Company management
│   ├── products/           # Product configuration
│   ├── sources/            # Lead source management
│   ├── scraper-runs/       # Scraper run logs
│   ├── notifications/      # Notification settings
│   ├── invoices/           # Invoice management
│   ├── reports/            # Reporting & analytics
│   └── settings/           # CRM configuration
├── components/
│   ├── crm/                # CRM-specific components
│   ├── hive-mind/          # Hive Mind-specific components (NEW)
│   └── ui/                 # shadcn UI primitives (60 components)
├── data/                   # Mock data & type definitions
├── hooks/                  # Custom React hooks
└── lib/
    ├── utils.ts            # cn() utility
    ├── env.ts              # Environment validation (NEW)
    └── hive-mind/          # Hive Mind API client (NEW)
```

## Module Boundaries

All Hive Mind pages use `"use client"` and follow the CRMSidebar + CRMTopbar shell pattern.
New Hive Mind pages follow the same shell pattern for visual consistency.

1. A shared API client (`@/lib/hive-mind/client`) — all calls go through `/api/hive-mind/*` server proxy
2. `HiveMindProvider` + `useHiveMind()` context for tenant/project state (`@/lib/hive-mind/hive-mind-context`)
3. Environment-based configuration (`NEXT_PUBLIC_HIVE_MIND_API_URL`)
4. Server-side auth via Keycloak OIDC with encrypted HTTP-only session cookies (`src/lib/auth/session.ts`)

### Auth Architecture

```
Browser ──► Next.js Route Handler (/api/auth/*) ──► Keycloak
    │                          │
    │                    /api/hive-mind/* proxy
    │                          │
    └── HTTP-only cookie ──────┘── Bearer token ──► Hive Mind API
```

- No API keys or tokens in browser code
- No localStorage token storage
- All Hive Mind API calls go through `/api/hive-mind/[...path]` server-side proxy
- Proxy reads session cookie and attaches `Authorization: Bearer` header

## Integration Points

- **Hive Mind API**: REST API at `NEXT_PUBLIC_HIVE_MIND_API_URL` (private Railway network), proxied through `/api/hive-mind/*`
- **Keycloak**: OIDC auth provider (configured via env vars), handles login/callback/logout/refresh
- **Railway**: Deployment platform; service-to-service private networking
