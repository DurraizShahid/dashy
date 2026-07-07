/**
 * Next.js 16 Proxy (replaces middleware.ts).
 *
 * Currently runs in pass-through mode — all requests proceed normally.
 * When Keycloak auth is deployed, uncomment the auth-check section
 * to protect /hive-mind/* and /api/* routes.
 *
 * Convention: root-level file (or inside src/ next to app/).
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(_req: NextRequest) {
  // ─── Security Headers ───────────────────────────────────────────
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Future: Hive Mind API auth token injection
  // const token = request.cookies.get("hm_session")?.value;
  // if (token && pathname.startsWith("/api/hive-mind/")) {
  //   const url = new URL(pathname.replace("/api/hive-mind", ""), process.env.NEXT_PUBLIC_HIVE_MIND_API_URL);
  //   return NextResponse.rewrite(url, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  // }

  // Future: Auth-protected route redirect
  // if (pathname.startsWith("/hive-mind") && !token) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  return response;
}

// Proxy runs on all routes except static files and Next.js internals
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
