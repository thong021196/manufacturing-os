import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge, ConfidenceBadge } from "@/components/ui/badges";
import { Suppliers, Geographies, SupplierPerformances } from "@/lib/data";

export default function SuppliersPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Supply"
        title="Suppliers"
        description="Manufacturing partners with declared capability (self-reported) and observed capability (confirmed by production and QC evidence) tracked as distinct layers."
      />
      <Panel>
        <DataTable
          rowHref={(s) => `/supply/suppliers/${s.id}`}
          columns={[
            { header: "Supplier", cell: (s) => s.name },
            { header: "Geography", cell: (s) => Geographies.byId(s.geographyId)?.name ?? "—" },
            { header: "Status", cell: (s) => <StatusBadge status={s.status} /> },
            {
              header: "On-time rate",
              cell: (s) => {
                const perf = SupplierPerformances.byId(s.performanceId);
                return perf && perf.totalOrders > 0 ? `${perf.onTimeRatePct}%` : "No orders yet";
              },
            },
            { header: "Confidence", cell: (s) => <ConfidenceBadge level={s.confidence} /> },
          ]}
          rows={Suppliers.all()}
        />
      </Panel>
    </div>
  );
}
