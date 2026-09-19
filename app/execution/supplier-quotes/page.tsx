import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { SupplierQuotes, Suppliers, Rfqs } from "@/lib/data";

export default function SupplierQuotesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Supplier Quotes"
        description="Raw quotes returned by suppliers against an RFQ, before normalization into a single customer quote."
      />
      <Panel>
        <DataTable
          rowHref={(q) => `/execution/supplier-quotes/${q.id}`}
          columns={[
            { header: "Quote", cell: (q) => q.id },
            { header: "RFQ", cell: (q) => Rfqs.byId(q.rfqId)?.name ?? "—" },
            { header: "Supplier", cell: (q) => Suppliers.byId(q.supplierId)?.name ?? "—" },
            { header: "Unit price", cell: (q) => `$${q.unitPriceUsd}` },
            { header: "Lead time", cell: (q) => `${q.leadTimeDays}d` },
            { header: "Status", cell: (q) => <StatusBadge status={q.selected ? "selected" : q.status} /> },
          ]}
          rows={SupplierQuotes.all()}
        />
      </Panel>
    </div>
  );
}
