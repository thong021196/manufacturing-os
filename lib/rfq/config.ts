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

/** Which RfqStore backend to use. "supabase" requires SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY; falls back to "local" (disk-backed, dev/test
 * only -- see lib/rfq/store/local.ts) when unset or when Supabase env vars
 * are missing, so the RFQ flow is always genuinely testable end-to-end
 * even without a live external database. */
export function rfqBackend(): "supabase" | "local" {
  const explicit = process.env.RFQ_BACKEND?.toLowerCase();
  if (explicit === "supabase" || explicit === "local") return explicit;
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return hasSupabase ? "supabase" : "local";
}

export function rfqLocalStorageDir(): string {
  return process.env.RFQ_LOCAL_STORAGE_DIR || ".data/rfq";
}
