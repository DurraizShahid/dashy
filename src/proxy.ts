/**
 * Next.js 16 Proxy — replaces middleware.ts.
 *
 * Uses Clerk middleware for authentication.
 * Public routes are accessible without auth; all others require a signed-in user.
 *
 * Convention: same level as app/ directory.
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  "/__clerk(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
