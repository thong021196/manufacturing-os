import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { QcResults, Parts, Revisions, ProductionJobs } from "@/lib/data";

export default async function QcResultDetailPage({ params }: PageProps<"/execution/qc/[id]">) {
  const { id } = await params;
  const result = QcResults.byId(id);
  if (!result) notFound();

  const part = Parts.byId(result.partId);
  const revision = Revisions.byId(result.revisionId);
  const job = ProductionJobs.byId(result.productionJobId);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "QC / Inspection", href: "/execution/qc" }, { label: result.id }]}
        eyebrow="Inspection"
        title={`${part?.name ?? "Part"} — Rev ${revision?.revisionCode ?? "—"}`}
        description={result.notes}
        badges={
          <>
            <StatusBadge status={result.result} />
            <ProvenanceBadges record={result} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Measurements">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4 font-medium">Dimension</th>
                  <th className="py-2 pr-4 font-medium">Nominal</th>
                  <th className="py-2 pr-4 font-medium">Actual</th>
                  <th className="py-2 pr-4 font-medium">Within tolerance</th>
                </tr>
              </thead>
              <tbody>
                {result.measurements.map((m) => (
                  <tr key={m.dimension} className="border-b border-border last:border-b-0">
                    <td className="py-2.5 pr-4">{m.dimension}</td>
                    <td className="py-2.5 pr-4">{m.nominal}</td>
                    <td className="py-2.5 pr-4">{m.actual}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={m.withinTolerance ? "pass" : "fail"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <EvidenceTrail record={result} />
        </div>
        <div className="space-y-5">
          <RelatedSection title="Production job" items={job ? [{ id: job.id, label: job.id, href: `/execution/production/${job.id}` }] : []} />
          <RelatedSection title="Part" items={part ? [{ id: part.id, label: part.name, href: `/execution/cad-packages/${part.cadPackageId}` }] : []} />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return QcResults.all().map((item) => ({ id: item.id })); }
