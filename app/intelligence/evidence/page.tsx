import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { SourceBadge } from "@/components/ui/badges";
import { evidenceLedger } from "@/lib/data";
import type { SourceType } from "@/lib/types";

export default function EvidencePage() {
  const ledger = evidenceLedger();
  const counts = ledger.reduce<Record<string, number>>((acc, e) => {
    acc[e.sourceType] = (acc[e.sourceType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Evidence"
        description="Every important fact in this system carries source, confidence, last-verified date and evidence. This ledger aggregates that evidence across all object types — AI inference, supplier marketing, verified documentation, quote-derived data and production-proven outcomes are never treated as equivalent."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {Object.entries(counts).map(([source, count]) => (
          <SourceBadge key={source} source={source as SourceType} title={`${count} records`} />
        ))}
      </div>

      <Panel>
        <div className="scrollbar-thin -mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">Captured</th>
                <th className="py-2 pr-4 font-medium">Object</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Source</th>
                <th className="py-2 pr-4 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr key={entry.evidenceId} className="border-b border-border last:border-b-0 align-top">
                  <td className="py-2.5 pr-4 whitespace-nowrap text-xs text-muted">{entry.capturedAt}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <Link href={entry.recordHref} className="font-medium text-navy-800 hover:text-accent">
                      {entry.recordLabel}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap text-xs text-muted">{entry.recordType}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <SourceBadge source={entry.sourceType} />
                  </td>
                  <td className="py-2.5 pr-4 text-navy-900">{entry.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
