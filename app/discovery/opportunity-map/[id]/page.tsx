import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge, DemandStageBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { Opportunities, Markets, Geographies, Components, rfqsForComponent, CadPackages } from "@/lib/data";

export default async function OpportunityDetailPage({ params }: PageProps<"/discovery/opportunity-map/[id]">) {
  const { id } = await params;
  const opportunity = Opportunities.byId(id);
  if (!opportunity) notFound();

  const market = Markets.byId(opportunity.marketId);
  const geography = Geographies.byId(opportunity.geographyId);
  const relatedComponents = Components.byIds(opportunity.componentIds);
  const relatedRfqs = relatedComponents.flatMap((c) => rfqsForComponent(c.id));
  const relatedCadPackages = CadPackages.where((c) => c.opportunityId === opportunity.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Opportunity Map", href: "/discovery/opportunity-map" }, { label: opportunity.name }]}
        eyebrow="Opportunity"
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
          <Panel title="Opportunity details">
            <MetaGrid
              fields={[
                { label: "Market", value: market?.name ?? "—" },
                { label: "Geography", value: geography?.name ?? "—" },
                { label: "Estimated value", value: `$${opportunity.estValueUsd.toLocaleString()}` },
                { label: "Stage", value: <StatusBadge status={opportunity.stage} /> },
              ]}
            />
          </Panel>

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
