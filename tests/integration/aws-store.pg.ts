/**
 * Integration check for AwsRfqStore + AwsContentOverrideStore SQL against a
 * real Postgres with migrations applied (NOT part of `npm test`: needs a
 * database). Usage:
 *
 *   DATABASE_URL=postgresql://manufacturing_os_app:<pw>@127.0.0.1:5432/db AWS_DB_SSL=off \
 *   AWS_S3_RFQ_BUCKET=unused npx tsx tests/integration/aws-store.pg.ts
 *
 * Connect as the least-privilege app role so missing GRANTs fail here too.
 * Submissions are created without files, so S3 is never called.
 */
import assert from "node:assert/strict";
import { AwsRfqStore } from "@/lib/rfq/store/aws";
import { AwsContentOverrideStore } from "@/lib/content/overrides/aws";
import { getPgPool } from "@/lib/db/pg";

async function main() {
  const store = new AwsRfqStore();
  const health = await store.healthCheck();
  assert.equal(health.ok, true, health.detail);

  const ref = `RFQ-TEST-${Date.now()}`;
  const created = await store.createSubmission({
    referenceId: ref,
    fields: {
      partName: "Integration bracket",
      context: "ctx",
      revision: "A",
      quantity: "10",
      targetDate: "2026-11-15",
      partFunction: "",
      material: "",
      finish: "",
      requirements: "",
      contactEmail: "buyer@example.com",
      contactCompany: "Example Co",
      contactNote: "",
      sourcePagePath: "/rfq",
    },
    files: [],
  });
  assert.equal(created.status, "new");

  const listed = await store.listSubmissions({ statuses: ["new"], limit: 50 });
  assert.ok(listed.some((r) => r.id === created.id), "new RFQ listed under status=new");

  let detail = await store.getSubmissionDetail(created.id);
  assert.equal(detail?.targetDate, "2026-11-15", "date round-trips without timezone shift");

  detail = await store.updateStatus(created.id, "reviewing", "owner");
  assert.equal(detail?.status, "reviewing");
  detail = await store.updateStatus(created.id, "reviewing", "owner"); // no-op
  detail = await store.updateStatus(created.id, "quoted", "owner");
  assert.equal(detail?.statusHistory.length, 2, "two real transitions recorded, no-op skipped");
  assert.deepEqual(
    detail?.statusHistory.map((h) => `${h.fromStatus}->${h.toStatus}`),
    ["new->reviewing", "reviewing->quoted"],
  );

  const note = await store.addNote(created.id, "Asked for drawing rev B.", "owner");
  assert.ok(note?.createdAt);
  detail = await store.getSubmissionDetail(created.id);
  assert.equal(detail?.notes.length, 1);

  assert.equal(await store.addNote("00000000-0000-4000-8000-000000000000", "x", "owner"), null);
  assert.equal(await store.getSubmissionDetail("not-a-uuid"), null);

  const counts = await store.countByStatus();
  assert.ok(counts.quoted >= 1);

  const overrides = new AwsContentOverrideStore();
  await overrides.setPaused("/quality", true, "typo in hero", "owner");
  assert.ok((await overrides.list()).some((o) => o.path === "/quality" && o.paused));
  await overrides.setPaused("/quality", true, "updated reason", "owner"); // upsert
  await overrides.setPaused("/quality", false, "", "owner");
  assert.ok(!(await overrides.list()).some((o) => o.path === "/quality"));

  console.log(`OK: AwsRfqStore + AwsContentOverrideStore against Postgres (${health.detail})`);
  await getPgPool().end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
