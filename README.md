# Dashy — Frontend Release Candidate v1

Dashy is a Next.js 16 (App Router) dashboard application serving as the frontend for the **Hive Mind** backend platform.

**Status**: Release Candidate v1 (branch: `dashy/release-candidate-v1`)

## Stack

- **Framework**: Next.js 16.2.10 (App Router)
- **UI**: shadcn/ui (base-nova style), Tailwind CSS v4
- **Auth**: Keycloak OIDC Authorization Code + PKCE (S256), server-side encrypted HTTP-only session cookies
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

Visit `/login` to sign in with Keycloak. If you are already authenticated, you will be redirected to `/hive-mind/overview`.

## Modules

### Hive Mind (Release Candidate)

Full live product loop: Login → select tenant/project → ingest content → watch job → document appears → search knowledge → query agent → manage API keys → view audit logs.

**Pages** (38 routes including `/login`):

| Route | Description |
|-------|-------------|
| `/login` | Keycloak sign-in page |
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
Browser ──► Next.js Route Handler (/api/auth/*) ──► Keycloak
    │                          │
    │                    /api/hive-mind/* proxy
    │                          │
    └── HTTP-only cookie ──────┘── Bearer token ──► Hive Mind API
```

- **PKCE S256**: Verifier is a 32-byte random base64url string; challenge is SHA-256 hash
- **No API keys or tokens in browser code**
- **No localStorage token storage**
- **Callback fails** if PKCE verifier cookie or oauth_state cookie is missing/invalid
- **Plaintext API key shown once after creation, then cleared**
- All Hive Mind API calls go through server-side proxy

## Env Vars

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_HIVE_MIND_API_URL` | Yes | Hive Mind backend URL |
| `NEXT_PUBLIC_KEYCLOAK_URL` | Yes | Keycloak server URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Yes | Keycloak realm |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Yes | Keycloak client ID |
| `KEYCLOAK_CLIENT_SECRET` | Yes | (server-only) |
| `SESSION_ENCRYPTION_KEY` | Yes | (server-only) Session cookie signing key |
| `NEXT_PUBLIC_BASE_URL` | No | Public URL for OIDC redirects (default: localhost:3000). Canonical over `NEXT_PUBLIC_APP_URL`. |

## Backend Dependency

This RC depends on **Hive Mind RC PR #8** (`DurraizShahid/ensemble`, branch `hivemind/release-candidate-v1`).

## Build & Lint

```bash
npm run build    # 38 routes, all static or server-rendered
npm run lint     # 0 new errors from auth changes; pre-existing CRM/UI lint issues documented
```

## Docs

- `docs/ARCHITECTURE.md` — Full architecture documentation
- `docs/AUTH_PLAN.md` — Auth implementation details
- `docs/BACKEND_GAPS.md` — Known backend gaps
- `docs/FRONTEND_ROUTES.md` — Route inventory
- `docs/HIVE_MIND_API.md` — API client design
- `docs/RAILWAY_ENV.md` — Railway deployment config
