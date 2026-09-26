import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNewRfqEmail, notifyConfig, notifyNewRfq } from "@/lib/notify/new-rfq";
import { contentDispositionAttachment } from "@/lib/rfq/download";
import type { RfqSubmissionRecord } from "@/lib/rfq/types";

const record: RfqSubmissionRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  referenceId: "RFQ-20260926-ABCDEF",
  status: "new",
  partName: "Bracket\r\nBcc: attacker@example.com",
  context: "SECRET REQUIREMENT TEXT",
  revision: "B",
  quantity: "25",
  targetDate: "2026-11-01",
  partFunction: "",
  material: "",
  finish: "",
  requirements: "SECRET TOLERANCE NOTES",
  contactEmail: "buyer@example.com",
  contactCompany: "Example Robotics",
  contactNote: "",
  sourcePagePath: "/rfq",
  files: [{ id: "f", fileName: "part.step", contentType: "application/octet-stream", sizeBytes: 2048, storageKey: "k" }],
  createdAt: "2026-09-26T10:00:00Z",
  updatedAt: "2026-09-26T10:00:00Z",
};

test("new-RFQ email: single-line subject, admin link, no free-text requirements", () => {
  const { subject, text } = buildNewRfqEmail(record, "https://www.example.com");
  assert.ok(!/[\r\n]/.test(subject), "subject must not contain line breaks");
  assert.ok(subject.includes("RFQ-20260926-ABCDEF"));
  assert.ok(text.includes("https://www.example.com/admin/rfqs/11111111-1111-4111-8111-111111111111"));
  assert.ok(text.includes("part.step (2 KB)"));
  assert.ok(!text.includes("SECRET"), "requirements/context stay in the admin");
});

test("notifications are a no-op (never throw) when unconfigured or in local mode", async () => {
  delete process.env.NOTIFY_EMAIL_TO;
  delete process.env.SES_FROM_ADDRESS;
  assert.equal(notifyConfig(), null);
  await notifyNewRfq(record);
  process.env.NOTIFY_EMAIL_TO = "owner@example.com";
  process.env.SES_FROM_ADDRESS = "alerts@example.com";
  process.env.RFQ_BACKEND = "local";
  await notifyNewRfq(record); // local mode: logs, does not send
  delete process.env.NOTIFY_EMAIL_TO;
  delete process.env.SES_FROM_ADDRESS;
  delete process.env.RFQ_BACKEND;
});

test("Content-Disposition is always attachment and header-safe", () => {
  const value = contentDispositionAttachment('evil"\r\nX-Injected: 1.step');
  assert.ok(value.startsWith("attachment; "));
  assert.ok(!/[\r\n]/.test(value));
  assert.ok(value.includes("filename*=UTF-8''"));
});
