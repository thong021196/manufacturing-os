import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { Rfqs, Companies, Components, CadPackages, Suppliers, supplierQuotesForRfq, CustomerQuotes } from "@/lib/data";

export default async function RfqDetailPage({ params }: PageProps<"/execution/rfqs/[id]">) {
  const { id } = await params;
  const rfq = Rfqs.byId(id);
  if (!rfq) notFound();

  const company = Companies.byId(rfq.companyId);
  const component = Components.byId(rfq.componentId);
  const cadPackage = CadPackages.byId(rfq.cadPackageId);
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
            <ProvenanceBadges record={rfq} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="RFQ details">
            <MetaGrid
              fields={[
                { label: "Company", value: company?.name ?? "—" },
                { label: "Component", value: component?.name ?? "—" },
                { label: "Quantity", value: rfq.quantity },
                { label: "Target unit price", value: rfq.targetUnitPriceUsd ? `$${rfq.targetUnitPriceUsd}` : "—" },
                { label: "Due date", value: rfq.dueDate },
              ]}
            />
          </Panel>

          <Panel title="Supplier quotes" description="All quotes received against this RFQ; the selected quote feeds the customer quote below.">
            {quotes.length === 0 ? (
              <p className="text-sm text-muted">No supplier quotes yet.</p>
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
                        ${q.unitPriceUsd}/unit &middot; {q.leadTimeDays} day lead time &middot; {q.notes}
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
