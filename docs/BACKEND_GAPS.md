# Backend Gaps

## Summary

The Hive Mind API has multiple gaps that affect the Dashy frontend integration.
Some have been resolved, others remain.

## Gap 1: No Frontend API URL Configuration ✅ Resolved

**Fix**: `NEXT_PUBLIC_HIVE_MIND_API_URL` env var added and validated at runtime (`src/lib/env.ts`).

## Gap 2: No Authentication Between Frontend and Backend ✅ Resolved

**Fix**: Keycloak OIDC + PKCE flow implemented. Server-side encrypted HTTP-only session cookie. No browser tokens.

## Gap 3: Hive Mind API May Need CORS Configuration ✅ Resolved

**Fix**: All API calls go through `/api/hive-mind/*` server-side proxy. No CORS needed.

## Gap 4: No Shared Type Definitions ✅ Partially Resolved

**Fix**: Types defined in `src/lib/hive-mind/types.ts`. Based on backend API descriptions, not yet verified against live backend.

Remaining: Backend PR #6 types may differ from frontend expectations. Verify against live deployment.

## Gap 5: No Error Handling / Retry Strategy ✅ Partially Resolved

**Fix**: `HiveMindApiError` and `HiveMindNetworkError` provide basic error handling. Per-page error states for 401/403/404/500.

Remaining: No retry strategy, no exponential backoff, no circuit breaker.

## Gap 6: No Proxy Configuration ✅ Resolved

**Fix**: `/api/hive-mind/[...path]` route handler proxies all methods and attaches Bearer token from session cookie.

## Gap 7: Missing Private Network Configuration ⚠️ Not Started

**Fix**: Document in `RAILWAY_ENV.md` when Railway deployment is configured.

## Gap 8: API Key Management Endpoints ⚠️ Needs Verification

**Status**: Backend PR #7 adds `GET/POST /api/v1/api-keys` and `POST /api/v1/api-keys/:id/revoke`.

Frontend implements:
- List, create, revoke flows
- Plaintext key shown once on creation
- No localStorage/sessionStorage key persistence
- Permission-aware (403 handling)

Remaining: Verify against live backend after PR #7 is merged and deployed.

## Gap 9: Audit Logs Endpoint ⚠️ Needs Verification

**Status**: `GET /api/v1/audit-logs` endpoint exists but not yet verified against live backend.

Frontend implements:
- List with cursor-based pagination
- Tenant filtering
- Action/target/actor display
