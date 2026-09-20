import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RfqFileRecord, RfqSubmissionRecord } from "@/lib/rfq/types";
import type { CreateRfqInput, RfqStore } from "@/lib/rfq/store/interface";

const SUBMISSIONS_TABLE = "rfq_submissions";
const FILES_TABLE = "rfq_files";
const BUCKET = "rfq-files";

/**
 * Supabase-backed RFQ store: Postgres for submission/file metadata, a
 * PRIVATE Storage bucket for the actual files.
 *
 * Access control: the `rfq-files` bucket is created as `public: false` by
 * supabase/migrations/0001_init.sql, and this class only ever uses the
 * SERVICE ROLE key (server-only -- see .env.example: SUPABASE_SERVICE_ROLE_KEY
 * is never prefixed NEXT_PUBLIC_ and is only read inside this server-only
 * module / the API route that constructs it). RLS policies in the same
 * migration deny all anon/authenticated SELECT on both tables and deny all
 * public access to the bucket's objects -- only the service role (used
 * exclusively by this server-side store) can read or write. Customer files
 * are therefore never publicly indexed or downloadable.
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
      status: "received",
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
      status: "received",
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
    const { data: submission, error } = await this.client
      .from(SUBMISSIONS_TABLE)
      .select("*")
      .eq("reference_id", referenceId)
      .maybeSingle();
    if (error || !submission) return null;

    const { data: files } = await this.client.from(FILES_TABLE).select("*").eq("rfq_submission_id", submission.id);

    return {
      id: submission.id,
      referenceId: submission.reference_id,
      status: submission.status,
      partName: submission.part_name,
      context: submission.context,
      revision: submission.revision,
      quantity: submission.quantity,
      targetDate: submission.target_date ?? "",
      partFunction: submission.part_function,
      material: submission.material,
      finish: submission.finish,
      requirements: submission.requirements,
      contactEmail: submission.contact_email,
      contactCompany: submission.contact_company,
      contactNote: submission.contact_note,
      sourcePagePath: submission.source_page_path,
      files: (files ?? []).map((f) => ({
        id: f.id,
        fileName: f.file_name,
        contentType: f.content_type,
        sizeBytes: f.size_bytes,
        storageKey: f.storage_path,
      })),
      createdAt: submission.created_at,
      updatedAt: submission.updated_at,
    };
  }

  async getFileDownloadRef(file: RfqFileRecord) {
    const { data, error } = await this.client.storage.from(BUCKET).createSignedUrl(file.storageKey, 300);
    if (error || !data) throw new Error(`Failed to sign download URL: ${error?.message}`);
    return { kind: "signed-url" as const, value: data.signedUrl };
  }
}
