import { randomBytes } from "node:crypto";

/** Human-facing reference id, e.g. "RFQ-20260920-4F2A9C". Not a security
 * token -- the internal id (uuid) is what access control keys off. */
export function generateReferenceId(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `RFQ-${y}${m}${d}-${suffix}`;
}
