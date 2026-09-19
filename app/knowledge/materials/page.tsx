import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { ConfidenceBadge } from "@/components/ui/badges";
import { Materials, Components } from "@/lib/data";

export default function MaterialsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Materials"
        description="Material specifications used across components, each backed by standard published datasheets."
      />
      <Panel>
        <DataTable
          rowHref={(m) => `/knowledge/materials/${m.id}`}
          columns={[
            { header: "Material", cell: (m) => m.name },
            { header: "Category", cell: (m) => m.category },
            { header: "Used by components", cell: (m) => Components.byIds(m.componentIds).map((c) => c.name).join(", ") || "—" },
            { header: "Confidence", cell: (m) => <ConfidenceBadge level={m.confidence} /> },
          ]}
          rows={Materials.all()}
        />
      </Panel>
    </div>
  );
}
