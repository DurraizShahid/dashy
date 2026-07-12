# Dashy Auth — Current State

## Overview

Dashy uses **Clerk** for user authentication via the official `@clerk/nextjs` SDK.

## Architecture

```
Browser ──► Dashy + Clerk ──► /api/hive-mind/* route handler ──► Hive Mind API
```

- **Browser**: Clerk handles sign-in/sign-up via `@clerk/nextjs` components and hooks
- **Dashy proxy**: `/api/hive-mind/*` uses `auth()` from Clerk to verify the user, then forwards the Clerk session token to the Hive Mind backend
- **Hive Mind API**: Receives the Bearer token and enforces RBAC

## Components

### ClerkProvider

Wraps the root layout (`src/app/layout.tsx`). Provides Clerk context to all components.

### clerkMiddleware (proxy.ts)

Runs in `proxy.ts` (Next.js 16 convention). Protects all routes except public ones:
- `/` — public
- `/login` — public
- `/sign-in/*` — public
- `/sign-up/*` — public
- `/api/health` — public
- `/hive-mind/*` — protected
- `/api/hive-mind/*` — protected

### Sign-in / Sign-up Pages

- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`

### AuthGate

`src/components/auth/auth-gate.tsx` — wraps protected content. Uses Clerk's `useAuth()` and `useUser()`.

### useAuth Hook

`src/lib/auth/use-auth.ts` — compatibility wrapper around Clerk:
- `isAuthenticated` — from `isSignedIn`
- `isLoading` — from `!isLoaded`
- `session` — derived from `useUser()`
- `login()` — redirects to `/sign-in`
- `logout()` — calls `signOut()`

### /api/auth/me

Returns safe user fields:
- `authenticated`, `userId`, `email`, `name`, `orgId`, `orgRole`
- Never returns tokens or session internals

## Env Vars

Required:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key (server-only)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` — `/hive-mind/overview`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` — `/hive-mind/overview`
- `HIVE_MIND_API_URL` — server-only backend URL

Removed:
- `NEXT_PUBLIC_KEYCLOAK_URL`
- `NEXT_PUBLIC_KEYCLOAK_REALM`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`
- `SESSION_ENCRYPTION_KEY`
- `NEXT_PUBLIC_HIVE_MIND_API_KEY`
