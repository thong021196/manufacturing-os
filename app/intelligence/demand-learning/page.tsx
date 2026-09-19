import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { StatusBadge, SourceBadge } from "@/components/ui/badges";
import { DemandLearning, Components } from "@/lib/data";

export default function DemandLearningPage() {
  const records = DemandLearning.all();

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Demand Learning"
        description="Insights derived from comparing search, visitor, CAD/RFQ, quote and paid demand over time, per component."
      />
      <div className="space-y-4">
        {records.map((record) => {
          const component = Components.byId(record.componentId);
          return (
            <Panel key={record.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/knowledge/components/${component?.id}`} className="text-sm font-semibold text-navy-900 hover:text-accent">
                    {component?.name}
                  </Link>
                  <p className="text-xs text-muted">{record.period}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={record.status} />
                  <SourceBadge source={record.source} />
                </div>
              </div>
              <p className="mt-3 text-sm text-navy-900">{record.insight}</p>
              <p className="mt-1 text-xs text-muted">
                Demand delta: {record.demandDeltaPct > 0 ? "+" : ""}
                {record.demandDeltaPct}%
              </p>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
