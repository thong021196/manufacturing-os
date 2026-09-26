import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * RFC 6238 TOTP (HMAC-SHA1, 30 s step, 6 digits) -- what Google
 * Authenticator, 1Password, Authy, etc. implement. No dependency.
 * Verification accepts the current step +/- 1 (clock skew) and rejects a
 * code whose step was already used (replay protection, in-process -- the
 * app runs as a single ECS task).
 */

const STEP_SECONDS = 30;
const DIGITS = 6;
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer | null {
  const clean = input.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** 20 random bytes (160 bits, RFC 4226 recommendation), base32. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpCode(secret: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(bin % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function totpCounter(nowMs: number): number {
  return Math.floor(nowMs / 1000 / STEP_SECONDS);
}

let lastAcceptedCounter = -1;

/** Returns the matching time-step for `code` (current step +/- 1), or null.
 * Does NOT record the step as used: call markTotpUsed() only once the whole
 * login succeeded, so a failed attempt (e.g. wrong password with a valid
 * code) doesn't burn the code the owner is about to retry with. */
export function matchTotp(secretB32: string, code: string, nowMs: number = Date.now()): number | null {
  const secret = base32Decode(secretB32);
  if (!secret || secret.length < 10) return null;
  const candidate = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(candidate)) return null;
  const current = totpCounter(nowMs);
  let matched = -1;
  // Check every window (no early exit) so timing doesn't reveal which one.
  for (const counter of [current - 1, current, current + 1]) {
    const expected = Buffer.from(totpCode(secret, counter));
    if (timingSafeEqual(expected, Buffer.from(candidate))) matched = counter;
  }
  // Replay protection: a step at or before the last successful login's
  // step is never accepted again.
  if (matched === -1 || matched <= lastAcceptedCounter) return null;
  return matched;
}

export function markTotpUsed(counter: number): void {
  lastAcceptedCounter = Math.max(lastAcceptedCounter, counter);
}

/** match + mark in one step (tests / simple callers). */
export function verifyTotp(secretB32: string, code: string, nowMs: number = Date.now()): boolean {
  const matched = matchTotp(secretB32, code, nowMs);
  if (matched === null) return false;
  markTotpUsed(matched);
  return true;
}

/** otpauth:// URI for adding the secret to an authenticator app. */
export function totpUri(secretB32: string, account: string, issuer = "Manufacturing OS Admin"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/** Test hook: reset replay protection. */
export function resetTotpReplayGuard(): void {
  lastAcceptedCounter = -1;
}
