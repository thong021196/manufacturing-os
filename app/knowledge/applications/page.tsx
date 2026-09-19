import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { Applications, Industries, Components } from "@/lib/data";

export default function ApplicationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Applications"
        description="How components get used inside customer products, grouped by industry."
      />
      <Panel>
        <DataTable
          rowHref={(a) => `/knowledge/applications/${a.id}`}
          columns={[
            { header: "Application", cell: (a) => a.name },
            { header: "Industry", cell: (a) => Industries.byId(a.industryId)?.name ?? "—" },
            { header: "Components", cell: (a) => Components.byIds(a.componentIds).map((c) => c.name).join(", ") || "—" },
          ]}
          rows={Applications.all()}
        />
      </Panel>
    </div>
  );
}
