import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EvidenceTrail, ProvenanceBadges } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { EngineeringProblems, Components, Applications } from "@/lib/data";

export default async function EngineeringProblemDetailPage({ params }: PageProps<"/knowledge/engineering-problems/[id]">) {
  const { id } = await params;
  const problem = EngineeringProblems.byId(id);
  if (!problem) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Engineering Problems", href: "/knowledge/engineering-problems" }, { label: problem.name }]}
        eyebrow="Engineering problem"
        title={problem.name}
        description={problem.description}
        badges={<ProvenanceBadges record={problem} />}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EvidenceTrail record={problem} />
        </div>
        <div className="space-y-5">
          <RelatedSection
            title="Components"
            items={Components.byIds(problem.componentIds).map((c) => ({ id: c.id, label: c.name, href: `/knowledge/components/${c.id}` }))}
          />
          <RelatedSection
            title="Applications"
            items={Applications.byIds(problem.applicationIds).map((a) => ({ id: a.id, label: a.name, href: `/knowledge/applications/${a.id}` }))}
          />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return EngineeringProblems.all().map((item) => ({ id: item.id })); }
