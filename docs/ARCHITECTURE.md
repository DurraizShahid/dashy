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
│   ├── hive-mind/          # Hive Mind module (NEW)
│   ├── dashboard/          # HelpTribe dashboard
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

All existing HelpTribe CRM pages use `"use client"` and follow the CRMSidebar + CRMTopbar shell pattern.
New Hive Mind pages follow the same shell pattern for visual consistency but will introduce:

1. Server components where feasible (data fetching from Hive Mind API)
2. A shared API client (`@/lib/hive-mind/client`)
3. Environment-based configuration (`NEXT_PUBLIC_HIVE_MIND_API_URL`)

## Integration Points

- **Hive Mind API**: REST API at `NEXT_PUBLIC_HIVE_MIND_API_URL` (private Railway network)
- **Keycloak**: Future OIDC auth provider (external, not yet configured)
- **Railway**: Deployment platform; service-to-service private networking
