import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { StatusBadge, CapabilityLayerBadge, SourceBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { StatCard } from "@/components/ui/stat-card";
import {
  Suppliers,
  Geographies,
  Components,
  Processes,
  SupplierCapabilities,
  SupplierMachineEvidences,
  SupplierPerformances,
  ordersForSupplier,
} from "@/lib/data";

export default async function SupplierDetailPage({ params }: PageProps<"/supply/suppliers/[id]">) {
  const { id } = await params;
  const supplier = Suppliers.byId(id);
  if (!supplier) notFound();

  const geography = Geographies.byId(supplier.geographyId);
  const declared = SupplierCapabilities.byIds(supplier.declaredCapabilityIds);
  const observed = SupplierCapabilities.byIds(supplier.observedCapabilityIds);
  const machineEvidence = SupplierMachineEvidences.byIds(supplier.machineEvidenceIds);
  const performance = SupplierPerformances.byId(supplier.performanceId);
  const orders = ordersForSupplier(supplier.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suppliers", href: "/supply/suppliers" }, { label: supplier.name }]}
        eyebrow={geography?.name}
        title={supplier.name}
        description={supplier.description}
        badges={
          <>
            <StatusBadge status={supplier.status} />
            <ProvenanceBadges record={supplier} />
          </>
        }
      />

      {performance && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="On-time rate" value={performance.totalOrders > 0 ? `${performance.onTimeRatePct}%` : "—"} />
          <StatCard label="Quality score" value={performance.totalOrders > 0 ? `${performance.qualityScorePct}%` : "—"} />
          <StatCard label="Avg lead time" value={performance.totalOrders > 0 ? `${performance.avgLeadTimeDays}d` : "—"} />
          <StatCard label="Completed orders" value={performance.totalOrders} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Declared capability" description="Self-reported by the supplier via questionnaire or website; not yet independently confirmed.">
            {declared.length === 0 ? (
              <p className="text-sm text-muted">None declared yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {declared.map((cap) => (
                  <li key={cap.id} className="py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-navy-800">{Processes.byId(cap.processId)?.name}</span>
                      <CapabilityLayerBadge layer={cap.layer} />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {cap.notes} {cap.toleranceMm != null && `· ±${cap.toleranceMm}mm · ${cap.maxPartSizeMm}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Observed capability" description="Confirmed by production and QC evidence across completed orders.">
            {observed.length === 0 ? (
              <p className="text-sm text-muted">No production evidence yet — capability remains unconfirmed.</p>
            ) : (
              <ul className="divide-y divide-border">
                {observed.map((cap) => (
                  <li key={cap.id} className="py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-navy-800">{Processes.byId(cap.processId)?.name}</span>
                      <CapabilityLayerBadge layer={cap.layer} />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {cap.notes} {cap.toleranceMm != null && `· ±${cap.toleranceMm}mm · ${cap.maxPartSizeMm}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Machine / process evidence">
            {machineEvidence.length === 0 ? (
              <p className="text-sm text-muted">No equipment evidence on file.</p>
            ) : (
              <ul className="divide-y divide-border">
                {machineEvidence.map((m) => (
                  <li key={m.id} className="py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-navy-800">{m.machineType}</span>
                      <SourceBadge source={m.source} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{m.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <EvidenceTrail record={supplier} />
        </div>

        <div className="space-y-5">
          <RelatedSection
            title="Components supplied"
            items={Components.byIds(supplier.componentIds).map((c) => ({ id: c.id, label: c.name, href: `/knowledge/components/${c.id}` }))}
          />
          <RelatedSection
            title="Orders"
            items={orders.map((o) => ({ id: o.id, label: o.id, href: `/execution/orders/${o.id}`, meta: <StatusBadge status={o.status} /> }))}
          />
        </div>
      </div>
    </div>
  );
}
