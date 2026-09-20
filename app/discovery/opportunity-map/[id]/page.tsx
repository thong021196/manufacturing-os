import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge, DemandStageBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { Tag } from "@/components/ui/tag";
import { Opportunities, MarketOpportunities, Markets, Geographies, Components, rfqsForComponent, CadPackages } from "@/lib/data";
import type { RiskLevel } from "@/lib/types";

const riskTone: Record<RiskLevel, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export default async function OpportunityDetailPage({ params }: PageProps<"/discovery/opportunity-map/[id]">) {
  const { id } = await params;
  const opportunity = Opportunities.byId(id);
  if (!opportunity) notFound();

  const market = Markets.byId(opportunity.marketId);
  const geography = Geographies.byId(opportunity.geographyId);
  const marketOpportunity = MarketOpportunities.byId(opportunity.marketOpportunityId);
  const relatedComponents = Components.byIds(opportunity.componentIds);
  const relatedRfqs = relatedComponents.flatMap((c) => rfqsForComponent(c.id));
  const relatedCadPackages = CadPackages.where((c) => c.opportunityId === opportunity.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Opportunity Map", href: "/discovery/opportunity-map" }, { label: opportunity.name }]}
        eyebrow="Commercial opportunity"
        title={opportunity.name}
        description={opportunity.description}
        badges={
          <>
            <StatusBadge status={opportunity.stage} />
            <ProvenanceBadges record={opportunity} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Opportunity details" description="This is a commercial (pipeline) opportunity for a specific customer — distinct from the market-level opportunity that qualified it.">
            <MetaGrid
              fields={[
                { label: "Market", value: market?.name ?? "—" },
                { label: "Geography", value: geography?.name ?? "—" },
                { label: "Estimated value", value: `$${opportunity.estValueUsd.toLocaleString()}` },
                { label: "Stage", value: <StatusBadge status={opportunity.stage} /> },
              ]}
            />
          </Panel>

          {marketOpportunity && (
            <Panel title="Source market opportunity" description="Demand x Capability x Competition x Margin x Risk scoring this deal was qualified against.">
              <p className="text-sm font-medium text-navy-800">{marketOpportunity.name}</p>
              <p className="mt-1 text-sm text-muted">{marketOpportunity.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Demand</p>
                  <p className="text-sm font-medium text-navy-900">{marketOpportunity.demandScore}/100</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Capability</p>
                  <p className="text-sm font-medium text-navy-900">{marketOpportunity.capabilityScore}/100</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Competition</p>
                  <p className="text-sm font-medium text-navy-900">{marketOpportunity.competitionScore}/100</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Margin</p>
                  <p className="text-sm font-medium text-navy-900">{marketOpportunity.marginPotentialPct}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Risk</p>
                  <Tag tone={riskTone[marketOpportunity.riskLevel]}>{marketOpportunity.riskLevel}</Tag>
                </div>
              </div>
            </Panel>
          )}

          <Panel title="Demand signals" description="Signals that qualified this opportunity, tracked as distinct demand layers.">
            <ul className="space-y-2">
              {opportunity.demandSignals.map((signal, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <DemandStageBadge stage={signal.stage} />
                  <span className="text-muted">
                    {signal.value.toLocaleString()} {signal.unit} &middot; {signal.period}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <EvidenceTrail record={opportunity} />
        </div>

        <div className="space-y-5">
          <RelatedSection
            title="Components"
            items={relatedComponents.map((c) => ({ id: c.id, label: c.name, href: `/knowledge/components/${c.id}`, meta: c.category }))}
          />
          <RelatedSection
            title="CAD packages"
            items={relatedCadPackages.map((c) => ({ id: c.id, label: c.name, href: `/execution/cad-packages/${c.id}` }))}
          />
          <RelatedSection
            title="RFQs"
            items={relatedRfqs.map((r) => ({ id: r.id, label: r.name, href: `/execution/rfqs/${r.id}`, meta: <StatusBadge status={r.stage} /> }))}
          />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return Opportunities.all().map((item) => ({ id: item.id })); }
