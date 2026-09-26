import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { CapabilityLayerBadge } from "@/components/ui/badges";
import { Processes, Components, Materials, SupplierCapabilities, Suppliers } from "@/lib/data";

export default async function ProcessDetailPage({ params }: PageProps<"/knowledge/processes/[id]">) {
  const { id } = await params;
  const process = Processes.byId(id);
  if (!process) notFound();

  const capabilities = SupplierCapabilities.byIds(process.supplierCapabilityIds);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Processes", href: "/knowledge/processes" }, { label: process.name }]}
        eyebrow={process.category}
        title={process.name}
        description={process.description}
        badges={<ProvenanceBadges record={process} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Supplier capabilities" description="Declared vs. observed capability for this process, by supplier.">
            {capabilities.length === 0 ? (
              <p className="text-sm text-muted">No supplier capability records yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {capabilities.map((cap) => {
                  const supplier = Suppliers.byId(cap.supplierId);
                  return (
                    <li key={cap.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="font-medium text-navy-800">{supplier?.name ?? cap.supplierId}</span>
                      <span className="flex items-center gap-2">
                        <CapabilityLayerBadge layer={cap.layer} />
                        <span className="text-xs text-muted">
                          {cap.toleranceMm != null ? `±${cap.toleranceMm}mm` : ""}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
          <EvidenceTrail record={process} />
        </div>
        <div className="space-y-5">
          <RelatedSection
            title="Components"
            items={Components.byIds(process.componentIds).map((c) => ({ id: c.id, label: c.name, href: `/knowledge/components/${c.id}` }))}
          />
          <RelatedSection
            title="Materials"
            items={Materials.byIds(process.materialIds).map((m) => ({ id: m.id, label: m.name, href: `/knowledge/materials/${m.id}` }))}
          />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return Processes.all().map((item) => ({ id: item.id })); }
