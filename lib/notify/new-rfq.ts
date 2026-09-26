import { rfqBackend } from "@/lib/rfq/config";
import type { RfqSubmissionRecord } from "@/lib/rfq/types";
import { siteOrigin } from "@/lib/seo";

/**
 * Same-day "new RFQ" email to the owner via Amazon SES (v2 API).
 *
 * Enabled only when ALL of these hold:
 *   - NOTIFY_EMAIL_TO and SES_FROM_ADDRESS are set (Terraform sets both on
 *     the ECS task when the owner provides them -- infra/terraform/ses.tf),
 *   - the RFQ backend is not "local" (dev/test never sends mail).
 * Otherwise it logs one line and returns.
 *
 * It must NEVER block or fail the customer's submission: the API route
 * calls it via next/server `after()` (runs after the response is sent), it
 * has its own timeout, and every error is caught and logged here.
 *
 * Privacy: the email carries only what the owner needs to triage (reference,
 * company, contact email, part name, quantity, file names/sizes) and a link
 * to /admin. Free-text requirements and the files themselves stay in the
 * system behind the admin login.
 */

export interface NotifyConfig {
  to: string[];
  from: string;
  region: string;
}

export function notifyConfig(): NotifyConfig | null {
  const to = (process.env.NOTIFY_EMAIL_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const from = process.env.SES_FROM_ADDRESS?.trim() ?? "";
  if (to.length === 0 || !from) return null;
  return { to, from, region: process.env.SES_REGION || process.env.AWS_REGION || "us-east-1" };
}

export function notificationsStatus(): { enabled: boolean; detail: string } {
  const cfg = notifyConfig();
  if (!cfg) return { enabled: false, detail: "off (NOTIFY_EMAIL_TO / SES_FROM_ADDRESS not set)" };
  if (rfqBackend() === "local") return { enabled: false, detail: "off in local mode (would send to " + maskEmail(cfg.to[0]) + ")" };
  return { enabled: true, detail: `on -> ${cfg.to.map(maskEmail).join(", ")}` };
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 1)}***@${domain}`;
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

/** Strips CR/LF so customer-entered text can never inject extra lines into
 * the subject. */
function oneLine(value: string, max = 80): string {
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}

export function buildNewRfqEmail(record: RfqSubmissionRecord, adminBaseUrl: string): { subject: string; text: string } {
  const who = oneLine(record.contactCompany || record.contactEmail, 60);
  const part = oneLine(record.partName || "(no part name)", 60);
  const subject = `New RFQ ${record.referenceId}: ${part} — ${who}`;
  const files = record.files.length
    ? record.files.map((f) => `  - ${oneLine(f.fileName, 120)} (${formatBytes(f.sizeBytes)})`).join("\n")
    : "  (no files attached)";
  const text = [
    `A new RFQ was submitted on ${new Date(record.createdAt).toUTCString()}.`,
    "",
    `Reference:   ${record.referenceId}`,
    `Company:     ${oneLine(record.contactCompany || "-")}`,
    `Contact:     ${oneLine(record.contactEmail)}`,
    `Part:        ${part}`,
    `Quantity:    ${oneLine(record.quantity || "-")}`,
    `Target date: ${oneLine(record.targetDate || "-")}`,
    `Files:`,
    files,
    "",
    `Open it in the admin (sign-in required):`,
    `${adminBaseUrl}/admin/rfqs/${record.id}`,
    "",
    "Target: first reply within 1 business day. Requirements text and files are only in the admin.",
  ].join("\n");
  return { subject, text };
}

export async function notifyNewRfq(record: RfqSubmissionRecord): Promise<void> {
  const cfg = notifyConfig();
  if (!cfg) {
    console.info(`[notify] new RFQ ${record.referenceId}: email alerts off (NOTIFY_EMAIL_TO / SES_FROM_ADDRESS not set)`);
    return;
  }
  if (rfqBackend() === "local") {
    console.info(`[notify] new RFQ ${record.referenceId}: local mode, not sending email (would send to ${cfg.to.map(maskEmail).join(", ")})`);
    return;
  }
  try {
    const { SESv2Client, SendEmailCommand } = await import("@aws-sdk/client-sesv2");
    const client = new SESv2Client({ region: cfg.region });
    const { subject, text } = buildNewRfqEmail(record, siteOrigin());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      await client.send(
        new SendEmailCommand({
          FromEmailAddress: cfg.from,
          Destination: { ToAddresses: cfg.to },
          Content: { Simple: { Subject: { Data: subject, Charset: "UTF-8" }, Body: { Text: { Data: text, Charset: "UTF-8" } } } },
        }),
        { abortSignal: controller.signal },
      );
    } finally {
      clearTimeout(timer);
    }
    console.info(`[notify] new RFQ ${record.referenceId}: owner alert sent`);
  } catch (error) {
    // Never rethrow: the RFQ is already saved; the owner will still see it
    // in /admin. The log line is what CloudWatch alarms/grep can find.
    console.error(`[notify] new RFQ ${record.referenceId}: owner alert FAILED (RFQ is saved)`, (error as Error).message);
  }
}
