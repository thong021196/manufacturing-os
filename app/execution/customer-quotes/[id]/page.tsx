import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { CustomerQuotes, Companies, Rfqs, SupplierQuotes, Orders, Revisions } from "@/lib/data";

export default async function CustomerQuoteDetailPage({ params }: PageProps<"/execution/customer-quotes/[id]">) {
  const { id } = await params;
  const quote = CustomerQuotes.byId(id);
  if (!quote) notFound();

  const company = Companies.byId(quote.companyId);
  const rfq = Rfqs.byId(quote.rfqId);
  const supplierQuote = SupplierQuotes.byId(quote.supplierQuoteId);
  const order = quote.orderId ? Orders.byId(quote.orderId) : undefined;
  const revision = Revisions.byId(quote.revisionId);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Customer Quotes", href: "/execution/customer-quotes" }, { label: quote.id }]}
        eyebrow="Customer quote"
        title={`${company?.name ?? "Company"} — ${rfq?.name ?? "RFQ"}`}
        badges={
          <>
            <StatusBadge status={quote.status} />
            <ProvenanceBadges record={quote} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Quote economics">
            <MetaGrid
              fields={[
                { label: "Sell unit price", value: `$${quote.sellUnitPriceUsd}` },
                { label: "Supplier unit price", value: supplierQuote ? `$${supplierQuote.unitPriceUsd}` : "—" },
                { label: "Margin", value: `${quote.marginPct}%` },
                { label: "Revision quoted", value: revision ? `Rev ${revision.revisionCode}` : "—" },
              ]}
            />
          </Panel>
          <EvidenceTrail record={quote} />
        </div>
        <div className="space-y-5">
          <RelatedSection title="Company" items={company ? [{ id: company.id, label: company.name, href: `/execution/rfqs/${rfq?.id ?? ""}` }] : []} />
          <RelatedSection
            title="Source supplier quote"
            items={supplierQuote ? [{ id: supplierQuote.id, label: supplierQuote.id, href: `/execution/supplier-quotes/${supplierQuote.id}` }] : []}
          />
          <RelatedSection
            title="Order"
            items={order ? [{ id: order.id, label: order.id, href: `/execution/orders/${order.id}`, meta: <StatusBadge status={order.status} /> }] : []}
          />
        </div>
      </div>
    </div>
  );
}
export function generateStaticParams() { return CustomerQuotes.all().map((item) => ({ id: item.id })); }
