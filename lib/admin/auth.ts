import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { readAdminConfig } from "@/lib/admin/config";
import { verifyPassword } from "@/lib/admin/password";
import { loginRetryAfterMs, recordLoginFailure, recordLoginSuccess } from "@/lib/admin/rate-limit";
import { ADMIN_COOKIE, createSessionToken, readSessionToken, sessionCookieOptions, type AdminSession } from "@/lib/admin/session";
import { markTotpUsed, matchTotp } from "@/lib/admin/totp";

/**
 * Server-side admin authorization. proxy.ts is the first gate (it redirects
 * or 401s every /admin and /api/admin request without a valid session), but
 * per the Next.js data-security guidance every page, server action and
 * route handler that touches admin data ALSO calls requireAdmin() /
 * requireAdminForRoute() itself -- a matcher change can never silently
 * expose data.
 */

export async function getAdminSession(): Promise<AdminSession | null> {
  const cfg = readAdminConfig();
  if (!cfg.ok) return null;
  const store = await cookies();
  return readSessionToken(store.get(ADMIN_COOKIE)?.value, cfg.config);
}

/** For pages and server actions: returns the session or redirects to login. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For route handlers: returns the session or null (caller sends 401). */
export function requireAdminForRoute(request: NextRequest): AdminSession | null {
  const cfg = readAdminConfig();
  if (!cfg.ok) return null;
  return readSessionToken(request.cookies.get(ADMIN_COOKIE)?.value, cfg.config);
}

// Per-process random key: only used to turn both usernames into equal-length
// digests for a constant-time comparison.
const compareKey = randomBytes(32);
function constantTimeEquals(a: string, b: string): boolean {
  const da = createHmac("sha256", compareKey).update(a).digest();
  const db = createHmac("sha256", compareKey).update(b).digest();
  return timingSafeEqual(da, db);
}

export type LoginResult =
  | { ok: true; token: string; maxAge: number }
  | { ok: false; error: string; retryAfterSeconds?: number };

/** One generic message for every failure (unknown user, wrong password,
 * wrong/missing code, admin not configured): nothing about which part was
 * wrong is revealed. */
export const GENERIC_LOGIN_ERROR = "Sign-in failed. Check your details and try again.";

export async function attemptLogin(input: { username: string; password: string; totp: string; ip: string }): Promise<LoginResult> {
  const retryAfter = loginRetryAfterMs(input.ip);
  if (retryAfter > 0) {
    return { ok: false, error: "Too many failed sign-in attempts. Try again later.", retryAfterSeconds: Math.ceil(retryAfter / 1000) };
  }

  const cfg = readAdminConfig();
  if (!cfg.ok) {
    console.error(`[admin] login attempted but admin is not configured: ${cfg.reason}`);
    recordLoginFailure(input.ip);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }
  const { config } = cfg;

  // Always run the (slow) password check, even for a wrong username, so
  // timing does not reveal whether the username was right.
  const usernameOk = constantTimeEquals(input.username.trim(), config.username);
  const passwordOk = await verifyPassword(input.password, config.passwordHash);
  const totpStep = config.totpSecret ? matchTotp(config.totpSecret, input.totp) : null;
  const totpOk = config.totpSecret ? totpStep !== null : true;

  if (!(usernameOk && passwordOk && totpOk)) {
    recordLoginFailure(input.ip);
    console.warn("[admin] failed sign-in attempt", { ip: input.ip });
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  if (totpStep !== null) markTotpUsed(totpStep);
  recordLoginSuccess(input.ip);
  console.info("[admin] owner signed in", { ip: input.ip });
  const { token, maxAge } = createSessionToken(config);
  return { ok: true, token, maxAge };
}

export async function setSessionCookie(token: string, maxAge: number): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, token, sessionCookieOptions(maxAge));
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
}

export function adminTotpRequired(): boolean {
  const cfg = readAdminConfig();
  return cfg.ok && cfg.config.totpSecret !== null;
}

/** Only same-origin /admin paths are allowed as a post-login destination
 * (no open redirect). */
export function safeAdminNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.includes("\\") || next.startsWith("/admin/login")) {
    return "/admin";
  }
  return next;
}
