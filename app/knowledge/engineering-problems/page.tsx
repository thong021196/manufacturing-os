import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { Components, Applications, EngineeringProblems } from "@/lib/data";

export default function EngineeringProblemsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Engineering Problems"
        description="Recurring technical challenges surfaced from CAD notes and RFQ requirement text, linked to the components and applications they affect."
      />
      <Panel>
        <DataTable
          rowHref={(e) => `/knowledge/engineering-problems/${e.id}`}
          columns={[
            { header: "Problem", cell: (e) => e.name },
            { header: "Components", cell: (e) => Components.byIds(e.componentIds).map((c) => c.name).join(", ") || "—" },
            { header: "Applications", cell: (e) => Applications.byIds(e.applicationIds).map((a) => a.name).join(", ") || "—" },
          ]}
          rows={EngineeringProblems.all()}
        />
      </Panel>
    </div>
  );
}
