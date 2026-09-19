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
        description="Raw quotes returned by suppliers against an RFQ, each with tooling/NRE, finish, inspection scope, shipping, incoterm, MOQ, payment terms and validity — normalizable apples-to-apples before selection."
      />
      <Panel>
        <DataTable
          rowHref={(q) => `/execution/supplier-quotes/${q.id}`}
          columns={[
            { header: "Quote", cell: (q) => q.id },
            { header: "RFQ", cell: (q) => Rfqs.byId(q.rfqId)?.name ?? "—" },
            { header: "Supplier", cell: (q) => Suppliers.byId(q.supplierId)?.name ?? "—" },
            { header: "Unit price", cell: (q) => `${q.currency} $${q.unitPriceUsd}` },
            { header: "NRE", cell: (q) => (q.toolingNreUsd > 0 ? `$${q.toolingNreUsd}` : "—") },
            { header: "Lead time", cell: (q) => `${q.leadTimeDays}d` },
            { header: "Incoterm", cell: (q) => q.incoterm },
            { header: "Valid until", cell: (q) => q.quoteValidUntil },
            { header: "Status", cell: (q) => <StatusBadge status={q.selected ? "selected" : q.status} /> },
          ]}
          rows={SupplierQuotes.all()}
        />
      </Panel>
    </div>
  );
}
