import { NextResponse, type NextRequest } from "next/server";
import { readAdminConfig } from "@/lib/admin/config";
import { ADMIN_COOKIE, readSessionToken } from "@/lib/admin/session";

/**
 * Next.js 16 Proxy (formerly middleware) -- first gate for the owner admin.
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
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
