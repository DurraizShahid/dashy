# Keycloak Frontend Auth — Current State (Release Candidate v1)

## Status: Implemented

Keycloak OIDC Authorization Code + PKCE (S256) flow is fully implemented.

## Architecture

```
Browser ──► Next.js Route Handler (/api/auth/*) ──► Keycloak
    │                          │
    │                    /api/hive-mind/* proxy
    │                          │
    └── HTTP-only cookie ──────┘── Bearer token ──► Hive Mind API
```

## Auth Flow

1. User clicks "Sign In" → redirected to `/api/auth/login`
2. Login route generates PKCE S256 challenge + verifier cookie, redirects to Keycloak
3. User authenticates with Keycloak → callback to `/api/auth/callback`
4. Callback verifies state and PKCE verifier cookie (fails if missing), exchanges auth code for tokens, creates encrypted session cookie (`hm_session`), redirects to `/hive-mind`
5. Session cookie is read by `/api/auth/me` to return session state to client
6. All `/api/hive-mind/*` requests proxy through server-side handler, which reads session cookie and attaches `Authorization: Bearer` header

## Key Design Decisions

- **Session Encryption**: HS256 JWT signed with `SESSION_ENCRYPTION_KEY` (server-only env var)
- **No Browser Secrets**: Access tokens, refresh tokens never reach the browser
- **No localStorage**: Session state is read from `/api/auth/me`, not from localStorage
- **PKCE S256**: Verifier is a 32-byte random base64url string (RFC 7636 compliant); challenge is `base64url(sha256(verifier))`; stored in HTTP-only cookie; callback fails if cookie is missing
- **State Verification**: Callback strictly verifies `oauth_state` cookie matches; fails if either is missing
- **Token Refresh**: `/api/auth/refresh` uses refresh token from session cookie to obtain new access tokens

## Client-Side Auth Hook

`useAuth()` in `src/lib/auth/use-auth.ts`:
- Calls `/api/auth/me` to check session state
- Returns `isAuthenticated`, `isLoading`, `session`, `login()`, `logout()`
- Login/logout redirect to server-side handlers
- No localStorage token access

## Permission Handling

- 401: Session expired — sign in again (layout shows "Authentication Required")
- 403: Permission denied — specific message per page
- 404: Not found or inaccessible
- Backend errors are not exposed as stack traces

## Env Vars Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak server URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak realm name |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | OIDC client ID |
| `KEYCLOAK_CLIENT_SECRET` | OIDC client secret (server-only, returned by `getServerAuthConfig()`) |
| `SESSION_ENCRYPTION_KEY` | Secret for session cookie signing (server-only) |
| `NEXT_PUBLIC_BASE_URL` | Canonical public URL for OIDC redirects (falls back to `NEXT_PUBLIC_APP_URL`, then localhost:3000) |

## Config API

- `getAuthConfig()` — public-safe config (keycloakUrl, realm, clientId). Safe for any context.
- `getServerAuthConfig()` — includes `clientSecret`. Server-only, never imported in client code.
- `getBaseUrl()` — canonical base URL with fallback chain: `NEXT_PUBLIC_BASE_URL` > `NEXT_PUBLIC_APP_URL` > `http://localhost:3000`

## API Key Management

In addition to OIDC auth, the app supports managing Hive Mind API keys:
- Keys are created, listed, and revoked through the `/api/hive-mind/*` proxy — no API key ever reaches the browser
- Plaintext key is shown once immediately after creation, never persisted in localStorage/sessionStorage
- Create/revoke flows use the same server-side session for authorization
