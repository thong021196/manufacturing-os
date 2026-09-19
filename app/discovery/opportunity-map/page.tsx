import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge, ConfidenceBadge } from "@/components/ui/badges";
import { Opportunities, Markets, Geographies, Components } from "@/lib/data";

export default function OpportunityMapPage() {
  const opportunities = Opportunities.all();

  return (
    <div>
      <PageHeader
        eyebrow="Discovery"
        title="Opportunity Map"
        description="Opportunities link a market and geography to specific components and carry the demand signals that qualified them. Each stage reflects how far the opportunity has moved through the mock commercial flow."
      />
      <Panel>
        <DataTable
          rowHref={(o) => `/discovery/opportunity-map/${o.id}`}
          columns={[
            { header: "Opportunity", cell: (o) => o.name },
            { header: "Market", cell: (o) => Markets.byId(o.marketId)?.name ?? "—" },
            { header: "Geography", cell: (o) => Geographies.byId(o.geographyId)?.name ?? "—" },
            { header: "Components", cell: (o) => Components.byIds(o.componentIds).map((c) => c.name).join(", ") || "—" },
            { header: "Est. value", cell: (o) => `$${o.estValueUsd.toLocaleString()}` },
            { header: "Stage", cell: (o) => <StatusBadge status={o.stage} /> },
            { header: "Confidence", cell: (o) => <ConfidenceBadge level={o.confidence} /> },
          ]}
          rows={opportunities}
        />
      </Panel>
    </div>
  );
}
