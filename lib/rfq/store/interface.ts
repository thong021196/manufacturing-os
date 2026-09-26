import type {
  RfqFileRecord,
  RfqListQuery,
  RfqNote,
  RfqStatus,
  RfqSubmissionDetail,
  RfqSubmissionInput,
  RfqSubmissionRecord,
  RfqSubmissionStatus,
  RfqSubmissionSummary,
} from "@/lib/rfq/types";

export interface CreateRfqInput {
  referenceId: string;
  fields: Omit<RfqSubmissionInput, "honeypot">;
  files: Array<{ fileName: string; contentType: string; sizeBytes: number; buffer: Buffer }>;
}

/**
 * Storage contract for RFQ intake. Three implementations:
 *  - LocalRfqStore (lib/rfq/store/local.ts): disk-backed, for local dev and
 *    tests/CI. Genuinely writes and reads records -- never fakes success --
 *    but is NOT durable on a stateless serverless runtime in production.
 *  - AwsRfqStore (lib/rfq/store/aws.ts): RDS Postgres + a private S3
 *    bucket, the recommended production backend (see DEPLOYMENT.md /
 *    infra/terraform/) as of the AWS-first pivot in PR #26 review comment
 *    5750338323.
 *  - SupabaseRfqStore (lib/rfq/store/supabase.ts): Postgres + private
 *    Storage bucket -- kept working as an alternative/legacy backend, not
 *    the primary production target.
 *
 * Selected by lib/rfq/store/index.ts based on RFQ_BACKEND / available env
 * vars (see lib/rfq/config.ts). The API route (app/api/rfq/route.ts) only
 * ever talks to this interface, so adding another backend never touches
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
   * -- never a public URL. Used only by the authenticated owner admin
   * (app/api/admin/rfqs/[id]/files/[fileId]/route.ts), never exposed on
   * the public site. `signed-url` references expire after
   * RFQ_DOWNLOAD_URL_TTL_SECONDS (default 300) and force a download
   * (Content-Disposition: attachment); `local-path` references are
   * streamed by that route after its own session check. */
  getFileDownloadRef(
    file: RfqFileRecord,
    options?: { downloadName?: string },
  ): Promise<{ kind: "local-path" | "signed-url"; value: string }>;

  // --- Owner admin (/admin) -----------------------------------------
  // Every caller of the methods below MUST have verified an admin session
  // first (lib/admin/auth.ts requireAdmin / requireAdminForRoute). The
  // store itself has no notion of users -- it trusts its caller.

  /** Newest first. */
  listSubmissions(query: RfqListQuery): Promise<RfqSubmissionSummary[]>;
  countByStatus(): Promise<Record<RfqSubmissionStatus, number>>;
  /** Full record + append-only notes + status history, by internal id. */
  getSubmissionDetail(id: string): Promise<RfqSubmissionDetail | null>;
  /** Moves the submission to `status`, recording a status-history row.
   * No-op (returns the unchanged record) when the status is already set.
   * Returns null when the submission doesn't exist. */
  updateStatus(id: string, status: RfqStatus, changedBy: string): Promise<RfqSubmissionDetail | null>;
  /** Appends an internal note. Returns null when the submission doesn't
   * exist. */
  addNote(id: string, body: string, author: string): Promise<RfqNote | null>;
  /** Cheap reachability probe for the admin dashboard's health line. */
  healthCheck(): Promise<{ ok: boolean; detail: string }>;
}
