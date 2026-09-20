import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { Competitors, Markets, Geographies } from "@/lib/data";

export default async function CompetitorDetailPage({ params }: PageProps<"/discovery/competitors/[id]">) {
  const { id } = await params;
  const competitor = Competitors.byId(id);
  if (!competitor) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Competitors", href: "/discovery/competitors" }, { label: competitor.name }]}
        eyebrow="Competitor"
        title={competitor.name}
        description={competitor.description}
        badges={<ProvenanceBadges record={competitor} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Panel title="Strengths">
              <ul className="list-disc space-y-1 pl-4 text-sm text-navy-900">
                {competitor.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Panel>
            <Panel title="Weaknesses">
              <ul className="list-disc space-y-1 pl-4 text-sm text-navy-900">
                {competitor.weaknesses.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Panel>
          </div>
          <EvidenceTrail record={competitor} />
        </div>
        <div className="space-y-5">
          <RelatedSection
            title="Markets"
            items={Markets.byIds(competitor.marketIds).map((m) => ({ id: m.id, label: m.name, href: `/discovery/market-intelligence` }))}
          />
          <RelatedSection
            title="Geographies"
            items={Geographies.byIds(competitor.geographyIds).map((g) => ({ id: g.id, label: g.name, href: `/knowledge/geographies/${g.id}` }))}
          />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return Competitors.all().map((item) => ({ id: item.id })); }
