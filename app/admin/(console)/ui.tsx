import type { ReactNode } from "react";
import { RFQ_STATUS_LABELS, type RfqSubmissionStatus } from "@/lib/rfq/types";
import type { CalendarState } from "@/lib/content/publishing";

/** Small presentational pieces shared by the admin pages (plain, token-based
 * styling consistent with the internal console components). */

const statusTone: Record<RfqSubmissionStatus, string> = {
  new: "bg-accent-soft text-accent",
  reviewing: "bg-info-soft text-info",
  quoted: "bg-warning-soft text-warning",
  won: "bg-success-soft text-success",
  lost: "bg-danger-soft text-danger",
  archived: "bg-background text-muted",
  spam_flagged: "bg-background text-muted",
};

export function RfqStatusBadge({ status }: { status: RfqSubmissionStatus }) {
  const label = status === "spam_flagged" ? "Spam" : RFQ_STATUS_LABELS[status];
  return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusTone[status]}`}>{label}</span>;
}

const calendarTone: Record<CalendarState, string> = {
  live: "bg-success-soft text-success",
  scheduled: "bg-info-soft text-info",
  draft: "bg-background text-muted",
  unpublished: "bg-background text-muted",
  paused: "bg-warning-soft text-warning",
  invalid: "bg-danger-soft text-danger",
};

export function CalendarBadge({ state }: { state: CalendarState }) {
  return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${calendarTone[state]}`}>{state}</span>;
}

export function Section({ title, hint, children, actions }: { title: string; hint?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
        {actions}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

export const buttonClass = "rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-navy-800 hover:border-accent";
export const primaryButtonClass = "rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90";
