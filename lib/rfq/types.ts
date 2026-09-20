// Private RFQ intake object model. Distinct from the public content layer
// (lib/content/types.ts) and from the internal ops object model
// (lib/types.ts's Rfq/PartInstance/CadPackage, which model an RFQ once an
// ops reviewer has normalized it into the execution pipeline). This module
// is the *intake* record: exactly what a customer submitted, before any
// human review, normalization, or supplier routing has happened.

export type RfqSubmissionStatus = "received" | "under_review" | "spam_flagged";

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
