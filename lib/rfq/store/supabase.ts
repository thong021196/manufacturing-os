import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { rfqDownloadUrlTtlSeconds } from "@/lib/rfq/config";
import {
  emptyRfqStatusCounts,
  normalizeRfqStatus,
  type RfqFileRecord,
  type RfqListQuery,
  type RfqNote,
  type RfqStatus,
  type RfqSubmissionDetail,
  type RfqSubmissionRecord,
  type RfqSubmissionStatus,
  type RfqSubmissionSummary,
} from "@/lib/rfq/types";
import type { CreateRfqInput, RfqStore } from "@/lib/rfq/store/interface";

const SUBMISSIONS_TABLE = "rfq_submissions";
const FILES_TABLE = "rfq_files";
const NOTES_TABLE = "rfq_notes";
const HISTORY_TABLE = "rfq_status_history";
const BUCKET = "rfq-files";

type Row = Record<string, unknown>;

/**
 * Supabase-backed RFQ store (legacy/alternative backend): Postgres for
 * submission/file metadata, notes and status history, a PRIVATE Storage
 * bucket for the actual files.
 *
 * Access control: the `rfq-files` bucket is created as `public: false` by
 * supabase/migrations/0001_rfq_intake.sql, and this class only ever uses the
 * SERVICE ROLE key (server-only -- never prefixed NEXT_PUBLIC_). RLS is
 * enabled with zero anon/authenticated policies on every table, including
 * the 0002 admin tables, so only this server-side store can read or write.
 * Customer files are never publicly indexed or downloadable; the admin gets
 * a short-lived signed URL (getFileDownloadRef) after its session check.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).
 */
export class SupabaseRfqStore implements RfqStore {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "SupabaseRfqStore requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Set RFQ_BACKEND=local to use the dev/test fallback instead.",
      );
    }
    this.client = createClient(url, key, { auth: { persistSession: false } });
  }

  async createSubmission(input: CreateRfqInput): Promise<RfqSubmissionRecord> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const { error: insertError } = await this.client.from(SUBMISSIONS_TABLE).insert({
      id,
      reference_id: input.referenceId,
      status: "new",
      part_name: input.fields.partName,
      context: input.fields.context,
      revision: input.fields.revision,
      quantity: input.fields.quantity,
      target_date: input.fields.targetDate || null,
      part_function: input.fields.partFunction,
      material: input.fields.material,
      finish: input.fields.finish,
      requirements: input.fields.requirements,
      contact_email: input.fields.contactEmail,
      contact_company: input.fields.contactCompany,
      contact_note: input.fields.contactNote,
      source_page_path: input.fields.sourcePagePath,
      created_at: now,
      updated_at: now,
      status_changed_at: now,
    });
    if (insertError) throw new Error(`Failed to persist RFQ submission: ${insertError.message}`);

    const fileRecords: RfqFileRecord[] = [];
    for (const file of input.files) {
      const fileId = randomUUID();
      const safeName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);
      const storagePath = `${input.referenceId}/${fileId}-${safeName}`;

      const { error: uploadError } = await this.client.storage
        .from(BUCKET)
        .upload(storagePath, file.buffer, { contentType: file.contentType, upsert: false });
      if (uploadError) throw new Error(`Failed to upload "${file.fileName}": ${uploadError.message}`);

      const { error: fileInsertError } = await this.client.from(FILES_TABLE).insert({
        id: fileId,
        rfq_submission_id: id,
        file_name: file.fileName,
        content_type: file.contentType,
        size_bytes: file.sizeBytes,
        storage_path: storagePath,
        created_at: now,
      });
      if (fileInsertError) throw new Error(`Failed to record file metadata for "${file.fileName}": ${fileInsertError.message}`);

      fileRecords.push({ id: fileId, fileName: file.fileName, contentType: file.contentType, sizeBytes: file.sizeBytes, storageKey: storagePath });
    }

    return {
      id,
      referenceId: input.referenceId,
      status: "new",
      partName: input.fields.partName,
      context: input.fields.context,
      revision: input.fields.revision,
      quantity: input.fields.quantity,
      targetDate: input.fields.targetDate,
      partFunction: input.fields.partFunction,
      material: input.fields.material,
      finish: input.fields.finish,
      requirements: input.fields.requirements,
      contactEmail: input.fields.contactEmail,
      contactCompany: input.fields.contactCompany,
      contactNote: input.fields.contactNote,
      sourcePagePath: input.fields.sourcePagePath,
      files: fileRecords,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getSubmissionByReferenceId(referenceId: string): Promise<RfqSubmissionRecord | null> {
    const { data, error } = await this.client.from(SUBMISSIONS_TABLE).select("*").eq("reference_id", referenceId).maybeSingle();
    if (error || !data) return null;
    return this.loadDetail(data as Row);
  }

  async getFileDownloadRef(file: RfqFileRecord, options?: { downloadName?: string }) {
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(file.storageKey, rfqDownloadUrlTtlSeconds(), { download: options?.downloadName ?? file.fileName });
    if (error || !data) throw new Error(`Failed to sign download URL: ${error?.message}`);
    return { kind: "signed-url" as const, value: data.signedUrl };
  }

  async listSubmissions(query: RfqListQuery): Promise<RfqSubmissionSummary[]> {
    let q = this.client
      .from(SUBMISSIONS_TABLE)
      .select(
        `id, reference_id, status, part_name, quantity, contact_email, contact_company, created_at, status_changed_at,
         ${FILES_TABLE}(count), ${NOTES_TABLE}(count)`,
      )
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(query.limit ?? 200, 1), 500));
    if (query.statuses) q = q.in("status", [...query.statuses]);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list RFQs: ${error.message}`);
    return ((data ?? []) as Row[]).map((r) => ({
      id: String(r.id),
      referenceId: String(r.reference_id),
      status: normalizeRfqStatus(String(r.status)),
      partName: String(r.part_name ?? ""),
      quantity: String(r.quantity ?? ""),
      contactEmail: String(r.contact_email ?? ""),
      contactCompany: String(r.contact_company ?? ""),
      fileCount: embeddedCount(r[FILES_TABLE]),
      noteCount: embeddedCount(r[NOTES_TABLE]),
      createdAt: String(r.created_at),
      statusChangedAt: String(r.status_changed_at ?? r.created_at),
    }));
  }

  async countByStatus(): Promise<Record<RfqSubmissionStatus, number>> {
    // Low-volume table (MVP): one small select beats N head-count queries.
    const { data, error } = await this.client.from(SUBMISSIONS_TABLE).select("status");
    if (error) throw new Error(`Failed to count RFQs: ${error.message}`);
    const counts = emptyRfqStatusCounts();
    for (const r of (data ?? []) as Row[]) {
      const status = normalizeRfqStatus(String(r.status));
      counts[status] = (counts[status] ?? 0) + 1;
    }
    return counts;
  }

  async getSubmissionDetail(id: string): Promise<RfqSubmissionDetail | null> {
    const { data, error } = await this.client.from(SUBMISSIONS_TABLE).select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return this.loadDetail(data as Row);
  }

  async updateStatus(id: string, status: RfqStatus, changedBy: string): Promise<RfqSubmissionDetail | null> {
    const current = await this.getSubmissionDetail(id);
    if (!current) return null;
    if (current.status === status) return current;
    // PostgREST has no multi-statement transaction; the conditional update
    // (`.eq("status", current.status)`) makes a concurrent change lose
    // cleanly instead of writing a history row that doesn't match reality.
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from(SUBMISSIONS_TABLE)
      .update({ status, status_changed_at: now })
      .eq("id", id)
      .eq("status", current.status)
      .select("id");
    if (error) throw new Error(`Failed to update RFQ status: ${error.message}`);
    if (data && data.length > 0) {
      const { error: historyError } = await this.client.from(HISTORY_TABLE).insert({
        id: randomUUID(),
        rfq_submission_id: id,
        from_status: current.status,
        to_status: status,
        changed_by: changedBy,
        changed_at: now,
      });
      if (historyError) throw new Error(`Failed to record RFQ status history: ${historyError.message}`);
    }
    return this.getSubmissionDetail(id);
  }

  async addNote(id: string, body: string, author: string): Promise<RfqNote | null> {
    const current = await this.getSubmissionDetail(id);
    if (!current) return null;
    const { data, error } = await this.client
      .from(NOTES_TABLE)
      .insert({ id: randomUUID(), rfq_submission_id: id, body, author })
      .select("id, body, author, created_at")
      .single();
    if (error || !data) throw new Error(`Failed to add note: ${error?.message}`);
    const r = data as Row;
    return { id: String(r.id), body: String(r.body), author: String(r.author), createdAt: String(r.created_at) };
  }

  async healthCheck() {
    const { error } = await this.client.from(SUBMISSIONS_TABLE).select("id", { head: true, count: "exact" }).limit(1);
    return error ? { ok: false, detail: `Supabase query failed: ${error.message}` } : { ok: true, detail: "Supabase reachable" };
  }

  private async loadDetail(s: Row): Promise<RfqSubmissionDetail> {
    const id = String(s.id);
    const [files, notes, history] = await Promise.all([
      this.client.from(FILES_TABLE).select("*").eq("rfq_submission_id", id).order("created_at"),
      this.client.from(NOTES_TABLE).select("id, body, author, created_at").eq("rfq_submission_id", id).order("created_at"),
      this.client
        .from(HISTORY_TABLE)
        .select("id, from_status, to_status, changed_by, changed_at")
        .eq("rfq_submission_id", id)
        .order("changed_at"),
    ]);
    return {
      id,
      referenceId: String(s.reference_id),
      status: normalizeRfqStatus(String(s.status)),
      partName: String(s.part_name ?? ""),
      context: String(s.context ?? ""),
      revision: String(s.revision ?? ""),
      quantity: String(s.quantity ?? ""),
      targetDate: s.target_date ? String(s.target_date) : "",
      partFunction: String(s.part_function ?? ""),
      material: String(s.material ?? ""),
      finish: String(s.finish ?? ""),
      requirements: String(s.requirements ?? ""),
      contactEmail: String(s.contact_email ?? ""),
      contactCompany: String(s.contact_company ?? ""),
      contactNote: String(s.contact_note ?? ""),
      sourcePagePath: String(s.source_page_path ?? ""),
      files: ((files.data ?? []) as Row[]).map((f) => ({
        id: String(f.id),
        fileName: String(f.file_name),
        contentType: String(f.content_type),
        sizeBytes: Number(f.size_bytes),
        storageKey: String(f.storage_path),
      })),
      createdAt: String(s.created_at),
      updatedAt: String(s.updated_at),
      statusChangedAt: String(s.status_changed_at ?? s.updated_at),
      notes: ((notes.data ?? []) as Row[]).map((n) => ({
        id: String(n.id),
        body: String(n.body),
        author: String(n.author),
        createdAt: String(n.created_at),
      })),
      statusHistory: ((history.data ?? []) as Row[]).map((h) => ({
        id: String(h.id),
        fromStatus: h.from_status ? normalizeRfqStatus(String(h.from_status)) : null,
        toStatus: normalizeRfqStatus(String(h.to_status)),
        changedBy: String(h.changed_by),
        changedAt: String(h.changed_at),
      })),
    };
  }
}

function embeddedCount(value: unknown): number {
  if (Array.isArray(value) && value[0] && typeof value[0] === "object" && "count" in value[0]) {
    return Number((value[0] as { count: unknown }).count) || 0;
  }
  return 0;
}
