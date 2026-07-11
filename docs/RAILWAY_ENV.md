# Railway Environment

## Current Status

- Dashy deployed: `https://dashy-production-4cb5.up.railway.app`
- Hive Mind API: `http://hivemind-api.railway.internal` (private network)
- Keycloak: `https://keycloak-production-15b2.up.railway.app`
- Project: `nervous-system` / Service: `dashy` / Env: `production`
- Branch: `dashy/release-candidate-v1` (PR #1, auto-deploys)

## Services

| Service | Purpose | URL |
|---------|---------|-----|
| Dashy (this) | Next.js frontend | `https://dashy-production-4cb5.up.railway.app` |
| Hive Mind API | Backend API | `http://hivemind-api.railway.internal` (private) |
| Keycloak | Auth provider | `https://keycloak-production-15b2.up.railway.app` |

## Required Env Vars (Production)

| Variable | Value | Server-only | Notes |
|----------|-------|:-----------:|-------|
| `NEXT_PUBLIC_HIVE_MIND_API_URL` | `http://hivemind-api.railway.internal` | No | Private network URL |
| `NEXT_PUBLIC_KEYCLOAK_URL` | `https://keycloak-production-15b2.up.railway.app` | No | Public Keycloak URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `hivemind` | No | Keycloak realm |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `hivemind-api` | No | PKCE public client |
| `NEXT_PUBLIC_BASE_URL` | `https://dashy-production-4cb5.up.railway.app` | No | OIDC redirect base |
| `SESSION_ENCRYPTION_KEY` | *(set via CLI)* | Yes | 32-byte hex for JWT signing |
| `KEYCLOAK_CLIENT_SECRET` | *(set via CLI)* | Yes | Currently InitialAccessToken — see note below |

> **Note on KEYCLOAK_CLIENT_SECRET**: The value currently set is a Keycloak InitialAccessToken JWT, not the standard client secret. For the PKCE public client flow this is fine — token exchange uses `code_verifier` instead. If server-side token refresh is needed later, replace with the actual secret from Keycloak admin → Clients → hivemind-api → Credentials.

### Removed

| Variable | Reason |
|----------|--------|
| `NEXT_PUBLIC_HIVE_MIND_API_KEY` | Unused in source code — was dead config exposed as NEXT_PUBLIC |

## Development

Add to `.env.local`:

```env
NEXT_PUBLIC_HIVE_MIND_API_URL=https://hivemind-api-production-edd9.up.railway.app
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak-production-15b2.up.railway.app
NEXT_PUBLIC_KEYCLOAK_REALM=hivemind
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=hivemind-api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SESSION_ENCRYPTION_KEY=<generate a secure random string>
```

> The Keycloak redirect URI must include `http://localhost:3000/api/auth/callback` for local dev.

## Deployment Config

No `railway.json` or `nixpacks.toml` yet — Railway auto-detects Next.js.

Future `railway.json`:

```json
{
  "build": {
    "buildCommand": "npm run build",
    "startCommand": "npm start"
  },
  "deploy": {
    "healthcheckPath": "/api/auth/me",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Zero-Downtime Deploys

Next.js supports zero-downtime deploys out of the box on Railway.
Railway auto-redeploys on env var changes and pushes to the deployed branch.
