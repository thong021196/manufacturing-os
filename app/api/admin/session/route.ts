import { NextResponse, type NextRequest } from "next/server";
import { requireAdminForRoute } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/** Session probe used by the login page (see login-form.tsx). Reveals only
 * a boolean for the caller's own cookie. proxy.ts already 401s requests
 * without a valid session; this handler re-checks anyway. */
export function GET(request: NextRequest) {
  const session = requireAdminForRoute(request);
  return NextResponse.json({ authenticated: Boolean(session) }, { status: session ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
