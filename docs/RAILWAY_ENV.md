# Railway Environment

## Current Status

- Dashy is deployed on Railway (`dashy-production-xxxx.up.railway.app`)
- Hive Mind API is deployed on Railway (`hive-mind-api-production-edd9.up.railway.app`)
- Keycloak is deployed on Railway (`keycloak-production-15b2.up.railway.app`)
- No `railway.json` or `nixpacks.toml` config file yet
- Private networking not yet configured

## Services

| Service | Purpose | URL |
|---------|---------|-----|
| Dashy (this) | Next.js frontend | `dashy-production-xxxx.up.railway.app` |
| Hive Mind API | Backend API | `hive-mind-api-production-edd9.up.railway.app` |
| Keycloak | Auth provider | `keycloak-production-15b2.up.railway.app` |

## Required Env Vars

### Production (set on Railway dashboard)

| Variable | Source | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_HIVE_MIND_API_URL` | Railway private network or public URL | Must be set for Hive Mind features |
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak service | Keycloak deployment URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak config | e.g. `hivemind` |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Keycloak client | e.g. `hivemind-api` |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret | Server-only, used by `getServerAuthConfig()` |
| `SESSION_ENCRYPTION_KEY` | Generated | Server-only, used for HM_SESSION JWT signing |
| `NEXT_PUBLIC_BASE_URL` | This service's public URL | Canonical base URL for OIDC redirects. Falls back to `NEXT_PUBLIC_APP_URL`, then localhost:3000. |

### Development

Add to `.env.local`:

```env
NEXT_PUBLIC_HIVE_MIND_API_URL=https://hivemind-api-production-edd9.up.railway.app
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak-production-15b2.up.railway.app
NEXT_PUBLIC_KEYCLOAK_REALM=hivemind
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=hivemind-api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SESSION_ENCRYPTION_KEY=<generate a secure random string>
```

> **Note**: The Keycloak callback URL must be configured to include your local dev origin (`http://localhost:3000`). Without this, the OIDC flow will fail at the redirect step.

## Private Networking

For production, Dashy should connect to Hive Mind via Railway's private network
instead of the public URL. This requires both services to be in the same Railway project.

**Steps**:
1. Verify both Dashy and Hive Mind are in the same Railway project
2. Enable private networking in the Railway project settings
3. Set `NEXT_PUBLIC_HIVE_MIND_API_URL` to `http://hive-mind:PORT` (private DNS)
4. Re-deploy both services

## Deployment Config

Future `railway.json`:

```json
{
  "build": {
    "buildCommand": "npm run build",
    "startCommand": "npm start"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Zero-Downtime Deploys

Next.js supports zero-downtime deploys out of the box on Railway.
No special config needed — Railway handles traffic draining.
