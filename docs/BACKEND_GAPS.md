# Backend Gaps

## Summary

The Hive Mind API is operational but has no existing integration with the Dashy frontend.
Several gaps need to be addressed before the frontend can meaningfully interact with protected endpoints.

## Gap 1: No Frontend API URL Configuration

**Issue**: Dashy has no `NEXT_PUBLIC_HIVE_MIND_API_URL` env var.
The Hive Mind API URL is currently hardcoded nowhere — the frontend doesn't know where to find it.

**Fix**: Add to `.env.example` and validate at runtime (see `src/lib/env.ts`).

## Gap 2: No Authentication Between Frontend and Backend

**Issue**: Hive Mind API requires auth for all non-public endpoints.
Keycloak is deployed on Railway but:
- No Keycloak client configured for Dashy
- No OIDC flow implemented in Dashy
- No token exchange mechanism

**Fix**: See `AUTH_PLAN.md` for the phased approach.

## Gap 3: Hive Mind API May Need CORS Configuration

**Issue**: If the frontend runs on a different domain than the API, CORS headers are needed.
The Hive Mind API should allow `Authorization` header and the Dashy origin.

**Fix**: Add CORS middleware to Hive Mind API (backend change, not in this repo).

## Gap 4: No Shared Type Definitions

**Issue**: The Hive Mind API response types are not defined in Dashy.
All response shapes must be reverse-engineered from the API or documented from the backend repo.

**Fix**: Create initial types in `src/lib/hive-mind/types.ts` based on public endpoint responses.

## Gap 5: No Error Handling / Retry Strategy

**Issue**: No client-side error handling, retry, or circuit-breaking for API calls.

**Fix**: The API client (`src/lib/hive-mind/client.ts`) provides a foundation. Future iterations should add:
- Exponential backoff for transient failures
- Token refresh on 401
- Error reporting to monitoring

## Gap 6: No Proxy Configuration

**Issue**: Next.js 16 deprecated `middleware.ts`. For API proxying with auth injection,
a `proxy.ts` file is needed but doesn't exist yet.

**Fix**: Add `proxy.ts` when implementing auth (Phase 2 of auth plan).

## Gap 7: Missing Private Network Configuration

**Issue**: The frontend should communicate with Hive Mind via Railway's private network
for production traffic. Currently no Railway config or service linking is in place.

**Fix**: Document in `RAILWAY_ENV.md`.
