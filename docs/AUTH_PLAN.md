# Keycloak Frontend Auth Plan

## Current State

No authentication exists. The app is fully client-side rendered with no auth middleware, proxy, or token management.
The Hive Mind API returns 401 for all protected endpoints.

## Target Architecture

```
Browser ──► Next.js App ──► Hive Mind API
    │                            │
    └── Keycloak (OIDC) ────────┘
```

## Keycloak Integration

### OIDC Flow

1. User visits Dashy → redirected to Keycloak login
2. Keycloak returns auth code → exchanged for tokens via `proxy.ts`
3. `proxy.ts` (Next.js 16 middleware replacement) handles token refresh, sets secure cookies
4. API client reads token from cookie/Auth header

### Next.js 16 Notes

- `middleware.ts` is **deprecated** in Next.js 16. Use `proxy.ts` instead.
- Proxy runs at the edge layer, before the request reaches the app
- Good for: token validation, redirect to login, header injection

### Implementation Plan

**Phase 1: Awareness (current PR)**
- Add `AUTH_ENABLED` env var
- Create `src/lib/auth/config.ts` with Keycloak configuration constants
- Add `AuthGate` component that wraps protected sections
- `/hive-mind/health` page stays public (no auth needed)

**Phase 2: Keycloak Setup**
- Configure Keycloak realm, client, users on Railway Keycloak instance
- Set Keycloak env vars (`KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`)
- Add `next-auth` or `@react-oauth2/code-flow` package or custom OIDC client
- Implement `proxy.ts` for token exchange (Next.js 16 pattern)

**Phase 3: Integration**
- Wire `proxy.ts` to protect `/api/*` and `/hive-mind/*` routes
- Inject auth token into Hive Mind API client
- Add login/logout UI
- Handle token refresh and silent auth

### Key Env Vars

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak server URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak realm name |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | OIDC client ID |
| `KEYCLOAK_CLIENT_SECRET` | OIDC client secret (server-only) |
| `NEXTAUTH_SECRET` | Encryption secret for session cookies |

## Auth Gate Component

```typescript
// Design sketch
function AuthGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return fallback ?? <RedirectToLogin />;
  return children;
}
```

First pass: a simple `useAuth()` hook that checks for a `KEYCLOAK_TOKEN` cookie.
Full implementation deferred until Keycloak is deployed and configured.
