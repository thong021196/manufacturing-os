import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { Geographies, Markets, Suppliers } from "@/lib/data";

export default function GeographiesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Geographies"
        description="Regions scoping markets, customers and suppliers across the initial US and Australia market scope."
      />
      <Panel>
        <DataTable
          rowHref={(g) => `/knowledge/geographies/${g.id}`}
          columns={[
            { header: "Geography", cell: (g) => g.name },
            { header: "Region", cell: (g) => g.region },
            { header: "Country", cell: (g) => g.country },
            { header: "Markets", cell: (g) => Markets.byIds(g.marketIds).map((m) => m.name).join(", ") || "—" },
            { header: "Suppliers", cell: (g) => Suppliers.byIds(g.supplierIds).length },
          ]}
          rows={Geographies.all()}
        />
      </Panel>
    </div>
  );
}
