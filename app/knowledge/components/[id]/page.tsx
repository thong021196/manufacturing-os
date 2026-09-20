import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { DemandStageBadge, StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import {
  Components,
  Applications,
  Materials,
  Processes,
  EngineeringProblems,
  Opportunities,
  Suppliers,
  CadPackages,
  SearchSurfaces,
  rfqsForComponent,
  outcomesForComponent,
} from "@/lib/data";

export default async function ComponentDetailPage({ params }: PageProps<"/knowledge/components/[id]">) {
  const { id } = await params;
  const component = Components.byId(id);
  if (!component) notFound();

  const relatedRfqs = rfqsForComponent(component.id);
  const relatedOutcomes = outcomesForComponent(component.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Components", href: "/knowledge/components" }, { label: component.name }]}
        eyebrow={component.category}
        title={component.name}
        description={component.description}
        badges={
          <>
            <StatusBadge status={component.status} />
            <ProvenanceBadges record={component} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Demand signals" description="Tracked as distinct, non-conflated stages.">
            <ul className="space-y-2">
              {component.demandSignals.map((signal, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <DemandStageBadge stage={signal.stage} />
                  <span className="text-muted">
                    {signal.value.toLocaleString()} {signal.unit} &middot; {signal.period}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Specification">
            <MetaGrid
              fields={[
                { label: "Category", value: component.category },
                { label: "Materials", value: Materials.byIds(component.materialIds).map((m) => m.name).join(", ") || "—" },
                { label: "Processes", value: Processes.byIds(component.processIds).map((p) => p.name).join(", ") || "—" },
              ]}
            />
          </Panel>

          <EvidenceTrail record={component} />
        </div>

        <div className="space-y-5">
          <RelatedSection
            title="Applications"
            items={Applications.byIds(component.applicationIds).map((a) => ({ id: a.id, label: a.name, href: `/knowledge/applications/${a.id}` }))}
          />
          <RelatedSection
            title="Engineering problems"
            items={EngineeringProblems.byIds(component.engineeringProblemIds).map((e) => ({ id: e.id, label: e.name, href: `/knowledge/engineering-problems/${e.id}` }))}
          />
          <RelatedSection
            title="Opportunities"
            items={Opportunities.byIds(component.opportunityIds).map((o) => ({ id: o.id, label: o.name, href: `/discovery/opportunity-map/${o.id}`, meta: <StatusBadge status={o.stage} /> }))}
          />
          <RelatedSection
            title="Suppliers"
            items={Suppliers.byIds(component.supplierIds).map((s) => ({ id: s.id, label: s.name, href: `/supply/suppliers/${s.id}` }))}
          />
          <RelatedSection
            title="CAD packages"
            items={CadPackages.byIds(component.cadPackageIds).map((c) => ({ id: c.id, label: c.name, href: `/execution/cad-packages/${c.id}` }))}
          />
          <RelatedSection
            title="RFQs"
            items={relatedRfqs.map((r) => ({ id: r.id, label: r.name, href: `/execution/rfqs/${r.id}`, meta: <StatusBadge status={r.stage} /> }))}
          />
          <RelatedSection
            title="Search surfaces"
            items={SearchSurfaces.byIds(component.searchSurfaceIds).map((s) => ({ id: s.id, label: s.name, href: `/knowledge/search-surfaces/${s.id}` }))}
          />
          <RelatedSection
            title="Outcomes"
            emptyLabel="No completed orders yet."
            items={relatedOutcomes.map(({ order, outcome }) => ({
              id: order.id,
              label: order.id,
              href: `/execution/orders/${order.id}`,
              meta: outcome ? (
                <StatusBadge status={outcome.onTime && outcome.qualityPass ? "pass" : outcome.qualityPass ? "on_time" : "fail"} />
              ) : (
                <StatusBadge status={order.status} />
              ),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return Components.all().map((item) => ({ id: item.id })); }
