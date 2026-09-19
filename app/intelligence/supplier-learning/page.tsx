import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { StatusBadge, SourceBadge } from "@/components/ui/badges";
import { SupplierLearning, Suppliers } from "@/lib/data";

export default function SupplierLearningPage() {
  const records = SupplierLearning.all();

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Supplier Learning"
        description="Insights derived from comparing declared vs. observed supplier capability and delivered performance over time."
      />
      <div className="space-y-4">
        {records.map((record) => {
          const supplier = Suppliers.byId(record.supplierId);
          return (
            <Panel key={record.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/supply/suppliers/${supplier?.id}`} className="text-sm font-semibold text-navy-900 hover:text-accent">
                    {supplier?.name}
                  </Link>
                  <p className="text-xs text-muted">{record.period}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={record.status} />
                  <SourceBadge source={record.source} />
                </div>
              </div>
              <p className="mt-3 text-sm text-navy-900">{record.insight}</p>
              {record.performanceDeltaPct !== 0 && (
                <p className="mt-1 text-xs text-muted">
                  Performance delta: {record.performanceDeltaPct > 0 ? "+" : ""}
                  {record.performanceDeltaPct}%
                </p>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
