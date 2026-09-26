import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { addRfqNoteAction, updateRfqStatusAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateTime, relativeAge } from "@/lib/admin/time";
import { getRfqStore } from "@/lib/rfq/store";
import { RFQ_STATUSES, RFQ_STATUS_LABELS, type RfqStatus, type RfqSubmissionStatus } from "@/lib/rfq/types";
import { Empty, RfqStatusBadge, Section, buttonClass, primaryButtonClass } from "@/app/admin/(console)/ui";

export const metadata: Metadata = { title: "RFQ" };
export const dynamic = "force-dynamic";

/** The natural next steps from each status (any status can still be chosen
 * from the full list below, e.g. to correct a mistake). */
const NEXT_STEPS: Record<RfqSubmissionStatus, RfqStatus[]> = {
  new: ["reviewing", "archived"],
  reviewing: ["quoted", "archived"],
  quoted: ["won", "lost"],
  won: [],
  lost: ["reviewing"],
  archived: ["reviewing"],
  spam_flagged: ["archived"],
};

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

function Field({ label, value, pre }: { label: string; value: string; pre?: boolean }) {
  return (
    <div className="py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-0.5 text-sm text-navy-900 ${pre ? "whitespace-pre-wrap break-words" : "break-words"}`}>{value || "—"}</dd>
    </div>
  );
}

export default async function RfqDetailPage({ params }: PageProps<"/admin/rfqs/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const store = await getRfqStore();
  const rfq = await store.getSubmissionDetail(id);
  if (!rfq) notFound();
  const now = new Date();

  return (
    <div className="space-y-5">
      <div>
        <nav className="mb-2 text-xs text-muted">
          <Link href="/admin/rfqs" className="hover:underline">
            RFQ inbox
          </Link>{" "}
          / <span className="font-mono">{rfq.referenceId}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-navy-900">{rfq.partName || "(no part name)"}</h1>
          <RfqStatusBadge status={rfq.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {rfq.contactCompany || "—"} · <a href={`mailto:${rfq.contactEmail}?subject=${encodeURIComponent(`Your RFQ ${rfq.referenceId}`)}`} className="text-accent hover:underline">{rfq.contactEmail}</a> · received{" "}
          {formatDateTime(rfq.createdAt)} ({relativeAge(rfq.createdAt, now)} ago)
        </p>
      </div>

      <Section title="Status" hint={`Current: ${rfq.status === "spam_flagged" ? "Spam" : RFQ_STATUS_LABELS[rfq.status]} since ${formatDateTime(rfq.statusChangedAt)}. Every change is kept in the history below.`}>
        <div className="flex flex-wrap items-center gap-2">
          {NEXT_STEPS[rfq.status].map((status) => (
            <form key={status} action={updateRfqStatusAction}>
              <input type="hidden" name="id" value={rfq.id} />
              <input type="hidden" name="status" value={status} />
              <button type="submit" className={primaryButtonClass}>
                Mark {RFQ_STATUS_LABELS[status].toLowerCase()}
              </button>
            </form>
          ))}
          <form action={updateRfqStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={rfq.id} />
            <label className="text-xs text-muted" htmlFor="status-select">
              or set
            </label>
            <select id="status-select" name="status" defaultValue={rfq.status} className="rounded-md border border-border bg-white px-2 py-1 text-xs">
              {RFQ_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {RFQ_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonClass}>
              Update
            </button>
          </form>
        </div>
        {rfq.statusHistory.length > 0 && (
          <ol className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-muted">
            {rfq.statusHistory.map((h) => (
              <li key={h.id}>
                {formatDateTime(h.changedAt)} — {h.fromStatus ?? "—"} → <strong className="text-navy-800">{h.toStatus}</strong> by {h.changedBy}
              </li>
            ))}
          </ol>
        )}
      </Section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Submitted requirement" hint="Exactly what the customer entered.">
          <dl className="divide-y divide-border">
            <Field label="Part name" value={rfq.partName} />
            <Field label="Context / what they're making" value={rfq.context} pre />
            <Field label="Revision" value={rfq.revision} />
            <Field label="Quantity" value={rfq.quantity} />
            <Field label="Target date" value={rfq.targetDate} />
            <Field label="Function" value={rfq.partFunction} pre />
            <Field label="Material" value={rfq.material} />
            <Field label="Finish" value={rfq.finish} />
            <Field label="Requirements" value={rfq.requirements} pre />
            <Field label="Company" value={rfq.contactCompany} />
            <Field label="Email" value={rfq.contactEmail} />
            <Field label="Note from customer" value={rfq.contactNote} pre />
            <Field label="Submitted from page" value={rfq.sourcePagePath} />
            <Field label="Reference" value={rfq.referenceId} />
          </dl>
        </Section>

        <div className="space-y-5">
          <Section title={`Files (${rfq.files.length})`} hint="Private. Each download is re-authorised and uses a short-lived link.">
            {rfq.files.length === 0 ? (
              <Empty>No files attached.</Empty>
            ) : (
              <ul className="divide-y divide-border">
                {rfq.files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="truncate text-navy-900" title={f.fileName}>
                        {f.fileName}
                      </div>
                      <div className="text-xs text-muted">
                        {formatBytes(f.sizeBytes)} · {f.contentType}
                      </div>
                    </div>
                    {/* A plain link (not next/link): the route answers with a
                        file stream or a redirect to a presigned URL. */}
                    <a href={`/api/admin/rfqs/${rfq.id}/files/${f.id}`} className={buttonClass} rel="noreferrer">
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Internal notes (${rfq.notes.length})`} hint="Only visible here. Notes are append-only.">
            {rfq.notes.length > 0 && (
              <ol className="mb-4 space-y-3">
                {rfq.notes.map((n) => (
                  <li key={n.id} className="rounded-md border border-border bg-background px-3 py-2">
                    <p className="whitespace-pre-wrap break-words text-sm text-navy-900">{n.body}</p>
                    <p className="mt-1 text-xs text-muted">
                      {n.author} · {formatDateTime(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <form action={addRfqNoteAction} className="space-y-2">
              <input type="hidden" name="id" value={rfq.id} />
              <textarea
                name="body"
                required
                maxLength={8000}
                rows={4}
                placeholder="e.g. Replied asking for the drawing revision; supplier shortlist A/B."
                className="block w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
              <button type="submit" className={primaryButtonClass}>
                Add note
              </button>
            </form>
          </Section>
        </div>
      </div>
    </div>
  );
}
