import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { Rfqs, Companies, Components, Revisions } from "@/lib/data";

export default function RfqsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="RFQs"
        description="Normalized requests for quote, each with an immutable binding to the exact part/revision priced — independent of the part's current revision — plus material, process, finish, requirements and a readiness state."
      />
      <Panel>
        <DataTable
          rowHref={(r) => `/execution/rfqs/${r.id}`}
          columns={[
            { header: "RFQ", cell: (r) => r.name },
            { header: "Company", cell: (r) => Companies.byId(r.companyId)?.name ?? "—" },
            { header: "Component", cell: (r) => Components.byId(r.componentId)?.name ?? "—" },
            { header: "Revision", cell: (r) => `Rev ${Revisions.byId(r.revisionId)?.revisionCode ?? "—"}` },
            { header: "Qty", cell: (r) => r.quantity },
            { header: "Due", cell: (r) => r.dueDate },
            { header: "Readiness", cell: (r) => <StatusBadge status={r.readinessState} /> },
            { header: "Stage", cell: (r) => <StatusBadge status={r.stage} /> },
          ]}
          rows={Rfqs.all()}
        />
      </Panel>
    </div>
  );
}
