# Backend Gaps — Release Candidate v1

## Summary

Status as of Dashy RC v1 (`dashy/release-candidate-v1`) with Hive Mind RC PR #8.

## Gap 1: No Frontend API URL Configuration ✅ Resolved

**Fix**: `NEXT_PUBLIC_HIVE_MIND_API_URL` env var added and validated at runtime (`src/lib/env.ts`).

## Gap 2: No Authentication Between Frontend and Backend ✅ Resolved

**Fix**: Keycloak OIDC + PKCE (S256) flow implemented. Server-side encrypted HTTP-only session cookie. No browser tokens. Callback strictly verifies state and PKCE verifier.

## Gap 3: Hive Mind API May Need CORS Configuration ✅ Resolved

**Fix**: All API calls go through `/api/hive-mind/*` server-side proxy. No CORS needed.

## Gap 4: No Shared Type Definitions ✅ Partially Resolved

**Fix**: Types defined in `src/lib/hive-mind/types.ts`. Based on backend PR #6/#8 descriptions.

Remaining: Verify against live deployment. Backend types may differ from frontend expectations.

## Gap 5: No Error Handling / Retry Strategy ✅ Partially Resolved

**Fix**: `HiveMindApiError` and `HiveMindNetworkError` provide basic error handling. Per-page error states for 401/403/404/500.

Remaining: No retry strategy, no exponential backoff, no circuit breaker.

## Gap 6: No Proxy Configuration ✅ Resolved

**Fix**: `/api/hive-mind/[...path]` route handler proxies all methods and attaches Bearer token from session cookie.

## Gap 7: Missing Private Network Configuration ⚠️ Not Started

**Fix**: Documented in `RAILWAY_ENV.md`. Not yet configured in Railway deployment.

## Gap 8: API Key Management Endpoints ✅ Verified Live (Phase 4A.6 Audit)

**Status**: Backend PR #8 verified live. Endpoints work:
- API key list with admin key returns 200 ✅
- API key management scoped correctly (tenant key gets 403) ✅

**Remaining**: Full browser E2E requires local Keycloak for login flow.

## Gap 9: Audit Logs Endpoint ✅ Verified (Phase 4A.6 Audit)

**Status**: Backend returns audit logs for owner/admin role. Frontend design confirmed compatible.

## Gap 10: Backend RC Production Smoke Test ✅ Passed (Phase 4A.6)

**Status**: Backend RC PR #8 verified live on production deployment. See audit report for details.
