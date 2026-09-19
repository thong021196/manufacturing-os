import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/badges";
import { Revisions, Parts } from "@/lib/data";

export default function RevisionsPage() {
  const revisions = Revisions.all();

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Revisions"
        description="Released files and manufacturing definitions are immutable — every change creates a new revision. RFQs, quotes, orders and QC records always point to the exact revision used, never to a mutable 'latest'."
      />
      <Panel>
        <ul className="divide-y divide-border">
          {revisions.map((revision) => {
            const part = Parts.byId(revision.partId);
            const isCurrent = part?.currentRevisionId === revision.id;
            return (
              <li key={revision.id} id={revision.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={part ? `/execution/cad-packages/${part.cadPackageId}` : "#"} className="text-sm font-semibold text-navy-900 hover:text-accent">
                      {part?.name ?? revision.partId} — Rev {revision.revisionCode}
                    </Link>
                    <p className="text-xs text-muted">{revision.internalFileRef}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <StatusBadge status="current" />}
                    <StatusBadge status={revision.released ? "released" : "unreleased"} />
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-muted">{revision.changeSummary}</p>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
