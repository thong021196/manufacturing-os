import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateTime, relativeAge } from "@/lib/admin/time";
import { getRfqStore } from "@/lib/rfq/store";
import { RFQ_OPEN_STATUSES, RFQ_STATUSES, RFQ_STATUS_LABELS, isRfqStatus, type RfqStatus } from "@/lib/rfq/types";
import { Empty, RfqStatusBadge, Section } from "@/app/admin/(console)/ui";

export const metadata: Metadata = { title: "RFQ inbox" };
export const dynamic = "force-dynamic";

type Filter = "open" | "all" | RfqStatus;

function parseFilter(value: unknown): Filter {
  if (value === "all" || value === "open") return value;
  return isRfqStatus(value) ? value : "open";
}

export default async function RfqInboxPage({ searchParams }: PageProps<"/admin/rfqs">) {
  await requireAdmin();
  const filter = parseFilter((await searchParams).status);
  const statuses: readonly RfqStatus[] | undefined = filter === "all" ? undefined : filter === "open" ? RFQ_OPEN_STATUSES : [filter];
  const store = await getRfqStore();
  const [rows, counts] = await Promise.all([store.listSubmissions({ statuses, limit: 300 }), store.countByStatus()]);
  const now = new Date();
  const openCount = RFQ_OPEN_STATUSES.reduce((sum, s) => sum + counts[s], 0);
  const allCount = RFQ_STATUSES.reduce((sum, s) => sum + counts[s], 0);

  const tabs: Array<{ key: Filter; label: string; count: number }> = [
    { key: "open", label: "Open", count: openCount },
    ...RFQ_STATUSES.map((s) => ({ key: s as Filter, label: RFQ_STATUS_LABELS[s], count: counts[s] })),
    { key: "all", label: "All", count: allCount },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">RFQ inbox</p>
        <h1 className="text-xl font-semibold text-navy-900">Submitted RFQs</h1>
        <p className="mt-1 text-sm text-muted">Workflow: New → Reviewing → Quoted → Won / Lost, or Archived. Newest first.</p>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Status filter">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "open" ? "/admin/rfqs" : `/admin/rfqs?status=${tab.key}`}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
              filter === tab.key ? "border-accent bg-accent text-white" : "border-border bg-surface text-navy-800 hover:border-accent"
            }`}
            aria-current={filter === tab.key ? "page" : undefined}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </nav>

      <Section title={`${tabs.find((t) => t.key === filter)?.label ?? "Open"} (${rows.length})`}>
        {rows.length === 0 ? (
          <Empty>No RFQs in this view.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">Received</th>
                  <th className="py-2 pr-3 font-medium">Reference</th>
                  <th className="py-2 pr-3 font-medium">Company / contact</th>
                  <th className="py-2 pr-3 font-medium">Part</th>
                  <th className="py-2 pr-3 font-medium">Qty</th>
                  <th className="py-2 pr-3 font-medium">Files</th>
                  <th className="py-2 pr-3 font-medium">Notes</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="py-2.5 pr-3 text-xs text-muted" title={formatDateTime(r.createdAt)}>
                      {relativeAge(r.createdAt, now)} ago
                    </td>
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/rfqs/${r.id}`} className="font-mono text-xs text-accent hover:underline">
                        {r.referenceId}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="text-navy-900">{r.contactCompany || "—"}</div>
                      <div className="text-xs text-muted">{r.contactEmail}</div>
                    </td>
                    <td className="py-2.5 pr-3 text-navy-900">
                      <Link href={`/admin/rfqs/${r.id}`} className="hover:text-accent">
                        {r.partName || "(no part name)"}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{r.quantity || "—"}</td>
                    <td className="py-2.5 pr-3 text-muted">{r.fileCount}</td>
                    <td className="py-2.5 pr-3 text-muted">{r.noteCount}</td>
                    <td className="py-2.5">
                      <RfqStatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
