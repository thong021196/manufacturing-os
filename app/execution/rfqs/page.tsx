import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { Rfqs, Companies, Components } from "@/lib/data";

export default function RfqsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="RFQs"
        description="Normalized requests for quote, each pointing to the exact CAD package and revision used, and carrying every supplier and customer quote generated against it."
      />
      <Panel>
        <DataTable
          rowHref={(r) => `/execution/rfqs/${r.id}`}
          columns={[
            { header: "RFQ", cell: (r) => r.name },
            { header: "Company", cell: (r) => Companies.byId(r.companyId)?.name ?? "—" },
            { header: "Component", cell: (r) => Components.byId(r.componentId)?.name ?? "—" },
            { header: "Qty", cell: (r) => r.quantity },
            { header: "Due", cell: (r) => r.dueDate },
            { header: "Stage", cell: (r) => <StatusBadge status={r.stage} /> },
          ]}
          rows={Rfqs.all()}
        />
      </Panel>
    </div>
  );
}
