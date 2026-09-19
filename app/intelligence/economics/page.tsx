import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { Economics } from "@/lib/data";

export default function EconomicsPage() {
  const records = [...Economics.all()].sort((a, b) => (a.period < b.period ? -1 : 1));
  const latest = records[records.length - 1];

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Economics"
        description="Realized revenue, margin and order economics by period, computed only from closed orders."
      />

      {latest && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Latest period" value={latest.period} />
          <StatCard label="Revenue" value={`$${latest.revenueUsd.toLocaleString()}`} />
          <StatCard label="Gross margin" value={`${latest.grossMarginPct}%`} />
          <StatCard label="Orders" value={latest.ordersCount} />
        </div>
      )}

      <Panel>
        <DataTable
          columns={[
            { header: "Period", cell: (r) => r.period },
            { header: "Revenue", cell: (r) => `$${r.revenueUsd.toLocaleString()}` },
            { header: "Gross margin", cell: (r) => `${r.grossMarginPct}%` },
            { header: "Avg order value", cell: (r) => `$${r.avgOrderValueUsd.toLocaleString()}` },
            { header: "Orders", cell: (r) => r.ordersCount },
          ]}
          rows={records}
        />
      </Panel>
    </div>
  );
}
