// Private RFQ intake object model. Distinct from the public content layer
// (lib/content/types.ts) and from the internal ops object model
// (lib/types.ts's Rfq/PartInstance/CadPackage, which model an RFQ once an
// ops reviewer has normalized it into the execution pipeline). This module
// is the *intake* record: exactly what a customer submitted, before any
// human review, normalization, or supplier routing has happened.

/** Owner review workflow (see /admin and docs/ops/weekly-operating-rhythm.md):
 *   new -> reviewing -> quoted -> won | lost | archived
 * Any status may move to `archived` (e.g. spam or out of scope), and the
 * owner may move a record back (e.g. archived -> reviewing) -- every change
 * is recorded in the status history, so nothing is silently overwritten.
 * Migration 0002 (infra/sql/0002_admin_workflow_rds.sql,
 * supabase/migrations/0002_admin_workflow.sql) renamed the original intake
 * statuses: received -> new, under_review -> reviewing. */
export const RFQ_STATUSES = ["new", "reviewing", "quoted", "won", "lost", "archived"] as const;
export type RfqStatus = (typeof RFQ_STATUSES)[number];

/** Statuses that still need the owner's attention (the inbox's default
 * "open" filter). */
export const RFQ_OPEN_STATUSES: readonly RfqStatus[] = ["new", "reviewing", "quoted"];

export const RFQ_STATUS_LABELS: Record<RfqStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  archived: "Archived",
};

/** `spam_flagged` is kept for schema compatibility only -- spam-flagged
 * submissions are currently never persisted (see app/api/rfq/route.ts). */
export type RfqSubmissionStatus = RfqStatus | "spam_flagged";

export function isRfqStatus(value: unknown): value is RfqStatus {
  return typeof value === "string" && (RFQ_STATUSES as readonly string[]).includes(value);
}

export function emptyRfqStatusCounts(): Record<RfqSubmissionStatus, number> {
  const counts = { spam_flagged: 0 } as Record<RfqSubmissionStatus, number>;
  for (const s of RFQ_STATUSES) counts[s] = 0;
  return counts;
}

/** Maps pre-0002 status values (still possible in old local .data records)
 * onto the current workflow. */
export function normalizeRfqStatus(value: string): RfqSubmissionStatus {
  if (value === "received") return "new";
  if (value === "under_review") return "reviewing";
  if (value === "spam_flagged" || isRfqStatus(value)) return value;
  return "new";
}

export interface RfqFileRecord {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  /** Opaque storage key/path understood only by the RfqStore implementation
   * that wrote it (local disk path or Supabase Storage object path). Never
   * a public URL — see lib/rfq/store/interface.ts. */
  storageKey: string;
}

export interface RfqSubmissionInput {
  partName: string;
  context: string;
  revision: string;
  quantity: string;
  targetDate: string;
  partFunction: string;
  material: string;
  finish: string;
  requirements: string;
  contactEmail: string;
  contactCompany: string;
  contactNote: string;
  /** Honeypot field name customers never see or fill; a non-empty value
   * here is treated as a strong spam signal. Not persisted. */
  honeypot: string;
  sourcePagePath: string;
}

export interface RfqSubmissionRecord {
  id: string;
  referenceId: string;
  status: RfqSubmissionStatus;
  partName: string;
  context: string;
  revision: string;
  quantity: string;
  targetDate: string;
  partFunction: string;
  material: string;
  finish: string;
  requirements: string;
  contactEmail: string;
  contactCompany: string;
  contactNote: string;
  sourcePagePath: string;
  files: RfqFileRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface RfqValidationError {
  field: string;
  message: string;
}

/** Internal owner note on an RFQ. Append-only: notes are never edited or
 * deleted from the admin UI, so the record of what was decided and when
 * stays intact. */
export interface RfqNote {
  id: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface RfqStatusChange {
  id: string;
  fromStatus: RfqSubmissionStatus | null;
  toStatus: RfqSubmissionStatus;
  changedBy: string;
  changedAt: string;
}

export interface RfqSubmissionDetail extends RfqSubmissionRecord {
  statusChangedAt: string;
  notes: RfqNote[];
  statusHistory: RfqStatusChange[];
}

/** Row shape for the admin inbox list. */
export interface RfqSubmissionSummary {
  id: string;
  referenceId: string;
  status: RfqSubmissionStatus;
  partName: string;
  quantity: string;
  contactEmail: string;
  contactCompany: string;
  fileCount: number;
  noteCount: number;
  createdAt: string;
  statusChangedAt: string;
}

export interface RfqListQuery {
  /** Undefined = every status. */
  statuses?: readonly RfqStatus[];
  limit?: number;
}
