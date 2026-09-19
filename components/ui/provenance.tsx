import type { Traceable } from "@/lib/types";
import { ConfidenceBadge, SourceBadge } from "@/components/ui/badges";
import { Panel } from "@/components/ui/panel";

export function ProvenanceBadges({ record }: { record: Traceable }) {
  return (
    <>
      <SourceBadge source={record.source} />
      <ConfidenceBadge level={record.confidence} />
      {record.revision !== undefined && (
        <span className="inline-flex items-center rounded-full border border-border bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-navy-700">
          Rev {record.revision}
        </span>
      )}
    </>
  );
}

export function EvidenceTrail({ record }: { record: Traceable }) {
  return (
    <Panel
      title="Evidence & provenance"
      description="Facts inferred by AI, supplier marketing claims, verified documentation, quote-derived data and production-proven outcomes are never treated as equivalent."
    >
      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <span>Last verified: {record.lastVerified ?? "Not yet independently verified"}</span>
        <span className="text-border">&middot;</span>
        <span>Owner: {record.owner}</span>
        <span className="text-border">&middot;</span>
        <span>Updated: {record.updatedAt}</span>
      </div>
      <ol className="space-y-3 border-l border-border pl-4">
        {record.evidence.map((item) => (
          <li key={item.id} className="relative">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-accent" />
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge source={item.sourceType} />
              <span className="text-xs text-muted">{item.capturedAt}</span>
            </div>
            <p className="mt-1 text-sm text-navy-900">{item.summary}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
