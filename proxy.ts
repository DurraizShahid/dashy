/**
 * Next.js 16 Proxy — replaces middleware.ts.
 *
 * Uses Clerk middleware for authentication.
 * Public routes are accessible without auth; all others require a signed-in user.
 *
 * Convention: root-level file (or inside src/ next to app/).
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/__clerk")
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function proxy(_request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Public routes pass through without auth
  if (isPublicRoute(pathname)) {
    return;
  }

  // Protected routes: require authentication
  await auth.protect();
});

// Proxy runs on all routes except static files and Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
