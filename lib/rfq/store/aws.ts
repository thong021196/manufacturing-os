import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPgPool, toIso } from "@/lib/db/pg";
import { rfqDownloadUrlTtlSeconds } from "@/lib/rfq/config";
import { contentDispositionAttachment } from "@/lib/rfq/download";
import {
  emptyRfqStatusCounts,
  normalizeRfqStatus,
  type RfqFileRecord,
  type RfqListQuery,
  type RfqNote,
  type RfqStatus,
  type RfqStatusChange,
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

// Explicit column list: target_date is rendered as YYYY-MM-DD text in SQL
// so node-pg never turns it into a timezone-shifted JS Date.
const SUBMISSION_COLUMNS = `id, reference_id, status, part_name, context, revision, quantity,
  to_char(target_date, 'YYYY-MM-DD') as target_date, part_function, material, finish, requirements,
  contact_email, contact_company, contact_note, source_page_path, created_at, updated_at,
  status_changed_at`;

type Row = Record<string, unknown>;

/**
 * AWS-backed RFQ store: RDS Postgres for submission/file metadata, owner
 * notes and status history, and a PRIVATE S3 bucket for the actual files.
 * This is the recommended production backend (see infra/terraform/ and
 * docs/ops/LAUNCH-RUNBOOK.md).
 *
 * Access control:
 *  - Database: connects as the least-privilege `manufacturing_os_app` role
 *    (created by scripts/migrate.mjs; grants in infra/sql/0001 + 0002) over
 *    a connection string that only resolves inside the manufacturing-os
 *    VPC's private subnets -- there is no public route to this database.
 *  - Files: the S3 bucket has Block Public Access enabled on all four
 *    settings, ACLs disabled, SSE on. The only way to read a file back is
 *    a short-lived presigned GET URL this class issues from
 *    getFileDownloadRef, which is only ever called by the session-checked
 *    admin download route.
 *
 * Requires AWS_REGION, DATABASE_URL and AWS_S3_RFQ_BUCKET. Credentials come
 * from the ECS task role via the default provider chain -- nothing here
 * hardcodes a key/secret.
 */
export class AwsRfqStore implements RfqStore {
  private pool: Pool;
  private s3: S3Client;
  private bucket: string;

  constructor() {
    const bucket = process.env.AWS_S3_RFQ_BUCKET;
    if (!bucket) {
      throw new Error("AwsRfqStore requires AWS_S3_RFQ_BUCKET. Set RFQ_BACKEND=local to use the dev/test fallback instead.");
    }
    this.bucket = bucket;
    this.pool = getPgPool();
    this.s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
  }

  async createSubmission(input: CreateRfqInput): Promise<RfqSubmissionRecord> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const client = await this.pool.connect();

    try {
      await client.query("begin");

      await client.query(
        `insert into ${SUBMISSIONS_TABLE}
          (id, reference_id, status, part_name, context, revision, quantity, target_date,
           part_function, material, finish, requirements, contact_email, contact_company,
           contact_note, source_page_path, created_at, updated_at, status_changed_at)
         values ($1,$2,'new',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$16,$16)`,
        [
          id,
          input.referenceId,
          input.fields.partName,
          input.fields.context,
          input.fields.revision,
          input.fields.quantity,
          input.fields.targetDate || null,
          input.fields.partFunction,
          input.fields.material,
          input.fields.finish,
          input.fields.requirements,
          input.fields.contactEmail,
          input.fields.contactCompany,
          input.fields.contactNote,
          input.fields.sourcePagePath,
          now,
        ],
      );

      const fileRecords: RfqFileRecord[] = [];
      for (const file of input.files) {
        const fileId = randomUUID();
        const safeName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);
        const storageKey = `${input.referenceId}/${fileId}-${safeName}`;

        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: storageKey,
            Body: file.buffer,
            ContentType: file.contentType,
            ServerSideEncryption: "AES256",
            // No ACL: the bucket enforces BucketOwnerEnforced (ACLs
            // disabled) and Block Public Access (infra/terraform/s3.tf).
          }),
        );

        await client.query(
          `insert into ${FILES_TABLE}
            (id, rfq_submission_id, file_name, content_type, size_bytes, storage_path, created_at)
           values ($1,$2,$3,$4,$5,$6,$7)`,
          [fileId, id, file.fileName, file.contentType, file.sizeBytes, storageKey, now],
        );

        fileRecords.push({ id: fileId, fileName: file.fileName, contentType: file.contentType, sizeBytes: file.sizeBytes, storageKey });
      }

      await client.query("commit");

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
    } catch (error) {
      await client.query("rollback");
      throw error instanceof Error ? new Error(`Failed to persist RFQ submission: ${error.message}`) : error;
    } finally {
      client.release();
    }
  }

  async getSubmissionByReferenceId(referenceId: string): Promise<RfqSubmissionRecord | null> {
    const { rows } = await this.pool.query(`select ${SUBMISSION_COLUMNS} from ${SUBMISSIONS_TABLE} where reference_id = $1 limit 1`, [
      referenceId,
    ]);
    return rows[0] ? this.loadDetail(rows[0]) : null;
  }

  async getFileDownloadRef(file: RfqFileRecord, options?: { downloadName?: string }) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: file.storageKey,
      // Force a download (never inline rendering in the admin's origin)
      // and a safe filename.
      ResponseContentDisposition: contentDispositionAttachment(options?.downloadName ?? file.fileName),
      ResponseContentType: "application/octet-stream",
    });
    const value = await getSignedUrl(this.s3, command, { expiresIn: rfqDownloadUrlTtlSeconds() });
    return { kind: "signed-url" as const, value };
  }

  async listSubmissions(query: RfqListQuery): Promise<RfqSubmissionSummary[]> {
    const params: unknown[] = [];
    let where = "";
    if (query.statuses) {
      params.push(query.statuses);
      where = `where s.status = any($${params.length}::text[])`;
    }
    params.push(Math.min(Math.max(query.limit ?? 200, 1), 500));
    const { rows } = await this.pool.query(
      `select s.id, s.reference_id, s.status, s.part_name, s.quantity, s.contact_email, s.contact_company,
              s.created_at, s.status_changed_at,
              (select count(*) from ${FILES_TABLE} f where f.rfq_submission_id = s.id)::int as file_count,
              (select count(*) from ${NOTES_TABLE} n where n.rfq_submission_id = s.id)::int as note_count
         from ${SUBMISSIONS_TABLE} s
         ${where}
        order by s.created_at desc
        limit $${params.length}`,
      params,
    );
    return rows.map((r: Row) => ({
      id: String(r.id),
      referenceId: String(r.reference_id),
      status: normalizeRfqStatus(String(r.status)),
      partName: String(r.part_name ?? ""),
      quantity: String(r.quantity ?? ""),
      contactEmail: String(r.contact_email ?? ""),
      contactCompany: String(r.contact_company ?? ""),
      fileCount: Number(r.file_count),
      noteCount: Number(r.note_count),
      createdAt: toIso(r.created_at),
      statusChangedAt: toIso(r.status_changed_at ?? r.created_at),
    }));
  }

  async countByStatus(): Promise<Record<RfqSubmissionStatus, number>> {
    const { rows } = await this.pool.query(`select status, count(*)::int as n from ${SUBMISSIONS_TABLE} group by status`);
    const counts = emptyRfqStatusCounts();
    for (const r of rows as Row[]) {
      const status = normalizeRfqStatus(String(r.status));
      counts[status] = (counts[status] ?? 0) + Number(r.n);
    }
    return counts;
  }

  async getSubmissionDetail(id: string): Promise<RfqSubmissionDetail | null> {
    if (!isUuid(id)) return null;
    const { rows } = await this.pool.query(`select ${SUBMISSION_COLUMNS} from ${SUBMISSIONS_TABLE} where id = $1`, [id]);
    return rows[0] ? this.loadDetail(rows[0]) : null;
  }

  async updateStatus(id: string, status: RfqStatus, changedBy: string): Promise<RfqSubmissionDetail | null> {
    if (!isUuid(id)) return null;
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const { rows } = await client.query(`select status from ${SUBMISSIONS_TABLE} where id = $1 for update`, [id]);
      if (!rows[0]) {
        await client.query("rollback");
        return null;
      }
      const from = String(rows[0].status);
      if (normalizeRfqStatus(from) !== status) {
        await client.query(
          `update ${SUBMISSIONS_TABLE} set status = $2, status_changed_at = now() where id = $1`,
          [id, status],
        );
        await client.query(
          `insert into ${HISTORY_TABLE} (id, rfq_submission_id, from_status, to_status, changed_by) values ($1,$2,$3,$4,$5)`,
          [randomUUID(), id, from, status, changedBy],
        );
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
    return this.getSubmissionDetail(id);
  }

  async addNote(id: string, body: string, author: string): Promise<RfqNote | null> {
    if (!isUuid(id)) return null;
    const { rows } = await this.pool.query(
      `insert into ${NOTES_TABLE} (id, rfq_submission_id, body, author)
       select $1, s.id, $3, $4 from ${SUBMISSIONS_TABLE} s where s.id = $2
       returning id, body, author, created_at`,
      [randomUUID(), id, body, author],
    );
    const r = rows[0] as Row | undefined;
    return r ? { id: String(r.id), body: String(r.body), author: String(r.author), createdAt: toIso(r.created_at) } : null;
  }

  async healthCheck() {
    try {
      const started = Date.now();
      await this.pool.query("select 1");
      return { ok: true, detail: `RDS reachable (${Date.now() - started} ms), files in s3://${this.bucket}` };
    } catch (error) {
      return { ok: false, detail: `RDS query failed: ${(error as Error).message}` };
    }
  }

  private async loadDetail(s: Row): Promise<RfqSubmissionDetail> {
    const id = String(s.id);
    const [files, notes, history] = await Promise.all([
      this.pool.query(`select * from ${FILES_TABLE} where rfq_submission_id = $1 order by created_at, file_name`, [id]),
      this.pool.query(`select id, body, author, created_at from ${NOTES_TABLE} where rfq_submission_id = $1 order by created_at`, [id]),
      this.pool.query(
        `select id, from_status, to_status, changed_by, changed_at from ${HISTORY_TABLE} where rfq_submission_id = $1 order by changed_at`,
        [id],
      ),
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
      files: files.rows.map((f: Row) => ({
        id: String(f.id),
        fileName: String(f.file_name),
        contentType: String(f.content_type),
        sizeBytes: Number(f.size_bytes),
        storageKey: String(f.storage_path),
      })),
      createdAt: toIso(s.created_at),
      updatedAt: toIso(s.updated_at),
      statusChangedAt: toIso(s.status_changed_at ?? s.updated_at),
      notes: notes.rows.map((n: Row) => ({ id: String(n.id), body: String(n.body), author: String(n.author), createdAt: toIso(n.created_at) })),
      statusHistory: history.rows.map(
        (h: Row): RfqStatusChange => ({
          id: String(h.id),
          fromStatus: h.from_status ? normalizeRfqStatus(String(h.from_status)) : null,
          toStatus: normalizeRfqStatus(String(h.to_status)),
          changedBy: String(h.changed_by),
          changedAt: toIso(h.changed_at),
        }),
      ),
    };
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
