import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { CadPackages, Companies, Components, Opportunities, Parts, Revisions, Rfqs } from "@/lib/data";

export default async function CadPackageDetailPage({ params }: PageProps<"/execution/cad-packages/[id]">) {
  const { id } = await params;
  const cadPackage = CadPackages.byId(id);
  if (!cadPackage) notFound();

  const company = Companies.byId(cadPackage.companyId);
  const component = Components.byId(cadPackage.componentId);
  const parts = Parts.byIds(cadPackage.partIds);
  const rfq = cadPackage.rfqId ? Rfqs.byId(cadPackage.rfqId) : undefined;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "CAD Packages", href: "/execution/cad-packages" }, { label: cadPackage.name }]}
        eyebrow="CAD package"
        title={cadPackage.name}
        description={`Internal reference: ${cadPackage.internalFileRef} (access restricted, never publicly indexed)`}
        badges={
          <>
            <StatusBadge status={cadPackage.status} />
            <ProvenanceBadges record={cadPackage} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Package details">
            <MetaGrid
              fields={[
                { label: "Company", value: company?.name ?? "—" },
                { label: "Component", value: component?.name ?? "—" },
                { label: "Parts", value: parts.length },
              ]}
            />
          </Panel>

          <Panel title="Parts & current revisions">
            <ul className="divide-y divide-border">
              {parts.map((part) => {
                const revision = Revisions.byId(part.currentRevisionId);
                return (
                  <li key={part.id} className="py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-navy-800">{part.name}</span>
                      <span className="text-xs text-muted">
                        Rev {revision?.revisionCode} &middot; {part.revisionIds.length} revision{part.revisionIds.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {revision && <p className="mt-1 text-xs text-muted">{revision.changeSummary}</p>}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <EvidenceTrail record={cadPackage} />
        </div>

        <div className="space-y-5">
          <RelatedSection
            title="Opportunity"
            items={[Opportunities.byId(cadPackage.opportunityId)].filter(Boolean).map((o) => ({ id: o!.id, label: o!.name, href: `/discovery/opportunity-map/${o!.id}` }))}
          />
          <RelatedSection
            title="RFQ"
            items={rfq ? [{ id: rfq.id, label: rfq.name, href: `/execution/rfqs/${rfq.id}`, meta: <StatusBadge status={rfq.stage} /> }] : []}
          />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return CadPackages.all().map((item) => ({ id: item.id })); }
