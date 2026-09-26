/**
 * Process-wide singletons.
 *
 * In the Next.js standalone server every route is its own server bundle, so
 * a plain module-level `let x` exists ONCE PER ROUTE, not once per process.
 * State that must be shared by the whole server -- the login rate limiter
 * and TOTP replay guard (security), the Postgres pool (connection count),
 * the content-override cache (an admin Pause must invalidate it for every
 * public route) -- lives on globalThis under a namespaced key instead.
 * Found by the PR #26 smoke test: a paused page stayed in the sitemap
 * because the sitemap route's copy of the cache was never cleared.
 */
export function processState<T>(key: string, init: () => T): T {
  const g = globalThis as typeof globalThis & { __manufacturingOs?: Record<string, unknown> };
  const store = (g.__manufacturingOs ??= {});
  if (!(key in store)) store[key] = init();
  return store[key] as T;
}
