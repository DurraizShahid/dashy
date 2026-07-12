# Dashy — Frontend

Dashy is a Next.js 16 (App Router) dashboard application serving as the frontend for the **Hive Mind** backend platform.

## Stack

- **Framework**: Next.js 16.2.10 (App Router)
- **UI**: shadcn/ui (base-nova style), Tailwind CSS v4
- **Auth**: Clerk (`@clerk/nextjs` v7)
- **API Proxy**: All Hive Mind API calls go through `/api/hive-mind/*` server-side proxy (no browser tokens)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Edit .env.local with your values (see docs/RAILWAY_ENV.md)

# Start dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Login

Visit `/login` to sign in with Clerk. If you are already authenticated, you will be redirected to `/hive-mind/overview`.

## Modules

### Hive Mind

Full live product loop: Login → select tenant/project → ingest content → watch job → document appears → search knowledge → query agent → manage API keys → view audit logs.

**Pages**:

| Route | Description |
|-------|-------------|
| `/login` | Clerk sign-in page |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/hive-mind/overview` | Dashboard with health, recent docs/jobs |
| `/hive-mind/health` | Service health status |
| `/hive-mind/services` | Service registry |
| `/hive-mind/knowledge` | Knowledge base search |
| `/hive-mind/ingest` | URL/file ingestion |
| `/hive-mind/documents` | Document list + detail |
| `/hive-mind/jobs` | Job list + detail |
| `/hive-mind/agents` | Agent context queries |
| `/hive-mind/settings` | Module configuration & status |
| `/hive-mind/admin/api-keys` | API key management (create, list, revoke) |
| `/hive-mind/admin/audit-logs` | Audit trail viewer |

### HelpTribe CRM (Existing)

Lead tracking, contact management, invoicing, scraping, reporting, and notifications.

## Auth Architecture

```
Browser ──► Clerk (sign-in/sign-up) ──► Dashy + Clerk middleware
    │                                        │
    │                                  /api/hive-mind/* proxy
    │                                        │
    └── Clerk session ───────────────────────┘── Bearer token ──► Hive Mind API
```

- **No API keys or tokens in browser code**
- **No localStorage token storage**
- All Hive Mind API calls go through server-side proxy
- Backend receives Clerk Bearer token for user auth

## Env Vars

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | (server-only) Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | `/hive-mind/overview` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | `/hive-mind/overview` |
| `HIVE_MIND_API_URL` | Yes | (server-only) Hive Mind backend URL |
| `NEXT_PUBLIC_BASE_URL` | No | Public URL (default: localhost:3000) |

## Build & Lint

```bash
npm run build
npm run lint
```

## Docs

- `docs/AUTH_PLAN.md` — Auth implementation details
- `docs/RAILWAY_ENV.md` — Railway deployment config
- `docs/architecture/auth-integration-plan.md` — Historical Keycloak auth plan (deprecated)
