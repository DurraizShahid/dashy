# Railway Environment Variables

## Dashy

### Required (Server-Only)

| Variable | Description |
|----------|-------------|
| `CLERK_SECRET_KEY` | Clerk secret key for server-side API calls |
| `HIVE_MIND_API_URL` | Hive Mind backend URL (private network on Railway) |

### Required (Public / Build-Time)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/hive-mind/overview` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/hive-mind/overview` |
| `NEXT_PUBLIC_BASE_URL` | Dashy public URL |

### Deprecated / Removed

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_KEYCLOAK_URL` | Removed |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Removed |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Removed |
| `KEYCLOAK_CLIENT_SECRET` | Removed |
| `SESSION_ENCRYPTION_KEY` | Removed |
| `NEXT_PUBLIC_HIVE_MIND_API_KEY` | Removed |

## Local Development

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/hive-mind/overview
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/hive-mind/overview
HIVE_MIND_API_URL=https://hivemind-api-production-edd9.up.railway.app
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
