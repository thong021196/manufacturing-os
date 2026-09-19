import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { ConfidenceBadge } from "@/components/ui/badges";
import { Components, Materials, Processes } from "@/lib/data";

export default function ComponentsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Components"
        description="Manufacturable parts that customers actually request quotes for. Components are not hard-coded to today's schema and should tolerate new fields as the domain model matures."
      />
      <Panel>
        <DataTable
          rowHref={(c) => `/knowledge/components/${c.id}`}
          columns={[
            { header: "Component", cell: (c) => c.name },
            { header: "Category", cell: (c) => c.category },
            { header: "Materials", cell: (c) => Materials.byIds(c.materialIds).map((m) => m.name).join(", ") || "—" },
            { header: "Processes", cell: (c) => Processes.byIds(c.processIds).map((p) => p.name).join(", ") || "—" },
            { header: "Suppliers", cell: (c) => c.supplierIds.length },
            { header: "Confidence", cell: (c) => <ConfidenceBadge level={c.confidence} /> },
          ]}
          rows={Components.all()}
        />
      </Panel>
    </div>
  );
}
