/**
 * Login throttling / lockout for the single-owner admin.
 *
 *  - Per client IP: 5 failed attempts within 15 min locks that IP out for
 *    15 min.
 *  - Global: 30 failed attempts within 15 min (from any mix of IPs) locks
 *    ALL logins for 15 min. Trade-off, stated plainly: an attacker can use
 *    this to keep the owner out for a while, but cannot keep guessing -- for
 *    a single-owner console holding customer CAD files, that is the right
 *    side to err on. Recovery: wait 15 min, or restart the ECS task
 *    (docs/ops/LAUNCH-RUNBOOK.md, "Locked out of /admin").
 *
 * In-process state: the app runs as ONE Fargate task (desired_count = 1),
 * so this is authoritative for the whole deployment. A deploy/restart
 * clears it. If desired_count is ever raised, move this to the database.
 */

const WINDOW_MS = 15 * 60_000;
const LOCK_MS = 15 * 60_000;
const PER_IP_MAX = 5;
const GLOBAL_MAX = 30;

interface Bucket {
  failures: number[];
  lockedUntil: number;
}

const perIp = new Map<string, Bucket>();
const global: Bucket = { failures: [], lockedUntil: 0 };

function prune(bucket: Bucket, now: number) {
  bucket.failures = bucket.failures.filter((t) => now - t < WINDOW_MS);
}

/** Milliseconds until `ip` may try again (0 = allowed now). */
export function loginRetryAfterMs(ip: string, now: number = Date.now()): number {
  const ipBucket = perIp.get(ip);
  return Math.max(0, global.lockedUntil - now, (ipBucket?.lockedUntil ?? 0) - now);
}

export function recordLoginFailure(ip: string, now: number = Date.now()): void {
  const ipBucket = perIp.get(ip) ?? { failures: [], lockedUntil: 0 };
  prune(ipBucket, now);
  ipBucket.failures.push(now);
  if (ipBucket.failures.length >= PER_IP_MAX) ipBucket.lockedUntil = now + LOCK_MS;
  perIp.set(ip, ipBucket);

  prune(global, now);
  global.failures.push(now);
  if (global.failures.length >= GLOBAL_MAX) {
    global.lockedUntil = now + LOCK_MS;
    console.warn("[admin] global login lockout engaged after repeated failures");
  }

  // Bound memory under a spray of distinct IPs.
  if (perIp.size > 10_000) {
    for (const [key, bucket] of perIp) {
      prune(bucket, now);
      if (bucket.failures.length === 0 && bucket.lockedUntil < now) perIp.delete(key);
    }
  }
}

export function recordLoginSuccess(ip: string): void {
  perIp.delete(ip);
}

/** Test hook. */
export function resetLoginRateLimits(): void {
  perIp.clear();
  global.failures = [];
  global.lockedUntil = 0;
}

/** Client IP for rate limiting. Behind the ALB, X-Forwarded-For is
 * "<whatever the client sent>, <client ip as seen by the ALB>", so only the
 * LAST entry is trustworthy -- taking the first would let an attacker pick
 * a fresh "IP" per request. */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return headers.get("x-real-ip") ?? "unknown";
}
