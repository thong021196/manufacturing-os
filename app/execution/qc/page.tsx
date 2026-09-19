import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { QcResults, Parts, ProductionJobs } from "@/lib/data";

export default function QcPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="QC / Inspection"
        description="Inspection results recorded against the exact part and revision produced, feeding observed supplier capability."
      />
      <Panel>
        <DataTable
          rowHref={(r) => `/execution/qc/${r.id}`}
          columns={[
            { header: "Inspection", cell: (r) => r.id },
            { header: "Production job", cell: (r) => ProductionJobs.byId(r.productionJobId)?.id ?? "—" },
            { header: "Part", cell: (r) => Parts.byId(r.partId)?.name ?? "—" },
            { header: "Inspector", cell: (r) => r.inspector },
            { header: "Result", cell: (r) => <StatusBadge status={r.result} /> },
          ]}
          rows={QcResults.all()}
        />
      </Panel>
    </div>
  );
}
