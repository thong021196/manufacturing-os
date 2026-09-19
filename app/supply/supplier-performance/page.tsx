import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { Suppliers, SupplierPerformances } from "@/lib/data";

export default function SupplierPerformancePage() {
  const performances = SupplierPerformances.all();

  return (
    <div>
      <PageHeader
        eyebrow="Supply"
        title="Supplier Performance"
        description="Performance is computed only from completed production orders and QC records. Suppliers with no completed orders are shown as unproven rather than assigned a default score."
      />
      <Panel>
        <DataTable
          rowHref={(p) => `/supply/suppliers/${p.supplierId}`}
          columns={[
            { header: "Supplier", cell: (p) => Suppliers.byId(p.supplierId)?.name ?? p.supplierId },
            { header: "On-time rate", cell: (p) => (p.totalOrders > 0 ? `${p.onTimeRatePct}%` : "Unproven") },
            { header: "Quality score", cell: (p) => (p.totalOrders > 0 ? `${p.qualityScorePct}%` : "Unproven") },
            { header: "Avg lead time", cell: (p) => (p.totalOrders > 0 ? `${p.avgLeadTimeDays} days` : "—") },
            { header: "Completed orders", cell: (p) => p.totalOrders },
            { header: "Repeat order rate", cell: (p) => (p.totalOrders > 0 ? `${p.repeatOrderRatePct}%` : "—") },
          ]}
          rows={performances}
        />
      </Panel>
    </div>
  );
}
