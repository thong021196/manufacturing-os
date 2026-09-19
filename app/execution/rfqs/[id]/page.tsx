import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Rfqs,
  Companies,
  Components,
  CadPackages,
  Suppliers,
  Materials,
  Processes,
  Parts,
  Revisions,
  supplierQuotesForRfq,
  CustomerQuotes,
} from "@/lib/data";

export default async function RfqDetailPage({ params }: PageProps<"/execution/rfqs/[id]">) {
  const { id } = await params;
  const rfq = Rfqs.byId(id);
  if (!rfq) notFound();

  const company = Companies.byId(rfq.companyId);
  const component = Components.byId(rfq.componentId);
  const cadPackage = CadPackages.byId(rfq.cadPackageId);
  const part = Parts.byId(rfq.partId);
  const revision = Revisions.byId(rfq.revisionId);
  const material = Materials.byId(rfq.materialId);
  const process = Processes.byId(rfq.processId);
  const quotes = supplierQuotesForRfq(rfq.id);
  const customerQuote = rfq.customerQuoteId ? CustomerQuotes.byId(rfq.customerQuoteId) : undefined;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "RFQs", href: "/execution/rfqs" }, { label: rfq.name }]}
        eyebrow="RFQ"
        title={rfq.name}
        badges={
          <>
            <StatusBadge status={rfq.stage} />
            <StatusBadge status={rfq.readinessState} />
            <ProvenanceBadges record={rfq} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="RFQ details" description="Part and revision bindings are immutable — they do not follow the part's current revision if it later advances.">
            <MetaGrid
              fields={[
                { label: "Company", value: company?.name ?? "—" },
                { label: "Component", value: component?.name ?? "—" },
                { label: "Part", value: part?.name ?? "—" },
                { label: "Revision priced", value: revision ? `Rev ${revision.revisionCode}` : "—" },
                { label: "Material", value: material?.name ?? "—" },
                { label: "Process", value: process?.name ?? "—" },
                { label: "Finish", value: rfq.finish },
                { label: "Quantity", value: rfq.quantity },
                { label: "Target unit price", value: rfq.targetUnitPriceUsd ? `$${rfq.targetUnitPriceUsd}` : "—" },
                { label: "Due date", value: rfq.dueDate },
                { label: "Inspection requirement", value: rfq.inspectionRequirement },
                { label: "Delivery requirement", value: rfq.deliveryRequirement },
              ]}
            />
          </Panel>

          <Panel title="Requirements, gaps & assumptions" description="What must be true before this RFQ can be released to suppliers with confidence.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Critical requirements</p>
                {rfq.criticalRequirements.length === 0 ? (
                  <p className="mt-1 text-sm text-muted">None called out.</p>
                ) : (
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-navy-900">
                    {rfq.criticalRequirements.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Missing information</p>
                {rfq.missingInformation.length === 0 ? (
                  <p className="mt-1 text-sm text-muted">Nothing outstanding.</p>
                ) : (
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-warning">
                    {rfq.missingInformation.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Conflicts</p>
                {rfq.conflicts.length === 0 ? (
                  <p className="mt-1 text-sm text-muted">None identified.</p>
                ) : (
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-danger">
                    {rfq.conflicts.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {rfq.assumptions.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Assumptions</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted">
                  {rfq.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          <Panel title="Supplier quotes" description="All quotes received against this RFQ; the selected quote feeds the customer quote below.">
            {quotes.length === 0 ? (
              <EmptyState label="No supplier quotes yet." />
            ) : (
              <ul className="divide-y divide-border">
                {quotes.map((q) => {
                  const supplier = Suppliers.byId(q.supplierId);
                  return (
                    <li key={q.id} className="py-2.5 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-navy-800">{supplier?.name}</span>
                        <span className="flex items-center gap-2">
                          {q.selected && <StatusBadge status="selected" />}
                          <StatusBadge status={q.status} />
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {q.currency} ${q.unitPriceUsd}/unit &middot; {q.leadTimeDays} day lead time &middot; MOQ {q.moq} &middot; {q.incoterm} &middot; {q.notes}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <EvidenceTrail record={rfq} />
        </div>

        <div className="space-y-5">
          <RelatedSection
            title="CAD package"
            items={cadPackage ? [{ id: cadPackage.id, label: cadPackage.name, href: `/execution/cad-packages/${cadPackage.id}` }] : []}
          />
          <RelatedSection
            title="Customer quote"
            items={
              customerQuote
                ? [{ id: customerQuote.id, label: customerQuote.id, href: `/execution/customer-quotes/${customerQuote.id}`, meta: <StatusBadge status={customerQuote.status} /> }]
                : []
            }
          />
        </div>
      </div>
    </div>
  );
}
