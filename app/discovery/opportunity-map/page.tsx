import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge, ConfidenceBadge } from "@/components/ui/badges";
import { Tag } from "@/components/ui/tag";
import { MarketOpportunities, Opportunities, Markets, Geographies, Components, commercialOpportunitiesForMarketOpportunity } from "@/lib/data";
import type { RiskLevel } from "@/lib/types";

const riskTone: Record<RiskLevel, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export default function OpportunityMapPage() {
  const marketOpportunities = MarketOpportunities.all();
  const commercialOpportunities = Opportunities.all();

  return (
    <div>
      <PageHeader
        eyebrow="Discovery"
        title="Opportunity Map"
        description="Two distinct layers: Market Opportunities score Demand x Capability x Competition x Margin x Risk for a market/component pair, independent of any customer. Commercial Opportunities are specific customer deals moving through a sales pipeline. A commercial deal may trace back to the market opportunity that qualified it, but the two are never merged into one object."
      />

      <Panel title="Market opportunities" description="Discovery-layer scoring, not tied to a specific customer.">
        <div className="scrollbar-thin -mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">Market opportunity</th>
                <th className="py-2 pr-4 font-medium">Market</th>
                <th className="py-2 pr-4 font-medium">Demand</th>
                <th className="py-2 pr-4 font-medium">Capability</th>
                <th className="py-2 pr-4 font-medium">Competition</th>
                <th className="py-2 pr-4 font-medium">Margin potential</th>
                <th className="py-2 pr-4 font-medium">Risk</th>
                <th className="py-2 pr-4 font-medium">Linked deals</th>
              </tr>
            </thead>
            <tbody>
              {marketOpportunities.map((mo) => {
                const linkedDeals = commercialOpportunitiesForMarketOpportunity(mo.id);
                return (
                  <tr key={mo.id} className="border-b border-border last:border-b-0 align-top">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-navy-800">{mo.name}</p>
                      <p className="mt-0.5 max-w-xs text-xs text-muted">{mo.description}</p>
                    </td>
                    <td className="py-2.5 pr-4">{Markets.byId(mo.marketId)?.name ?? "—"}</td>
                    <td className="py-2.5 pr-4">{mo.demandScore}/100</td>
                    <td className="py-2.5 pr-4">{mo.capabilityScore}/100</td>
                    <td className="py-2.5 pr-4">{mo.competitionScore}/100</td>
                    <td className="py-2.5 pr-4">{mo.marginPotentialPct}%</td>
                    <td className="py-2.5 pr-4">
                      <Tag tone={riskTone[mo.riskLevel]}>{mo.riskLevel} risk</Tag>
                    </td>
                    <td className="py-2.5 pr-4">{linkedDeals.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-5">
        <Panel title="Commercial opportunities" description="Specific customer deals, each optionally tracing back to the market opportunity that qualified it.">
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
            rows={commercialOpportunities}
          />
        </Panel>
      </div>
    </div>
  );
}
