// RFQ intake configuration, all driven by env vars (see .env.example).
// Centralized here so validation, the API route, and both store
// implementations agree on the same limits.

export const RFQ_ALLOWED_EXTENSIONS = [
  ".step",
  ".stp",
  ".iges",
  ".igs",
  ".x_t",
  ".x_b",
  ".pdf",
  ".zip",
  ".xlsx",
  ".xls",
  ".csv",
];

export const RFQ_ALLOWED_CONTENT_TYPES = [
  "application/octet-stream", // STEP/IGES/X_T have no standard MIME type
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
];

export function rfqMaxFileMb(): number {
  const raw = Number(process.env.RFQ_MAX_FILE_MB);
  return Number.isFinite(raw) && raw > 0 ? raw : 100;
}

export function rfqMaxFiles(): number {
  const raw = Number(process.env.RFQ_MAX_FILES);
  return Number.isFinite(raw) && raw > 0 ? raw : 10;
}

export function rfqMaxTotalMb(): number {
  const raw = Number(process.env.RFQ_MAX_TOTAL_MB);
  return Number.isFinite(raw) && raw > 0 ? raw : 300;
}

/** Which RfqStore backend to use.
 *  - "aws" (recommended production target, see DEPLOYMENT.md): requires
 *    DATABASE_URL (RDS Postgres) + AWS_S3_RFQ_BUCKET.
 *  - "supabase" (legacy/alternative path, kept working): requires
 *    SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *  - "local" (dev/test fallback -- see lib/rfq/store/local.ts): disk-backed,
 *    used whenever RFQ_BACKEND is unset and no aws/supabase env vars are
 *    present, so the RFQ flow is always genuinely testable end-to-end even
 *    without a live external database.
 * Explicit RFQ_BACKEND always wins; otherwise this auto-detects from
 * whichever backend's required env vars are present, preferring aws. */
export function rfqBackend(): "aws" | "supabase" | "local" {
  const explicit = process.env.RFQ_BACKEND?.toLowerCase();
  if (explicit === "aws" || explicit === "supabase" || explicit === "local") return explicit;
  const hasAws = Boolean(process.env.DATABASE_URL && process.env.AWS_S3_RFQ_BUCKET);
  if (hasAws) return "aws";
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return hasSupabase ? "supabase" : "local";
}

export function rfqLocalStorageDir(): string {
  return process.env.RFQ_LOCAL_STORAGE_DIR || ".data/rfq";
}

/** Lifetime of a presigned S3 / Supabase Storage download URL issued to the
 * owner admin. Short on purpose: the URL is a bearer token for a customer
 * CAD file. Clamped to 60..900 seconds. */
export function rfqDownloadUrlTtlSeconds(): number {
  const raw = Number(process.env.RFQ_DOWNLOAD_URL_TTL_SECONDS);
  if (!Number.isFinite(raw) || raw <= 0) return 300;
  return Math.min(900, Math.max(60, Math.floor(raw)));
}
