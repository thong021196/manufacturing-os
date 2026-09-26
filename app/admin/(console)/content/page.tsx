import type { Metadata } from "next";
import { setContentPausedAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { loadCalendar, type CalendarRow } from "@/lib/admin/calendar";
import { contentPrListUrl } from "@/lib/admin/github";
import { formatDateTime, relativeAge } from "@/lib/admin/time";
import { CalendarBadge, Empty, Section, buttonClass } from "@/app/admin/(console)/ui";

export const metadata: Metadata = { title: "Content calendar" };
export const dynamic = "force-dynamic";

function PauseForm({ row }: { row: CalendarRow }) {
  if (row.state === "paused") {
    return (
      <form action={setContentPausedAction}>
        <input type="hidden" name="path" value={row.entry.path} />
        <input type="hidden" name="paused" value="false" />
        <button type="submit" className={buttonClass}>
          Resume
        </button>
      </form>
    );
  }
  if (!row.pausable) return <span className="text-xs text-muted">core page</span>;
  return (
    <form action={setContentPausedAction} className="flex items-center gap-1.5">
      <input type="hidden" name="path" value={row.entry.path} />
      <input type="hidden" name="paused" value="true" />
      <input
        name="reason"
        maxLength={500}
        placeholder="reason (optional)"
        aria-label={`Reason for pausing ${row.entry.path}`}
        className="w-36 rounded-md border border-border bg-white px-2 py-1 text-xs"
      />
      <button type="submit" className={buttonClass}>
        Pause
      </button>
    </form>
  );
}

function Rows({ rows, now, showPublishAt, actions }: { rows: CalendarRow[]; now: Date; showPublishAt?: boolean; actions?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {rows.map((row) => (
        <li key={row.entry.path} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <CalendarBadge state={row.state} />
              {row.state === "live" ? (
                <a href={row.entry.path} target="_blank" rel="noreferrer" className="font-medium text-navy-900 hover:text-accent">
                  {row.entry.title}
                </a>
              ) : (
                <span className="font-medium text-navy-900">{row.entry.title}</span>
              )}
              <span className="text-xs text-muted">{row.entry.path}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted">
              {showPublishAt && row.publishAt
                ? `Goes live ${formatDateTime(row.publishAt.toISOString())} (${relativeAge(row.publishAt.toISOString(), now)})`
                : row.state === "invalid"
                  ? `publishAt "${row.entry.publishAt ?? ""}" is missing or has no timezone offset — fix it in the repo`
                  : row.entry.publishStatus === "scheduled" && row.publishAt
                    ? `Scheduled for ${formatDateTime(row.publishAt.toISOString())}`
                    : `${row.entry.pageKind} · ${row.entry.indexPolicy} · updated ${row.entry.updatedAt}`}
              {row.override?.paused && ` · paused by ${row.override.updatedBy} ${relativeAge(row.override.updatedAt, now)} ago${row.override.reason ? `: “${row.override.reason}”` : ""}`}
            </div>
          </div>
          {actions && <PauseForm row={row} />}
        </li>
      ))}
    </ul>
  );
}

export default async function ContentCalendarPage() {
  await requireAdmin();
  const now = new Date();
  const { rows, overridesError } = await loadCalendar(now);
  const by = (state: CalendarRow["state"]) => rows.filter((r) => r.state === state);
  const scheduled = by("scheduled").sort((a, b) => (a.publishAt?.getTime() ?? 0) - (b.publishAt?.getTime() ?? 0));
  const drafts = [...by("draft"), ...by("invalid")];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Content calendar</p>
        <h1 className="text-xl font-semibold text-navy-900">What&apos;s live, what&apos;s next</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Page text and publish dates live in the repo and change only through a reviewed pull request (approve = merge the{" "}
          <a href={contentPrListUrl()} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            content PR
          </a>
          ). Scheduled pages go live on their own within ~5 minutes of their time. The only switch here is <strong>Pause</strong>: it hides a
          public page immediately (404, removed from links and the sitemap) until you resume it. The home page and RFQ intake can&apos;t be paused.
        </p>
        {overridesError && <p className="mt-2 text-sm text-danger">Could not read pause state: {overridesError}</p>}
      </div>

      <Section title={`Scheduled (${scheduled.length})`} hint="Merged and approved; will publish automatically.">
        {scheduled.length === 0 ? <Empty>Nothing scheduled.</Empty> : <Rows rows={scheduled} now={now} showPublishAt />}
      </Section>

      <Section title={`Drafts awaiting approval (${drafts.length})`} hint="In the repo but not scheduled (or with an invalid date). Unmerged drafts are in the open content PRs.">
        {drafts.length === 0 ? <Empty>No drafts in the repo.</Empty> : <Rows rows={drafts} now={now} />}
      </Section>

      <Section title={`Paused by you (${by("paused").length})`}>
        {by("paused").length === 0 ? <Empty>Nothing paused.</Empty> : <Rows rows={by("paused")} now={now} actions />}
      </Section>

      <Section title={`Live (${by("live").length})`}>
        <Rows rows={by("live")} now={now} actions />
      </Section>

      {by("unpublished").length > 0 && (
        <Section title={`Unpublished (${by("unpublished").length})`} hint="Taken down in the repo.">
          <Rows rows={by("unpublished")} now={now} />
        </Section>
      )}
    </div>
  );
}
