import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { RfqFileRecord, RfqSubmissionRecord } from "@/lib/rfq/types";
import type { CreateRfqInput, RfqStore } from "@/lib/rfq/store/interface";

const SUBMISSIONS_TABLE = "rfq_submissions";
const FILES_TABLE = "rfq_files";

/**
 * AWS-backed RFQ store: RDS Postgres for submission/file metadata, a
 * PRIVATE S3 bucket for the actual files. This is the recommended
 * production backend per the owner's AWS-first pivot (PR #26 review
 * comment 5750338323) — see infra/terraform/ for the resources this
 * class talks to and DEPLOYMENT.md for how they get provisioned.
 *
 * Access control:
 *  - Database: connects as the least-privilege `manufacturing_os_app` role
 *    created by infra/sql/0001_rfq_intake_rds.sql (SELECT/INSERT/UPDATE on
 *    exactly these two tables, nothing else) over a connection string that
 *    only resolves inside the manufacturing-os VPC's private subnets (see
 *    infra/terraform/rds.tf, infra/terraform/security_groups.tf) — there
 *    is no public route to this database at all.
 *  - Files: the S3 bucket (infra/terraform/s3.tf,
 *    `manufacturing-os-rfq-files-*`) has Block Public Access enabled on
 *    all four settings, no bucket policy grants public/anonymous access,
 *    and objects are never written with a public ACL (every PutObject
 *    call below is a plain private object with server-side encryption).
 *    The only way to read a file back is a short-lived presigned GET URL
 *    this class explicitly issues (getFileDownloadRef), mirroring
 *    SupabaseRfqStore's signed-URL pattern — never a public/CDN path.
 *
 * Requires AWS_REGION, DATABASE_URL (or the discrete PGHOST/PGPORT/...
 * vars pg reads natively) and AWS_S3_RFQ_BUCKET. Credentials come from the
 * ECS task's IAM role (no static AWS access keys in env vars) when running
 * on the infra this repo defines; the AWS SDK v3 clients below pick that
 * up automatically via the default credential provider chain — nothing
 * here hardcodes a key/secret.
 */
export class AwsRfqStore implements RfqStore {
  private pool: Pool;
  private s3: S3Client;
  private bucket: string;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    const bucket = process.env.AWS_S3_RFQ_BUCKET;
    if (!databaseUrl) {
      throw new Error(
        "AwsRfqStore requires DATABASE_URL (RDS Postgres connection string). Set RFQ_BACKEND=local to use the dev/test fallback instead.",
      );
    }
    if (!bucket) {
      throw new Error(
        "AwsRfqStore requires AWS_S3_RFQ_BUCKET. Set RFQ_BACKEND=local to use the dev/test fallback instead.",
      );
    }
    this.bucket = bucket;

    // RDS requires TLS. `rejectUnauthorized: false` accepts the RDS
    // server certificate without validating it against a CA bundle --
    // acceptable for MVP (traffic is still encrypted; the connection
    // never leaves the private VPC), same conservative tradeoff many
    // small Node/RDS deployments start with. Tightening to full chain
    // verification (bundling Amazon's RDS CA bundle) is a reasonable
    // post-MVP hardening step, not required to ship this pass -- set
    // AWS_DB_SSL=strict to opt into `rejectUnauthorized: true` once that
    // bundle is wired up.
    const sslMode = process.env.AWS_DB_SSL ?? "relaxed";
    const ssl = sslMode === "off" ? false : { rejectUnauthorized: sslMode === "strict" };

    this.pool = new Pool({ connectionString: databaseUrl, ssl, max: 5 });
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
           contact_note, source_page_path, created_at, updated_at)
         values ($1,$2,'received',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$16)`,
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
            // No ACL set -- the bucket's Block Public Access settings
            // (infra/terraform/s3.tf) reject any attempt to make an
            // object public anyway, but omitting ACL entirely is the
            // correct default (bucket owner enforced / ACLs disabled).
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
    } catch (error) {
      await client.query("rollback");
      throw error instanceof Error ? new Error(`Failed to persist RFQ submission: ${error.message}`) : error;
    } finally {
      client.release();
    }
  }

  async getSubmissionByReferenceId(referenceId: string): Promise<RfqSubmissionRecord | null> {
    const { rows: submissions } = await this.pool.query(`select * from ${SUBMISSIONS_TABLE} where reference_id = $1 limit 1`, [
      referenceId,
    ]);
    const submission = submissions[0];
    if (!submission) return null;

    const { rows: files } = await this.pool.query(`select * from ${FILES_TABLE} where rfq_submission_id = $1`, [submission.id]);

    return {
      id: submission.id,
      referenceId: submission.reference_id,
      status: submission.status,
      partName: submission.part_name,
      context: submission.context,
      revision: submission.revision,
      quantity: submission.quantity,
      targetDate: submission.target_date ? String(submission.target_date) : "",
      partFunction: submission.part_function,
      material: submission.material,
      finish: submission.finish,
      requirements: submission.requirements,
      contactEmail: submission.contact_email,
      contactCompany: submission.contact_company,
      contactNote: submission.contact_note,
      sourcePagePath: submission.source_page_path,
      files: files.map((f) => ({
        id: f.id,
        fileName: f.file_name,
        contentType: f.content_type,
        sizeBytes: Number(f.size_bytes),
        storageKey: f.storage_path,
      })),
      createdAt: submission.created_at instanceof Date ? submission.created_at.toISOString() : submission.created_at,
      updatedAt: submission.updated_at instanceof Date ? submission.updated_at.toISOString() : submission.updated_at,
    };
  }

  async getFileDownloadRef(file: RfqFileRecord) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: file.storageKey });
    const value = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { kind: "signed-url" as const, value };
  }
}
