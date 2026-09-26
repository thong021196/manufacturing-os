import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";
import type { AdminConfig } from "@/lib/admin/config";

/**
 * Stateless, encrypted + authenticated admin session token.
 *
 * - AES-256-GCM with a key derived (HKDF-SHA256) from ADMIN_SESSION_SECRET:
 *   the cookie is opaque to the browser and any tampering fails the GCM tag.
 * - Payload carries issue/expiry times (checked server-side, independent of
 *   the cookie's Max-Age) and a fingerprint of ADMIN_PASSWORD_HASH, so
 *   changing the password OR rotating ADMIN_SESSION_SECRET invalidates every
 *   existing session.
 * - Pure node:crypto with no Next.js imports, so both proxy.ts (Node runtime)
 *   and server components/actions can verify it.
 */

export const ADMIN_COOKIE = "__Host-mos_admin";
const VERSION = 1;
const AAD = Buffer.from("manufacturing-os-admin-session-v1");

export interface AdminSession {
  username: string;
  issuedAt: number; // epoch seconds
  expiresAt: number; // epoch seconds
}

interface Payload {
  v: number;
  u: string;
  iat: number;
  exp: number;
  pwf: string;
  n: string;
}

function key(secret: string): Buffer {
  return Buffer.from(hkdfSync("sha256", Buffer.from(secret, "utf8"), Buffer.from("manufacturing-os"), Buffer.from("admin-session-key-v1"), 32));
}

function passwordFingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 16);
}

export function createSessionToken(config: AdminConfig, nowMs: number = Date.now()): { token: string; maxAge: number } {
  const iat = Math.floor(nowMs / 1000);
  const payload: Payload = {
    v: VERSION,
    u: config.username,
    iat,
    exp: iat + config.sessionTtlSeconds,
    pwf: passwordFingerprint(config.passwordHash),
    n: randomBytes(8).toString("base64url"),
  };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(config.sessionSecret), iv);
  cipher.setAAD(AAD);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { token: Buffer.concat([iv, ciphertext, tag]).toString("base64url"), maxAge: config.sessionTtlSeconds };
}

export function readSessionToken(token: string | undefined, config: AdminConfig, nowMs: number = Date.now()): AdminSession | null {
  if (!token || token.length > 4096) return null;
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 12 + 16 + 2) return null;
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(raw.length - 16);
    const ciphertext = raw.subarray(12, raw.length - 16);
    const decipher = createDecipheriv("aes-256-gcm", key(config.sessionSecret), iv);
    decipher.setAAD(AAD);
    decipher.setAuthTag(tag);
    const payload = JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")) as Payload;
    const now = Math.floor(nowMs / 1000);
    if (payload.v !== VERSION) return null;
    if (payload.u !== config.username) return null;
    if (payload.pwf !== passwordFingerprint(config.passwordHash)) return null;
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;
    if (typeof payload.iat !== "number" || payload.iat > now + 60) return null;
    return { username: payload.u, issuedAt: payload.iat, expiresAt: payload.exp };
  } catch {
    return null;
  }
}

/** Cookie attributes for the session. `__Host-` prefix => Secure, Path=/,
 * no Domain: the cookie can never be scoped wider than this exact host or
 * set over plain HTTP. SameSite=Strict: never sent on cross-site requests
 * (CSRF). HttpOnly: unreadable from JavaScript. */
export function sessionCookieOptions(maxAge: number) {
  return { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/", maxAge };
}
