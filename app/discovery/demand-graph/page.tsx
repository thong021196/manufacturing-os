import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DemandStageBadge } from "@/components/ui/badges";
import { Components } from "@/lib/data";
import type { DemandStage } from "@/lib/types";

const stageOrder: DemandStage[] = ["search", "visitor", "cad_rfq", "quote", "paid", "repeat"];

export default function DemandGraphPage() {
  const components = Components.all();

  return (
    <div>
      <PageHeader
        eyebrow="Discovery"
        title="Demand Graph"
        description="Demand is tracked as separate, non-conflated layers per component: search demand, visitor demand, CAD/RFQ demand, quote demand, paid demand and repeat demand. A component with strong search demand but no paid demand has not proven itself commercially yet."
      />

      <div className="flex flex-col gap-5">
        {components.map((component) => {
          const byStage = new Map(component.demandSignals.map((s) => [s.stage, s]));
          const maxValue = Math.max(1, ...component.demandSignals.map((s) => s.value));
          return (
            <Panel
              key={component.id}
              title={component.name}
              description={component.category}
              actions={
                <Link href={`/knowledge/components/${component.id}`} className="text-xs font-medium text-accent hover:underline">
                  View component
                </Link>
              }
            >
              <div className="space-y-2.5">
                {stageOrder.map((stage) => {
                  const signal = byStage.get(stage);
                  const value = signal?.value ?? 0;
                  return (
                    <div key={stage} className="flex items-center gap-3 text-sm">
                      <div className="w-40 shrink-0">
                        <DemandStageBadge stage={stage} />
                      </div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-navy-600" style={{ width: `${(value / maxValue) * 100}%` }} />
                      </div>
                      <span className="w-32 shrink-0 text-right text-xs text-muted">
                        {value.toLocaleString()} {signal?.unit ?? ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
