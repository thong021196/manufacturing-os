/**
 * Owner-admin configuration, read from the environment. In production every
 * value comes from the `manufacturing-os/admin` Secrets Manager secret,
 * injected into the ECS task at start (infra/terraform/secrets.tf, ecs.tf).
 * Nothing here has a usable default: if the admin is not fully configured
 * it stays locked (login always fails with a generic message).
 *
 *   ADMIN_USERNAME          owner login name
 *   ADMIN_PASSWORD_HASH     scrypt hash from `npm run admin:hash-password`
 *                           (never the plaintext password)
 *   ADMIN_SESSION_SECRET    >= 32 random chars; encrypts + authenticates the
 *                           session cookie. Rotating it logs every session out.
 *   ADMIN_TOTP_SECRET       optional base32 TOTP secret from
 *                           `npm run admin:totp-secret`; when set, a 6-digit
 *                           authenticator code is REQUIRED at login.
 *   ADMIN_SESSION_TTL_HOURS optional, default 12, clamped 1..72.
 */

// Values Terraform seeds the secret with before the owner sets real ones.
const PLACEHOLDERS = new Set(["", "UNSET", "CHANGE_ME", "PLACEHOLDER", "SET_ME"]);

function envValue(name: string): string | null {
  const raw = process.env[name]?.trim() ?? "";
  return PLACEHOLDERS.has(raw) ? null : raw;
}

export interface AdminConfig {
  username: string;
  passwordHash: string;
  sessionSecret: string;
  totpSecret: string | null;
  sessionTtlSeconds: number;
}

export type AdminConfigResult = { ok: true; config: AdminConfig } | { ok: false; reason: string };

export function readAdminConfig(): AdminConfigResult {
  const username = envValue("ADMIN_USERNAME");
  const passwordHash = envValue("ADMIN_PASSWORD_HASH");
  const sessionSecret = envValue("ADMIN_SESSION_SECRET");
  if (!username || !passwordHash || !sessionSecret) {
    return { ok: false, reason: "ADMIN_USERNAME, ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET must all be set" };
  }
  if (!passwordHash.startsWith("scrypt:")) {
    return { ok: false, reason: "ADMIN_PASSWORD_HASH is not an scrypt hash from `npm run admin:hash-password`" };
  }
  if (sessionSecret.length < 32) {
    return { ok: false, reason: "ADMIN_SESSION_SECRET must be at least 32 characters" };
  }
  const ttlHours = Number(process.env.ADMIN_SESSION_TTL_HOURS);
  const hours = Number.isFinite(ttlHours) && ttlHours > 0 ? Math.min(72, Math.max(1, ttlHours)) : 12;
  return {
    ok: true,
    config: {
      username,
      passwordHash,
      sessionSecret,
      totpSecret: envValue("ADMIN_TOTP_SECRET"),
      sessionTtlSeconds: Math.round(hours * 3600),
    },
  };
}

/** The owner's display timezone for dates in /admin (IANA name). */
export function adminTimeZone(): string {
  const tz = process.env.ADMIN_TIMEZONE || "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}
