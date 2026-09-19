import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { CadPackages, Companies, Components } from "@/lib/data";

export default function CadPackagesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="CAD Packages"
        description="Customer-submitted CAD, drawings and BOMs. Files are private and referenced only by an internal vault path — never represented as public URLs."
      />
      <Panel>
        <DataTable
          rowHref={(c) => `/execution/cad-packages/${c.id}`}
          columns={[
            { header: "CAD package", cell: (c) => c.name },
            { header: "Company", cell: (c) => Companies.byId(c.companyId)?.name ?? "—" },
            { header: "Component", cell: (c) => Components.byId(c.componentId)?.name ?? "—" },
            { header: "Parts", cell: (c) => c.partIds.length },
            { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
          ]}
          rows={CadPackages.all()}
        />
      </Panel>
    </div>
  );
}
