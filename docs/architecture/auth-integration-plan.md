# Keycloak Authentication Integration Plan

## Chosen Approach: Custom OIDC Authorization Code + PKCE

**Decision:** Direct Keycloak OIDC Authorization Code flow with PKCE, using server-side encrypted JWT session cookies. No third-party auth library.

**Why not Auth.js (NextAuth)?**
- `next-auth@5` is not a published version.
- `@auth/nextjs` is in very early prerelease (0.0.0-*).
- `next-auth@4` targets older Next.js and has unknown compatibility with Next.js 16.
- A direct OIDC implementation gives full control, zero library risk, and works with any Keycloak version.

**Why not localStorage?**
- Access tokens in `localStorage` are vulnerable to XSS.
- No built-in expiry/refresh mechanism.
- Cannot be invalidated server-side.

## Architecture

```
Browser                    Next.js (Server)                  Keycloak               Hive Mind API
   │                            │                              │                        │
   │  GET /login                │                              │                        │
   │──────────────────────────>│                              │                        │
   │                            │                              │                        │
   │  Click "Sign in"          │                              │                        │
   │──────────────────────────>│  GET /api/auth/login          │                        │
   │                            │─────────────────────────────>│                        │
   │                            │  Redirect to Keycloak       │                        │
   │                            │  (code_challenge + state)   │                        │
   │                            │<─────────────────────────────│                        │
   │  302 → Keycloak login     │                              │                        │
   │<──────────────────────────│                              │                        │
   │                            │                              │                        │
   │  User authenticates       │                              │                        │
   │─────────────────────────────────────────────────────────>│                        │
   │                            │                              │                        │
   │  302 → /api/auth/callback │                              │                        │
   │<──────────────────────────────────────────────────────────│                        │
   │                            │                              │                        │
   │  GET /api/auth/callback   │                              │                        │
   │  (code + state)          │                              │                        │
   │──────────────────────────>│                              │                        │
   │                            │  POST /token (code exchange)│                        │
   │                            │─────────────────────────────>│                        │
   │                            │  {access_token, refresh}    │                        │
   │                            │<─────────────────────────────│                        │
   │                            │                              │                        │
   │                            │  Set hm_session (httpOnly)  │                        │
   │  302 → /hive-mind         │                              │                        │
   │<──────────────────────────│                              │                        │
   │                            │                              │                        │
   │  GET /hive-mind/*         │                              │                        │
   │  (hm_session cookie)     │                              │                        │
   │──────────────────────────>│                              │                        │
   │                            │                              │                        │
   │  fetch /api/hive-mind/*   │                              │                        │
   │──────────────────────────>│                              │                        │
   │                            │  GET /api/v1/* (Bearer)     │                        │
   │                            │─────────────────────────────────────────────────────>│
   │                            │  Response                   │                        │
   │                            │<─────────────────────────────────────────────────────│
   │  Response                 │                              │                        │
   │<──────────────────────────│                              │                        │
```

## Token Storage

| What | Where | Accessible to Browser JS? |
|---|---|---|
| Keycloak access token | `hm_session` HTTP-only cookie (encrypted JWT) | **No** |
| Keycloak refresh token | `hm_session` HTTP-only cookie (encrypted JWT) | **No** |
| Session encryption key | `SESSION_ENCRYPTION_KEY` env var (server-only) | **No** |
| Keycloak client secret | `KEYCLOAK_CLIENT_SECRET` env var (server-only) | **No** |
| User name/email | `GET /api/auth/session` response (read-only) | Yes (safe) |

## Files

### New Files

| File | Purpose |
|---|---|
| `src/lib/auth/session.ts` | Server-side session JWT encryption/decryption, cookie management |
| `src/app/api/auth/login/route.ts` | Initiates Keycloak OIDC flow with PKCE |
| `src/app/api/auth/callback/route.ts` | Handles Keycloak callback, exchanges code for tokens |
| `src/app/api/auth/logout/route.ts` | Clears session, redirects to Keycloak logout |
| `src/app/api/auth/session/route.ts` | Returns client-safe session info (no tokens) |
| `src/app/api/hive-mind/[...path]/route.ts` | Forwards requests to Hive Mind API with Bearer token |
| `src/app/login/page.tsx` | Login page (config check + sign-in button) |
| `src/lib/hive-mind/hive-mind-context.tsx` | Tenant/project context provider |

### Modified Files

| File | Change |
|---|---|
| `src/lib/auth/use-auth.ts` | Removed localStorage logic. Now fetches `GET /api/auth/session`. `login()`/`logout()` redirect to server routes |
| `src/components/auth/auth-gate.tsx` | Uses real session from `useAuth()`. Added login button for configured-but-unauthenticated state |
| `src/components/crm/crm-topbar.tsx` | Added `UserMenu` component showing login/logout and user initials |
| `src/lib/hive-mind/client.ts` | Now routes through `/api/hive-mind/*` proxy instead of direct API calls. No token management |
| `src/lib/hive-mind/provider.tsx` | Removed API key injection (all auth is server-side) |
| `src/lib/hive-mind/types.ts` | Updated to match real backend contract (task/agentType, citations, chunks, etc.) |
| `src/lib/env.ts` | Removed `NEXT_PUBLIC_HIVE_MIND_API_KEY`. Renamed to `NEXT_PUBLIC_HIVEMIND_API_URL` |
| `src/components/providers.tsx` | Added `HiveMindTenantProvider` |
| `src/components/hive-mind/health-status.tsx` | Now uses `useHiveMindClient()` instead of `createClient()` |
| `.env.example` | Removed public API key. Added server-only vars |

## API Proxy Design

The proxy at `/api/hive-mind/[...path]/route.ts`:

1. Reads the `hm_session` HTTP-only cookie
2. Decrypts the JWT to get the access token
3. Checks if the endpoint requires auth (all except `/` and `/health`)
4. Forwards the request to `HIVEMIND_API_URL/<path>` with `Authorization: Bearer <token>`
5. On 401, clears the session cookie so the client re-authenticates
6. Returns the response as JSON or text

## Environment Variables

### Public (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_HIVEMIND_API_URL` — Hive Mind API URL (public)
- `NEXT_PUBLIC_KEYCLOAK_URL` — Keycloak server URL
- `NEXT_PUBLIC_KEYCLOAK_REALM` — Keycloak realm name
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` — Keycloak OIDC client ID
- `NEXT_PUBLIC_APP_URL` — Canonical app URL for OIDC redirect_uri

### Server-Only
- `KEYCLOAK_CLIENT_SECRET` — Keycloak client secret (confidential client)
- `SESSION_ENCRYPTION_KEY` — 32-byte hex key for session JWT encryption
- `HIVEMIND_API_URL` — Server-side Hive Mind API URL (private network)
- `HIVEMIND_INTERNAL_API_KEY` — Optional, for server-only admin operations only

## Security

- No tokens in localStorage
- No API keys in browser code
- HTTP-only, Secure, SameSite=Lax session cookie
- PKCE code challenge prevents authorization code interception
- Anti-forgery state parameter prevents CSRF on callback
- Session JWT encrypted with AES-256-GCM
- Token refresh on expiry (server-side)
- 401 from Hive Mind API triggers session invalidation

## Limitations

- No built-in rate limiting on the proxy (add if needed)
- Token refresh happens on session check, not transparently on each API call
- No multi-tab session sync (each tab independently checks auth)
- Login page does not auto-redirect back to the original page (TODO)
