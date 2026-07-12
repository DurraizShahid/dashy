# Dashy — Frontend

Dashy is a **Next.js 16 (App Router)** dashboard application serving as the primary frontend for the **Hive Mind** AI Knowledge OS backend. It also hosts the **HelpTribe CRM** module.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (App Router) |
| UI Components | shadcn/ui (base-nova style), @base-ui/react |
| Styling | Tailwind CSS v4 |
| Auth | Clerk (`@clerk/nextjs` v7) |
| Charts | Recharts v3 |
| Icons | Lucide React |
| Theme | next-themes (class-based dark mode) |
| Linting | ESLint 9 + eslint-config-next |

## Modules

### Hive Mind

Full live product loop: Login → select tenant/project → ingest content → watch job → document appears → search knowledge → query agent → manage API keys → view audit logs.

**Routes:** `/hive-mind/overview`, `/health`, `/services`, `/knowledge`, `/ingest`, `/documents`, `/jobs`, `/agents`, `/settings`, `/admin/api-keys`, `/admin/audit-logs`

See [docs/FRONTEND_ROUTES.md](docs/FRONTEND_ROUTES.md) for the complete route list.

### HelpTribe CRM

Lead tracking, contact management, invoicing, scraping, reporting, and notifications. Dashboard at `/dashboard` with leads, contacts, companies, products, sources, scraper runs, invoices, reports, and settings.

## Project Structure

```
src/
├── app/                   # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── hive-mind/         # Hive Mind module pages
│   └── dashboard/         # HelpTribe CRM pages
├── components/
│   ├── crm/               # CRM-specific components (sidebar, topbar, badges)
│   ├── hive-mind/         # Hive Mind-specific components
│   └── ui/                # shadcn UI primitives (60 components)
├── data/                  # Types, mock data
├── hooks/                 # Custom React hooks
└── lib/
    ├── utils.ts           # cn() utility (clsx + tailwind-merge)
    ├── env.ts             # Zod env validation
    ├── auth/              # Clerk auth config + hooks
    └── hive-mind/         # Hive Mind API client + context
```

## Auth Architecture

All Hive Mind API calls go through a **server-side proxy** at `/api/hive-mind/*`:

```
Browser (Clerk session) → /api/hive-mind/* proxy → Hive Mind API (private network)
                            ├── Clerk auth() + getToken()
                            └── Authorization: Bearer <clerk session token>
```

- **No API keys or tokens in browser code**
- **No localStorage token storage**
- Backend receives Clerk Bearer token for user auth
- 401 triggers redirect to `/sign-in`

See [docs/HIVE_MIND_API.md](docs/HIVE_MIND_API.md) for details.

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Edit .env.local with your values (see docs/RAILWAY_ENV.md)
# Key variables: Clerk keys, HIVE_MIND_API_URL

# Start dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Visit `/login` to sign in.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Next.js) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

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

## Design System

The project has a comprehensive design system documented in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md):

- **Colors**: Purple-primary (#7060B8) with 20+ semantic tokens for light/dark mode
- **Radii**: Base 1rem with 6 derived sizes (10px to 42px)
- **Typography**: Inter (body) + Poppins (headings)
- **Shell**: Fixed page layout with sidebar + topbar pattern
- **Badges**: 6 badge types (intent, status, product, source, score, status dot)
- **Charts**: Recharts with consistent styling conventions

## Documentation

| File | Contents |
|------|----------|
| `DESIGN_SYSTEM.md` | Complete design tokens, layout, components, badges (644 lines) |
| `docs/ARCHITECTURE.md` | Product architecture, directory structure, module boundaries |
| `docs/HIVE_MIND_API.md` | API client architecture, proxy design, security properties |
| `docs/FRONTEND_ROUTES.md` | All 37 Hive Mind routes with properties |
| `docs/AUTH_PLAN.md` | Clerk auth implementation details |
| `docs/RAILWAY_ENV.md` | Railway environment variable configuration |
| `docs/architecture/auth-integration-plan.md` | Historical Keycloak auth plan (deprecated) |
| `n8n-workflows/README.md` | n8n lead scraping workflows |
| `AGENTS.md` | AI agent rules for Next.js 16 |

## Contributing

1. Follow the design system in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — all components and pages must match the existing tokens, layout patterns, and component conventions.
2. Use `cn()` for all class merges. Use CSS variable colors (`bg-card`, `text-foreground`, etc.) — never hardcode colors except for semantic UI (status badges, product colors).
3. All pages use `"use client"` and follow the page shell pattern.
4. Run `npm run build` and `npm run lint` before committing.
5. No `@ts-ignore`, `as any`, or commented-out code.
