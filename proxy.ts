import { NextResponse, type NextRequest } from "next/server";
import { readAdminConfig } from "@/lib/admin/config";
import { ADMIN_COOKIE, readSessionToken } from "@/lib/admin/session";
import { contentAdapter } from "@/lib/content/adapter";
import { GUIDE_PREFIXES } from "@/lib/content/publishing";

// Every registry path served by a guide route (app/<prefix>/[[...slug]]).
const guidePaths = new Set(
  contentAdapter
    .getAllEntries()
    .filter((e) => e.pageKind === "guide")
    .map((e) => e.path),
);

/**
 * Next.js 16 Proxy (formerly middleware). Two jobs:
 *
 * 1. Content-calendar guide prefixes (/robot-parts/...): any path that is not
 *    a registry guide path is rewritten to the site's normal 404 page before
 *    it reaches the ISR route, so scanners can't create cache entries (see
 *    app/robot-parts/[[...slug]]/page.tsx). Registry paths pass through; the
 *    page itself decides live vs 404 from the content calendar.
 *
 * 2. First gate for the owner admin.
 * Runs on the Node.js runtime (the default for proxy in this version), so it
 * verifies the encrypted session cookie with node:crypto directly.
 *
 *  - /admin/** without a valid session -> 302 to /admin/login?next=...
 *  - /api/admin/** without a valid session -> 401 JSON
 *  - every /admin and /api/admin response gets noindex + no-store +
 *    anti-framing headers.
 *
 * This is NOT the only check: every admin page, server action and route
 * handler re-verifies the session itself (lib/admin/auth.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (GUIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    if (guidePaths.has(normalized)) return NextResponse.next();
    // No route exists at this path, so Next renders app/not-found.tsx (404).
    return NextResponse.rewrite(new URL("/_not-a-registry-page", request.url));
  }

  const isApi = pathname.startsWith("/api/admin");
  const isLogin = pathname === "/admin/login";

  const cfg = readAdminConfig();
  const session = cfg.ok ? readSessionToken(request.cookies.get(ADMIN_COOKIE)?.value, cfg.config) : null;

  let response: NextResponse;
  if (!session && !isLogin) {
    if (isApi) {
      response = NextResponse.json({ error: "unauthorized" }, { status: 401 });
    } else {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      response = NextResponse.redirect(loginUrl);
    }
  } else if (session && isLogin) {
    response = NextResponse.redirect(new URL("/admin", request.url));
  } else {
    response = NextResponse.next();
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  response.headers.set("X-Content-Type-Options", "nosniff");
  // same-origin (not no-referrer): a no-referrer policy makes browsers send
  // `Origin: null` on POSTs, which would break Next.js's server-action
  // origin check (CSRF protection).
  response.headers.set("Referrer-Policy", "same-origin");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/robot-parts", "/robot-parts/:path*"],
};
