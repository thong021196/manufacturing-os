import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { Geographies, Markets, Suppliers } from "@/lib/data";

export default async function GeographyDetailPage({ params }: PageProps<"/knowledge/geographies/[id]">) {
  const { id } = await params;
  const geography = Geographies.byId(id);
  if (!geography) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Geographies", href: "/knowledge/geographies" }, { label: geography.name }]}
        eyebrow={geography.country}
        title={geography.name}
        badges={<ProvenanceBadges record={geography} />}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Details">
            <MetaGrid fields={[{ label: "Region", value: geography.region }, { label: "Country", value: geography.country }]} />
          </Panel>
          <EvidenceTrail record={geography} />
        </div>
        <div className="space-y-5">
          <RelatedSection
            title="Markets"
            items={Markets.byIds(geography.marketIds).map((m) => ({ id: m.id, label: m.name, href: "/discovery/market-intelligence" }))}
          />
          <RelatedSection
            title="Suppliers"
            items={Suppliers.byIds(geography.supplierIds).map((s) => ({ id: s.id, label: s.name, href: `/supply/suppliers/${s.id}` }))}
          />
        </div>
      </div>
    </div>
  );
}
