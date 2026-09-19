import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { Orders, Companies, Suppliers, Components } from "@/lib/data";

export default function OrdersPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Orders"
        description="Accepted customer quotes that have converted into a manufacturing order, tracked through to production and delivery."
      />
      <Panel>
        <DataTable
          rowHref={(o) => `/execution/orders/${o.id}`}
          columns={[
            { header: "Order", cell: (o) => o.id },
            { header: "Company", cell: (o) => Companies.byId(o.companyId)?.name ?? "—" },
            { header: "Supplier", cell: (o) => Suppliers.byId(o.supplierId)?.name ?? "—" },
            { header: "Component", cell: (o) => Components.byId(o.componentId)?.name ?? "—" },
            { header: "Value", cell: (o) => `$${o.orderValueUsd.toLocaleString()}` },
            { header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
          ]}
          rows={Orders.all()}
        />
      </Panel>
    </div>
  );
}
