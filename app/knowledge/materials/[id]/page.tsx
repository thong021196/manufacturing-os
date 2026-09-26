import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { Materials, Components, Processes } from "@/lib/data";

export default async function MaterialDetailPage({ params }: PageProps<"/knowledge/materials/[id]">) {
  const { id } = await params;
  const material = Materials.byId(id);
  if (!material) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Materials", href: "/knowledge/materials" }, { label: material.name }]}
        eyebrow={material.category}
        title={material.name}
        badges={<ProvenanceBadges record={material} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Properties">
            <MetaGrid fields={Object.entries(material.properties).map(([label, value]) => ({ label, value }))} />
          </Panel>
          <EvidenceTrail record={material} />
        </div>
        <div className="space-y-5">
          <RelatedSection
            title="Components"
            items={Components.byIds(material.componentIds).map((c) => ({ id: c.id, label: c.name, href: `/knowledge/components/${c.id}` }))}
          />
          <RelatedSection
            title="Compatible processes"
            items={Processes.byIds(material.processIds).map((p) => ({ id: p.id, label: p.name, href: `/knowledge/processes/${p.id}` }))}
          />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return Materials.all().map((item) => ({ id: item.id })); }
