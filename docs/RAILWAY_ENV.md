# Railway Environment Plan

## Current Status

- The app is deployed on Railway (URL: `dashy-production-xxxx.up.railway.app`)
- `.env` contains `DATABASE_URL` (Postgres), `OPENAI_API_KEY`, `GITHUB_TOKEN` (all gitignored)
- No `railway.json` or `nixpacks.toml` config file
- No private networking configured between Dashy and Hive Mind

## Services

| Service | Purpose | URL |
|---------|---------|-----|
| Dashy (this) | Next.js frontend | `dashy-production-xxxx.up.railway.app` |
| Hive Mind | Backend API | `hive-mind-production-929f.up.railway.app` |

## Required Env Vars

### Production

| Variable | Source | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_HIVE_MIND_API_URL` | Railway private network or public URL | Must be set for Hive Mind features |
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak service | Future |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak config | Future |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Keycloak client | Future |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret | Future, server-only |
| `NEXTAUTH_SECRET` | Generated | Future, server-only |

### Development

Add to `.env.local`:

```env
NEXT_PUBLIC_HIVE_MIND_API_URL=https://hive-mind-production-929f.up.railway.app
```

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
