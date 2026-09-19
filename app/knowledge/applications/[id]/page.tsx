import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { EvidenceTrail, ProvenanceBadges } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { Applications, Industries, Components, EngineeringProblems } from "@/lib/data";

export default async function ApplicationDetailPage({ params }: PageProps<"/knowledge/applications/[id]">) {
  const { id } = await params;
  const application = Applications.byId(id);
  if (!application) notFound();

  const industry = Industries.byId(application.industryId);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Applications", href: "/knowledge/applications" }, { label: application.name }]}
        eyebrow={industry?.name}
        title={application.name}
        description={application.description}
        badges={<ProvenanceBadges record={application} />}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Industry">
            <p className="text-sm text-navy-900">{industry?.name ?? "—"}</p>
            <p className="mt-1 text-xs text-muted">{industry?.description}</p>
          </Panel>
          <EvidenceTrail record={application} />
        </div>
        <div className="space-y-5">
          <RelatedSection
            title="Components"
            items={Components.byIds(application.componentIds).map((c) => ({ id: c.id, label: c.name, href: `/knowledge/components/${c.id}` }))}
          />
          <RelatedSection
            title="Engineering problems"
            items={EngineeringProblems.byIds(application.engineeringProblemIds).map((e) => ({ id: e.id, label: e.name, href: `/knowledge/engineering-problems/${e.id}` }))}
          />
        </div>
      </div>
    </div>
  );
}
