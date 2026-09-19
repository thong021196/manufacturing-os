import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { CustomerQuotes, Companies, Rfqs } from "@/lib/data";

export default function CustomerQuotesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Customer Quotes"
        description="The single normalized commercial quote the customer receives, derived from the selected supplier quote plus margin."
      />
      <Panel>
        <DataTable
          rowHref={(q) => `/execution/customer-quotes/${q.id}`}
          columns={[
            { header: "Quote", cell: (q) => q.id },
            { header: "Company", cell: (q) => Companies.byId(q.companyId)?.name ?? "—" },
            { header: "RFQ", cell: (q) => Rfqs.byId(q.rfqId)?.name ?? "—" },
            { header: "Sell price", cell: (q) => `$${q.sellUnitPriceUsd}` },
            { header: "Margin", cell: (q) => `${q.marginPct}%` },
            { header: "Status", cell: (q) => <StatusBadge status={q.status} /> },
          ]}
          rows={CustomerQuotes.all()}
        />
      </Panel>
    </div>
  );
}
