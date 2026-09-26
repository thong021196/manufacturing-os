import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { rfqLocalStorageDir } from "@/lib/rfq/config";
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

/** On-disk shape of record.json. Notes/status history were added with the
 * owner admin (migration 0002 equivalent) and are optional so records
 * written before that still load. */
interface StoredRecord extends RfqSubmissionRecord {
  statusChangedAt?: string;
  notes?: RfqNote[];
  statusHistory?: RfqStatusChange[];
}

/**
 * Disk-backed RFQ store for local development and automated tests.
 *
 * Access control: files are written under `<repo root>/<RFQ_LOCAL_STORAGE_DIR>`
 * (default `.data/rfq`, gitignored), which is OUTSIDE `public/` -- Next.js
 * only ever serves files that live under `public/` or are returned by an
 * explicit route handler, so nothing under `.data/` is reachable by a
 * public URL. The only route that reads these files back is the
 * session-checked admin download route
 * (app/api/admin/rfqs/[id]/files/[fileId]/route.ts), which also refuses any
 * resolved path outside this store's base directory.
 *
 * Durability: this is genuinely written to and read from disk (never a
 * faked success), which makes the RFQ flow truly end-to-end testable
 * without a live external database. It is NOT suitable as the production
 * store on a stateless serverless runtime (Vercel functions do not share
 * or persist a writable filesystem across invocations/deploys), and a long
 * -running Fargate task's filesystem is ephemeral/single-instance too --
 * use AwsRfqStore (recommended) or SupabaseRfqStore (legacy) in
 * production. See .env.example / DEPLOYMENT.md.
 */
export class LocalRfqStore implements RfqStore {
  private baseDir: string;

  constructor(baseDir = rfqLocalStorageDir()) {
    // turbopackIgnore: this is a dev/test-only fallback path, not a
    // dependency the bundler needs to trace/include in server output.
    this.baseDir = path.resolve(/* turbopackIgnore: true */ process.cwd(), baseDir);
    if (process.env.NODE_ENV === "production" && process.env.RFQ_BACKEND !== "local") {
      console.warn(
        "[rfq] LocalRfqStore is active in a production NODE_ENV. This store is a dev/test fallback only " +
          "and is not durable in production. Set RFQ_BACKEND=aws with DATABASE_URL / AWS_S3_RFQ_BUCKET " +
          "(recommended, see DEPLOYMENT.md) or RFQ_BACKEND=supabase with SUPABASE_URL / " +
          "SUPABASE_SERVICE_ROLE_KEY for a real production deployment.",
      );
    }
  }

  /** Absolute base directory. Exposed so the admin download route can
   * verify a resolved file path stays inside it. */
  get storageRoot(): string {
    return this.baseDir;
  }

  private submissionDir(referenceId: string) {
    return path.join(this.baseDir, referenceId);
  }

  async createSubmission(input: CreateRfqInput): Promise<RfqSubmissionRecord> {
    const dir = this.submissionDir(input.referenceId);
    const filesDir = path.join(dir, "files");
    await mkdir(filesDir, { recursive: true });

    const now = new Date().toISOString();
    const fileRecords: RfqFileRecord[] = [];
    for (const file of input.files) {
      const id = randomUUID();
      const safeName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);
      const storedName = `${id}-${safeName}`;
      await writeFile(path.join(filesDir, storedName), file.buffer);
      fileRecords.push({
        id,
        fileName: file.fileName,
        contentType: file.contentType,
        sizeBytes: file.sizeBytes,
        storageKey: path.join(input.referenceId, "files", storedName),
      });
    }

    const record: RfqSubmissionRecord = {
      id: randomUUID(),
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

    await this.writeRecord({ ...record, statusChangedAt: now, notes: [], statusHistory: [] });
    return record;
  }

  async getSubmissionByReferenceId(referenceId: string): Promise<RfqSubmissionRecord | null> {
    const record = await this.readRecord(referenceId);
    return record ? this.toDetail(record) : null;
  }

  async getFileDownloadRef(file: RfqFileRecord) {
    return { kind: "local-path" as const, value: path.join(this.baseDir, file.storageKey) };
  }

  async listSubmissions(query: RfqListQuery): Promise<RfqSubmissionSummary[]> {
    const records = await this.readAll();
    const filtered = query.statuses
      ? records.filter((r) => (query.statuses as readonly string[]).includes(r.status))
      : records;
    return filtered
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, query.limit ?? 200)
      .map((r) => ({
        id: r.id,
        referenceId: r.referenceId,
        status: r.status,
        partName: r.partName,
        quantity: r.quantity,
        contactEmail: r.contactEmail,
        contactCompany: r.contactCompany,
        fileCount: r.files.length,
        noteCount: r.notes.length,
        createdAt: r.createdAt,
        statusChangedAt: r.statusChangedAt,
      }));
  }

  async countByStatus(): Promise<Record<RfqSubmissionStatus, number>> {
    const counts = emptyRfqStatusCounts();
    for (const r of await this.readAll()) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return counts;
  }

  async getSubmissionDetail(id: string): Promise<RfqSubmissionDetail | null> {
    return (await this.readAll()).find((r) => r.id === id) ?? null;
  }

  async updateStatus(id: string, status: RfqStatus, changedBy: string): Promise<RfqSubmissionDetail | null> {
    const current = await this.getSubmissionDetail(id);
    if (!current) return null;
    if (current.status === status) return current;
    const now = new Date().toISOString();
    const next: RfqSubmissionDetail = {
      ...current,
      status,
      updatedAt: now,
      statusChangedAt: now,
      statusHistory: [
        ...current.statusHistory,
        { id: randomUUID(), fromStatus: current.status, toStatus: status, changedBy, changedAt: now },
      ],
    };
    await this.writeRecord(next);
    return next;
  }

  async addNote(id: string, body: string, author: string): Promise<RfqNote | null> {
    const current = await this.getSubmissionDetail(id);
    if (!current) return null;
    const note: RfqNote = { id: randomUUID(), body, author, createdAt: new Date().toISOString() };
    await this.writeRecord({ ...current, notes: [...current.notes, note] });
    return note;
  }

  async healthCheck() {
    try {
      await mkdir(this.baseDir, { recursive: true });
      return { ok: true, detail: `local disk store at ${path.relative(process.cwd(), this.baseDir) || "."} (dev/test only)` };
    } catch (error) {
      return { ok: false, detail: `local store not writable: ${(error as Error).message}` };
    }
  }

  // --- internals ------------------------------------------------------

  private async readRecord(referenceId: string): Promise<StoredRecord | null> {
    // Reference ids are generated server-side (lib/rfq/reference.ts); this
    // guard just keeps a crafted id from escaping the base directory.
    if (!/^[A-Za-z0-9-]+$/.test(referenceId)) return null;
    try {
      const raw = await readFile(path.join(this.submissionDir(referenceId), "record.json"), "utf-8");
      return JSON.parse(raw) as StoredRecord;
    } catch {
      return null;
    }
  }

  private async readAll(): Promise<RfqSubmissionDetail[]> {
    let entries: string[];
    try {
      entries = await readdir(this.baseDir);
    } catch {
      return [];
    }
    const records = await Promise.all(entries.map((name) => this.readRecord(name)));
    return records.filter((r): r is StoredRecord => r !== null).map((r) => this.toDetail(r));
  }

  private toDetail(record: StoredRecord): RfqSubmissionDetail {
    return {
      ...record,
      status: normalizeRfqStatus(record.status),
      statusChangedAt: record.statusChangedAt ?? record.updatedAt,
      notes: record.notes ?? [],
      statusHistory: record.statusHistory ?? [],
    };
  }

  /** Atomic write (temp file + rename) so a crash mid-write never leaves a
   * truncated record.json behind. */
  private async writeRecord(record: StoredRecord): Promise<void> {
    const dir = this.submissionDir(record.referenceId);
    await mkdir(dir, { recursive: true });
    const target = path.join(dir, "record.json");
    const tmp = `${target}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(record, null, 2), "utf-8");
    await rename(tmp, target);
  }
}
