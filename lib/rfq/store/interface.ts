import type { RfqFileRecord, RfqSubmissionInput, RfqSubmissionRecord } from "@/lib/rfq/types";

export interface CreateRfqInput {
  referenceId: string;
  fields: Omit<RfqSubmissionInput, "honeypot">;
  files: Array<{ fileName: string; contentType: string; sizeBytes: number; buffer: Buffer }>;
}

/**
 * Storage contract for RFQ intake. Two implementations:
 *  - LocalRfqStore (lib/rfq/store/local.ts): disk-backed, for local dev and
 *    tests/CI. Genuinely writes and reads records -- never fakes success --
 *    but is NOT durable on a stateless serverless runtime in production.
 *  - SupabaseRfqStore (lib/rfq/store/supabase.ts): Postgres + private
 *    Storage bucket, for production once a Supabase project exists.
 *
 * Selected by lib/rfq/store/index.ts based on RFQ_BACKEND / available env
 * vars (see lib/rfq/config.ts). The API route (app/api/rfq/route.ts) only
 * ever talks to this interface, so adding a third backend never touches
 * route/validation code.
 *
 * Access-control invariant every implementation MUST uphold: uploaded
 * files are written to a location that is never served by the public
 * static/CDN path and never publicly listable -- see each implementation's
 * own comment for how it enforces this.
 */
export interface RfqStore {
  createSubmission(input: CreateRfqInput): Promise<RfqSubmissionRecord>;
  getSubmissionByReferenceId(referenceId: string): Promise<RfqSubmissionRecord | null>;
  /** Returns a short-lived, authenticated download reference for one file
   * -- never a public URL. Used only by an internal/reviewer surface, not
   * exposed on the public site. */
  getFileDownloadRef(file: RfqFileRecord): Promise<{ kind: "local-path" | "signed-url"; value: string }>;
}
