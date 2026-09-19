import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { ProductionJobs, Suppliers, Parts, Orders } from "@/lib/data";

export default function ProductionPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Production"
        description="Production jobs tracked against the exact part revision released for manufacturing."
      />
      <Panel>
        <DataTable
          rowHref={(j) => `/execution/production/${j.id}`}
          columns={[
            { header: "Job", cell: (j) => j.id },
            { header: "Order", cell: (j) => Orders.byId(j.orderId)?.id ?? "—" },
            { header: "Supplier", cell: (j) => Suppliers.byId(j.supplierId)?.name ?? "—" },
            { header: "Part", cell: (j) => Parts.byId(j.partId)?.name ?? "—" },
            { header: "Due", cell: (j) => j.dueDate },
            { header: "Stage", cell: (j) => <StatusBadge status={j.stage} /> },
          ]}
          rows={ProductionJobs.all()}
        />
      </Panel>
    </div>
  );
}
