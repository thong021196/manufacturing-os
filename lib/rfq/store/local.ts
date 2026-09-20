import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { rfqLocalStorageDir } from "@/lib/rfq/config";
import type { RfqFileRecord, RfqSubmissionRecord } from "@/lib/rfq/types";
import type { CreateRfqInput, RfqStore } from "@/lib/rfq/store/interface";

/**
 * Disk-backed RFQ store for local development and automated tests.
 *
 * Access control: files are written under `<repo root>/<RFQ_LOCAL_STORAGE_DIR>`
 * (default `.data/rfq`, gitignored), which is OUTSIDE `public/` -- Next.js
 * only ever serves files that live under `public/` or are returned by an
 * explicit route handler, so nothing under `.data/` is reachable by a
 * public URL. There is no route in this app that serves this directory's
 * contents to the public internet.
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
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[rfq] LocalRfqStore is active in a production NODE_ENV. This store is a dev/test fallback only " +
          "and is not durable in production. Set RFQ_BACKEND=aws with DATABASE_URL / AWS_S3_RFQ_BUCKET " +
          "(recommended, see DEPLOYMENT.md) or RFQ_BACKEND=supabase with SUPABASE_URL / " +
          "SUPABASE_SERVICE_ROLE_KEY for a real production deployment.",
      );
    }
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

    await writeFile(path.join(dir, "record.json"), JSON.stringify(record, null, 2), "utf-8");
    return record;
  }

  async getSubmissionByReferenceId(referenceId: string): Promise<RfqSubmissionRecord | null> {
    try {
      const raw = await readFile(path.join(this.submissionDir(referenceId), "record.json"), "utf-8");
      return JSON.parse(raw) as RfqSubmissionRecord;
    } catch {
      return null;
    }
  }

  async getFileDownloadRef(file: RfqFileRecord) {
    return { kind: "local-path" as const, value: path.join(this.baseDir, file.storageKey) };
  }
}
