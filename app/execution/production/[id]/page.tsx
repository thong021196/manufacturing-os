import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { ProductionJobs, Suppliers, Parts, Revisions, Orders, qcResultForProductionJob } from "@/lib/data";

export default async function ProductionJobDetailPage({ params }: PageProps<"/execution/production/[id]">) {
  const { id } = await params;
  const job = ProductionJobs.byId(id);
  if (!job) notFound();

  const supplier = Suppliers.byId(job.supplierId);
  const part = Parts.byId(job.partId);
  const revision = Revisions.byId(job.revisionId);
  const order = Orders.byId(job.orderId);
  const qcResult = qcResultForProductionJob(job.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Production", href: "/execution/production" }, { label: job.id }]}
        eyebrow="Production job"
        title={`${part?.name ?? "Part"} @ ${supplier?.name ?? "Supplier"}`}
        description={`Manufactured against revision ${revision?.revisionCode ?? "—"} — released files are immutable; this job points to the exact revision used.`}
        badges={
          <>
            <StatusBadge status={job.stage} />
            <ProvenanceBadges record={job} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Job details">
            <MetaGrid
              fields={[
                { label: "Supplier", value: supplier?.name ?? "—" },
                { label: "Part", value: part?.name ?? "—" },
                { label: "Revision", value: revision?.revisionCode ?? "—" },
                { label: "Start date", value: job.startDate },
                { label: "Due date", value: job.dueDate },
              ]}
            />
          </Panel>
          <EvidenceTrail record={job} />
        </div>
        <div className="space-y-5">
          <RelatedSection title="Order" items={order ? [{ id: order.id, label: order.id, href: `/execution/orders/${order.id}` }] : []} />
          <RelatedSection
            title="QC result"
            items={qcResult ? [{ id: qcResult.id, label: qcResult.id, href: `/execution/qc/${qcResult.id}`, meta: <StatusBadge status={qcResult.result} /> }] : []}
          />
          <RelatedSection
            title="Revision"
            items={revision ? [{ id: revision.id, label: `Rev ${revision.revisionCode}`, href: `/intelligence/revisions#${revision.id}` }] : []}
          />
        </div>
      </div>
    </div>
  );
}
