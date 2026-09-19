import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { Processes, Components, SupplierCapabilities } from "@/lib/data";

export default function ProcessesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Processes"
        description="Manufacturing processes and the components and supplier capabilities associated with each."
      />
      <Panel>
        <DataTable
          rowHref={(p) => `/knowledge/processes/${p.id}`}
          columns={[
            { header: "Process", cell: (p) => p.name },
            { header: "Category", cell: (p) => p.category },
            { header: "Components", cell: (p) => Components.byIds(p.componentIds).map((c) => c.name).join(", ") || "—" },
            { header: "Supplier capabilities", cell: (p) => SupplierCapabilities.byIds(p.supplierCapabilityIds).length },
          ]}
          rows={Processes.all()}
        />
      </Panel>
    </div>
  );
}
