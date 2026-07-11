# Railway Environment

## Current Status

- Dashy deployed: `https://dashy-production-4cb5.up.railway.app`
- Hive Mind API: `https://hivemind-api-production-edd9.up.railway.app` (public URL — private DNS not working)
- Keycloak: `https://keycloak-production-15b2.up.railway.app`
- Project: `nervous-system` / Service: `dashy` / Env: `production`
- Branch: `dashy/release-candidate-v1` (PR #1, auto-deploys)

## Services

| Service | Purpose | URL |
|---------|---------|-----|
| Dashy (this) | Next.js frontend | `https://dashy-production-4cb5.up.railway.app` |
| Hive Mind API | Backend API | `https://hivemind-api-production-edd9.up.railway.app` (public) |
| Keycloak | Auth provider | `https://keycloak-production-15b2.up.railway.app` |

## Required Env Vars (Production)

| Variable | Value | Server-only | Notes |
|----------|-------|:-----------:|-------|
| `HIVE_MIND_API_URL` | `https://hivemind-api-production-edd9.up.railway.app` | Yes | Proxy backend URL (preferred) |
| `NEXT_PUBLIC_HIVE_MIND_API_URL` | `https://hivemind-api-production-edd9.up.railway.app` | No | Fallback for proxy; used by UI if needed |
| `NEXT_PUBLIC_KEYCLOAK_URL` | `https://keycloak-production-15b2.up.railway.app` | No | Public Keycloak URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `hivemind` | No | Keycloak realm |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `hivemind-api` | No | PKCE public client |
| `NEXT_PUBLIC_BASE_URL` | `https://dashy-production-4cb5.up.railway.app` | No | OIDC redirect base |
| `SESSION_ENCRYPTION_KEY` | *(set via CLI)* | Yes | Secret used to derive the hm_session JWE encryption key |
| `KEYCLOAK_CLIENT_SECRET` | *(set via CLI)* | Yes | RSA private key from Keycloak Credentials tab |

### Removed

| Variable | Reason |
|----------|--------|
| `NEXT_PUBLIC_HIVE_MIND_API_KEY` | Unused in source code — was dead config exposed as NEXT_PUBLIC |

## Development

Add to `.env.local`:

```env
HIVE_MIND_API_URL=https://hivemind-api-production-edd9.up.railway.app
NEXT_PUBLIC_HIVE_MIND_API_URL=https://hivemind-api-production-edd9.up.railway.app
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak-production-15b2.up.railway.app
NEXT_PUBLIC_KEYCLOAK_REALM=hivemind
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=hivemind-api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SESSION_ENCRYPTION_KEY=<generate a secure random string>
```

> The Keycloak redirect URI must include `http://localhost:3000/api/auth/callback` for local dev.

## Private Networking

Railway private DNS (`http://hivemind-api.railway.internal`) is not resolving
from the Dashy container as of 2026-07-11. Using the public URL instead.

**To enable private networking later**:
1. Verify both Dashy and Hive Mind are in the same Railway project (`nervous-system`)
2. Enable private networking in Railway project settings
3. Set `HIVE_MIND_API_URL` to the correct private DNS format
4. Redeploy Dashy

## Deployment Config

No `railway.json` or `nixpacks.toml` — Railway auto-detects Next.js.

Build: `npm ci` → `npm run build` (next build) → `npm start` (next start on port 8080)
Branch: `dashy/release-candidate-v1` (auto-deploys on push)

## Zero-Downtime Deploys

Next.js supports zero-downtime deploys out of the box on Railway.
Railway auto-redeploys on env var changes and pushes to the deployed branch.
