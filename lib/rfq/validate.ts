import { RFQ_ALLOWED_EXTENSIONS, rfqMaxFileMb, rfqMaxFiles, rfqMaxTotalMb } from "@/lib/rfq/config";
import type { RfqValidationError } from "@/lib/rfq/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IncomingFile {
  name: string;
  size: number;
  type: string;
}

export interface RfqFormFields {
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
  honeypot: string;
  sourcePagePath: string;
}

export function fileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
}

export function validateFiles(files: IncomingFile[]): RfqValidationError[] {
  const errors: RfqValidationError[] = [];
  if (files.length === 0) {
    // Files are strongly encouraged but not strictly required -- a
    // customer may need to describe an unsolved requirement before CAD
    // exists (see /how-it-works). The context field is required instead
    // in that case (checked in validateFields).
    return errors;
  }
  if (files.length > rfqMaxFiles()) {
    errors.push({ field: "files", message: `Too many files (max ${rfqMaxFiles()}).` });
  }
  const maxFileBytes = rfqMaxFileMb() * 1024 * 1024;
  const maxTotalBytes = rfqMaxTotalMb() * 1024 * 1024;
  let total = 0;
  for (const file of files) {
    total += file.size;
    const ext = fileExtension(file.name);
    if (!RFQ_ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push({ field: "files", message: `"${file.name}" has an unsupported file type (${ext || "no extension"}).` });
    }
    if (file.size > maxFileBytes) {
      errors.push({ field: "files", message: `"${file.name}" exceeds the ${rfqMaxFileMb()}MB per-file limit.` });
    }
    if (file.size === 0) {
      errors.push({ field: "files", message: `"${file.name}" is empty.` });
    }
  }
  if (total > maxTotalBytes) {
    errors.push({ field: "files", message: `Total upload exceeds the ${rfqMaxTotalMb()}MB limit.` });
  }
  return errors;
}

export function validateFields(fields: RfqFormFields, files: IncomingFile[]): RfqValidationError[] {
  const errors: RfqValidationError[] = [];

  if (!fields.contactEmail || !EMAIL_RE.test(fields.contactEmail)) {
    errors.push({ field: "contactEmail", message: "A valid work email is required." });
  }
  if (fields.contactEmail.length > 320) {
    errors.push({ field: "contactEmail", message: "Email is too long." });
  }
  if (!fields.partName.trim() && !fields.context.trim()) {
    errors.push({ field: "partName", message: "Describe what you're making, or upload a file." });
  }
  if (files.length === 0 && !fields.context.trim() && !fields.requirements.trim()) {
    errors.push({ field: "context", message: "Add files, or describe the requirement so we have something to review." });
  }
  if (fields.quantity && (!/^\d+$/.test(fields.quantity) || Number(fields.quantity) <= 0)) {
    errors.push({ field: "quantity", message: "Quantity must be a positive whole number." });
  }
  if (fields.contactCompany.length > 200) {
    errors.push({ field: "contactCompany", message: "Company name is too long." });
  }

  // Basic string sanitization / length caps for free-text fields, so a
  // single oversized field can't be used to abuse storage.
  const longFields: Array<[keyof RfqFormFields, number]> = [
    ["context", 4000],
    ["partFunction", 4000],
    ["requirements", 4000],
    ["contactNote", 2000],
  ];
  for (const [field, max] of longFields) {
    if ((fields[field] as string).length > max) {
      errors.push({ field, message: `This field is too long (max ${max} characters).` });
    }
  }

  errors.push(...validateFiles(files));
  return errors;
}

/** Strips control characters and collapses the kind of long whitespace
 * runs that come from pasted, disguised content, without altering normal
 * punctuation or newlines a customer actually typed. */
export function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

export interface SpamCheckResult {
  flagged: boolean;
  reasons: string[];
}

const SPAM_LINK_RE = /https?:\/\/\S+/gi;

export function checkSpam(fields: RfqFormFields): SpamCheckResult {
  const reasons: string[] = [];
  if (fields.honeypot.trim().length > 0) {
    reasons.push("honeypot field filled");
  }
  const linkCount = (fields.context + fields.requirements + fields.contactNote).match(SPAM_LINK_RE)?.length ?? 0;
  if (linkCount >= 3) {
    reasons.push("excessive links in free-text fields");
  }
  if (/\b(viagra|casino|crypto airdrop|forex signals)\b/i.test(fields.context + fields.requirements)) {
    reasons.push("known spam keyword match");
  }
  return { flagged: reasons.length > 0, reasons };
}

// Best-effort, in-memory per-IP rate limit. This resets on every cold
// start / deploy and is NOT a durable rate limiter across a serverless
// fleet -- it catches obvious rapid-fire abuse from a single warm
// instance, nothing more. A production hardening pass should move this to
// Supabase (a rate-limit table) or an edge-level solution (e.g. Vercel
// Firewall / Upstash) rather than in-process memory.
const submissionsByIp = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionsByIp.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}
