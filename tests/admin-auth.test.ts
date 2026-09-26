import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import { base32Decode, base32Encode, markTotpUsed, matchTotp, resetTotpReplayGuard, totpCode, verifyTotp } from "@/lib/admin/totp";
import { createSessionToken, readSessionToken } from "@/lib/admin/session";
import type { AdminConfig } from "@/lib/admin/config";
import { clientIpFromHeaders, loginRetryAfterMs, recordLoginFailure, recordLoginSuccess, resetLoginRateLimits } from "@/lib/admin/rate-limit";
import { safeAdminNext } from "@/lib/admin/auth";

test("scrypt hash verifies the right password only, and rejects malformed hashes", async () => {
  const hash = await hashPassword("correct horse battery staple", 14); // low cost for test speed
  assert.match(hash, /^scrypt:14:8:1:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/);
  assert.equal(await verifyPassword("correct horse battery staple", hash), true);
  assert.equal(await verifyPassword("correct horse battery stapl", hash), false);
  assert.equal(await verifyPassword("x", "scrypt:14:8:1:bad"), false);
  assert.equal(await verifyPassword("x", "scrypt:30:8:1:AAAAAAAAAAAAAAAAAAAAAA:AAAA"), false); // absurd cost refused
  assert.notEqual(await hashPassword("same", 14), await hashPassword("same", 14)); // salted
});

test("TOTP matches RFC 6238 SHA-1 test vectors", () => {
  // RFC 6238 Appendix B: secret "12345678901234567890", 8-digit codes; the
  // 6-digit code is the last 6 digits.
  const secret = Buffer.from("12345678901234567890");
  const vectors: Array<[number, string]> = [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
  ];
  for (const [time, code] of vectors) {
    assert.equal(totpCode(secret, Math.floor(time / 30)), code.slice(-6), `t=${time}`);
  }
  assert.deepEqual(base32Decode(base32Encode(secret)), secret);
});

test("TOTP verification allows +/-1 step and rejects replay", () => {
  resetTotpReplayGuard();
  const secretB32 = base32Encode(Buffer.from("12345678901234567890"));
  const now = 1_700_000_000_000;
  const counter = Math.floor(now / 1000 / 30);
  const secret = Buffer.from("12345678901234567890");
  assert.equal(verifyTotp(secretB32, totpCode(secret, counter - 1), now), true);
  assert.equal(verifyTotp(secretB32, totpCode(secret, counter), now), true);
  assert.equal(verifyTotp(secretB32, totpCode(secret, counter), now), false, "replayed code must fail");
  assert.equal(verifyTotp(secretB32, totpCode(secret, counter + 5), now), false, "far-future code must fail");
  assert.equal(verifyTotp(secretB32, "abcdef", now), false);
});

test("a matched-but-not-committed TOTP code (failed login) can still be used once", () => {
  resetTotpReplayGuard();
  const secret = Buffer.from("12345678901234567890");
  const secretB32 = base32Encode(secret);
  const now = 1_700_000_300_000;
  const code = totpCode(secret, Math.floor(now / 1000 / 30));
  assert.notEqual(matchTotp(secretB32, code, now), null); // wrong password: not marked
  const step = matchTotp(secretB32, code, now);
  assert.notEqual(step, null, "retry with the same code works");
  markTotpUsed(step!);
  assert.equal(matchTotp(secretB32, code, now), null, "after a successful login it is burnt");
});

const config: AdminConfig = {
  username: "owner",
  passwordHash: "scrypt:14:8:1:AAAAAAAAAAAAAAAAAAAAAA:hash",
  sessionSecret: "x".repeat(48),
  totpSecret: null,
  sessionTtlSeconds: 3600,
};

test("session token round-trips and rejects tampering, expiry, rotation and password change", () => {
  const now = 1_700_000_000_000;
  const { token } = createSessionToken(config, now);
  assert.equal(readSessionToken(token, config, now + 1000)?.username, "owner");

  const raw = Buffer.from(token, "base64url");
  raw[20] ^= 1;
  assert.equal(readSessionToken(raw.toString("base64url"), config, now), null, "tampered token");
  assert.equal(readSessionToken(token, config, now + 3601_000), null, "expired token");
  assert.equal(readSessionToken(token, { ...config, sessionSecret: "y".repeat(48) }, now), null, "rotated secret");
  assert.equal(readSessionToken(token, { ...config, passwordHash: config.passwordHash + "2" }, now), null, "password changed");
  assert.equal(readSessionToken(token, { ...config, username: "someone" }, now), null, "username changed");
  assert.equal(readSessionToken("garbage", config, now), null);
  assert.equal(readSessionToken(undefined, config, now), null);
});

test("login rate limit locks an IP after 5 failures and clears on success", () => {
  resetLoginRateLimits();
  const t = 1_700_000_000_000;
  for (let i = 0; i < 4; i++) recordLoginFailure("1.2.3.4", t + i);
  assert.equal(loginRetryAfterMs("1.2.3.4", t + 10), 0);
  recordLoginFailure("1.2.3.4", t + 5);
  assert.ok(loginRetryAfterMs("1.2.3.4", t + 10) > 14 * 60_000);
  assert.equal(loginRetryAfterMs("5.6.7.8", t + 10), 0, "other IPs unaffected");
  assert.equal(loginRetryAfterMs("1.2.3.4", t + 16 * 60_000), 0, "lock expires");
  recordLoginSuccess("1.2.3.4");
  resetLoginRateLimits();
});

test("global lockout engages after 30 failures across IPs", () => {
  resetLoginRateLimits();
  const t = 1_700_000_000_000;
  for (let i = 0; i < 30; i++) recordLoginFailure(`10.0.0.${i}`, t + i);
  assert.ok(loginRetryAfterMs("192.168.1.1", t + 100) > 0);
  resetLoginRateLimits();
});

test("client IP uses the LAST X-Forwarded-For hop (the one the ALB appended)", () => {
  assert.equal(clientIpFromHeaders(new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" })), "203.0.113.9");
  assert.equal(clientIpFromHeaders(new Headers({})), "unknown");
});

test("post-login redirect only allows /admin paths", () => {
  assert.equal(safeAdminNext("/admin/rfqs/abc"), "/admin/rfqs/abc");
  assert.equal(safeAdminNext("https://evil.example"), "/admin");
  assert.equal(safeAdminNext("//evil.example"), "/admin");
  assert.equal(safeAdminNext("/admin/login"), "/admin");
  assert.equal(safeAdminNext("/administrator\\@evil"), "/admin");
  assert.equal(safeAdminNext(undefined), "/admin");
});
