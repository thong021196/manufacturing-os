import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { loadCalendar } from "@/lib/admin/calendar";
import { contentPrListUrl, fetchContentPrs } from "@/lib/admin/github";
import { formatDateTime, hoursSince, nextVisit, relativeAge } from "@/lib/admin/time";
import { notificationsStatus } from "@/lib/notify/new-rfq";
import { rfqBackend } from "@/lib/rfq/config";
import { getRfqStore } from "@/lib/rfq/store";
import { Section, Empty, CalendarBadge } from "@/app/admin/(console)/ui";

export const metadata: Metadata = { title: "This week" };
export const dynamic = "force-dynamic";

/** Target for a first reply to a new RFQ (owner gets a same-day email
 * alert; see docs/ops/weekly-operating-rhythm.md). */
const REPLY_TARGET_HOURS = 24;
const QUOTE_FOLLOW_UP_DAYS = 14;

export default async function AdminDashboardPage() {
  await requireAdmin();
  const now = new Date();
  const store = await getRfqStore();
  const [health, newRfqs, reviewing, quoted, counts, calendar, prs] = await Promise.all([
    store.healthCheck(),
    store.listSubmissions({ statuses: ["new"], limit: 100 }).catch(() => null),
    store.listSubmissions({ statuses: ["reviewing"], limit: 100 }).catch(() => null),
    store.listSubmissions({ statuses: ["quoted"], limit: 100 }).catch(() => null),
    store.countByStatus().catch(() => null),
    loadCalendar(now),
    fetchContentPrs(),
  ]);

  const visit = nextVisit(now);
  const needsReply = (newRfqs ?? []).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const staleQuotes = (quoted ?? []).filter((r) => hoursSince(r.statusChangedAt, now) > QUOTE_FOLLOW_UP_DAYS * 24);
  const upcoming = calendar.rows
    .filter((r) => r.state === "scheduled" && r.publishAt && r.publishAt <= visit.horizon)
    .sort((a, b) => a.publishAt!.getTime() - b.publishAt!.getTime());
  const laterScheduled = calendar.rows.filter((r) => r.state === "scheduled" && r.publishAt && r.publishAt > visit.horizon).length;
  const recentlyLive = calendar.rows.filter(
    (r) => r.entry.publishStatus === "scheduled" && r.state === "live" && r.publishAt && now.getTime() - r.publishAt.getTime() < 7 * 86_400_000,
  );
  const drafts = calendar.rows.filter((r) => r.state === "draft" || r.state === "invalid");
  const paused = calendar.rows.filter((r) => r.state === "paused");
  const notify = notificationsStatus();
  const liveCount = calendar.rows.filter((r) => r.state === "live").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">This week</p>
          <h1 className="text-xl font-semibold text-navy-900">Owner visit checklist</h1>
          <p className="mt-1 text-sm text-muted">
            {formatDateTime(now.toISOString())} · next visit {visit.label}. Work top to bottom; 20–30 minutes covers it.
          </p>
        </div>
      </div>

      <Section
        title={`1 · New RFQs needing a reply (${needsReply.length})`}
        hint={`Oldest first. Target: first reply within ${REPLY_TARGET_HOURS} h of submission — email alerts cover the days between visits.`}
        actions={<Link href="/admin/rfqs" className="text-xs text-accent hover:underline">Open inbox →</Link>}
      >
        {newRfqs === null ? (
          <Empty>Could not load RFQs — see the health line below.</Empty>
        ) : needsReply.length === 0 ? (
          <Empty>Nothing waiting. Every RFQ has been picked up.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {needsReply.map((r) => {
              const overdue = hoursSince(r.createdAt, now) > REPLY_TARGET_HOURS;
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/rfqs/${r.id}`} className="min-w-0 flex-1 text-sm hover:text-accent">
                    <span className="font-medium text-navy-900">{r.partName || "(no part name)"}</span>{" "}
                    <span className="text-muted">
                      · {r.contactCompany || r.contactEmail} · {r.referenceId}
                    </span>
                  </Link>
                  <span className={`text-xs font-medium ${overdue ? "text-danger" : "text-muted"}`}>
                    waiting {relativeAge(r.createdAt, now)}
                    {overdue ? " · over target" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">
          Also open: {reviewing?.length ?? "?"} reviewing, {quoted?.length ?? "?"} quoted
          {staleQuotes.length > 0 ? ` (${staleQuotes.length} quoted > ${QUOTE_FOLLOW_UP_DAYS} d ago — follow up or mark won/lost)` : ""}.
        </p>
      </Section>

      <Section
        title={`2 · Content waiting for approval (${prs.ok ? prs.prs.length : "?"} PR${prs.ok && prs.prs.length === 1 ? "" : "s"}, ${drafts.length} draft${drafts.length === 1 ? "" : "s"})`}
        hint="Approving = merging the content PR on GitHub. Merged pages publish themselves at their scheduled time."
        actions={
          <a href={contentPrListUrl()} className="text-xs text-accent hover:underline" target="_blank" rel="noreferrer">
            Open content PRs ↗
          </a>
        }
      >
        {prs.ok ? (
          prs.prs.length === 0 ? (
            <Empty>No open content PRs.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {prs.prs.map((pr) => (
                <li key={pr.number} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                  <a href={pr.url} target="_blank" rel="noreferrer" className="text-navy-900 hover:text-accent">
                    #{pr.number} {pr.title}
                    {pr.draft ? " (draft PR)" : ""}
                  </a>
                  <span className="text-xs text-muted">opened {relativeAge(pr.createdAt, now)} ago</span>
                </li>
              ))}
            </ul>
          )
        ) : (
          <Empty>Couldn&apos;t reach GitHub ({prs.error}) — use the link above.</Empty>
        )}
        {drafts.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs font-medium text-navy-800">Merged but not scheduled (draft) or with an invalid date:</p>
            <ul className="mt-1 space-y-1">
              {drafts.map((r) => (
                <li key={r.entry.path} className="flex items-center gap-2 text-xs text-muted">
                  <CalendarBadge state={r.state} /> {r.entry.path}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section
        title={`3 · Publishing before your next visit (${upcoming.length})`}
        hint={`Scheduled pages go live on their own; this is what will change before ${visit.label}. Pause anything that shouldn't in the content calendar.`}
        actions={<Link href="/admin/content" className="text-xs text-accent hover:underline">Content calendar →</Link>}
      >
        {upcoming.length === 0 ? (
          <Empty>Nothing scheduled before your next visit{laterScheduled > 0 ? ` (${laterScheduled} scheduled later)` : ""}.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((r) => (
              <li key={r.entry.path} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                <span className="text-navy-900">
                  {r.entry.title} <span className="text-muted">· {r.entry.path}</span>
                </span>
                <span className="text-xs text-muted">
                  {formatDateTime(r.publishAt!.toISOString())} ({relativeAge(r.publishAt!.toISOString(), now)})
                </span>
              </li>
            ))}
          </ul>
        )}
        {(recentlyLive.length > 0 || paused.length > 0) && (
          <p className="mt-3 text-xs text-muted">
            {recentlyLive.length > 0 && `Went live in the last 7 days: ${recentlyLive.map((r) => r.entry.path).join(", ")}. `}
            {paused.length > 0 && `Paused by you: ${paused.map((r) => r.entry.path).join(", ")}.`}
          </p>
        )}
      </Section>

      <Section title="4 · Health">
        <ul className="space-y-1 text-sm">
          <li>
            <span className={health.ok ? "text-success" : "text-danger"}>●</span> Data store ({rfqBackend()}):{" "}
            {health.detail}
          </li>
          <li>
            <span className={notify.enabled ? "text-success" : "text-warning"}>●</span> New-RFQ email alerts: {notify.detail}
          </li>
          <li>
            <span className={calendar.overridesError ? "text-danger" : "text-success"}>●</span> Public pages live: {liveCount}
            {calendar.overridesError ? ` (content overrides unreadable: ${calendar.overridesError})` : ""}
          </li>
          <li className="text-muted">
            ● Running version: {process.env.APP_VERSION || "dev"} · RFQs all-time:{" "}
            {counts ? Object.values(counts).reduce((a, b) => a + b, 0) : "?"}
            {counts ? ` (won ${counts.won}, lost ${counts.lost})` : ""}
          </li>
        </ul>
      </Section>
    </div>
  );
}
