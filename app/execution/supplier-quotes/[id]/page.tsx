import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { SupplierQuotes, Suppliers, Rfqs } from "@/lib/data";

export default async function SupplierQuoteDetailPage({ params }: PageProps<"/execution/supplier-quotes/[id]">) {
  const { id } = await params;
  const quote = SupplierQuotes.byId(id);
  if (!quote) notFound();

  const supplier = Suppliers.byId(quote.supplierId);
  const rfq = Rfqs.byId(quote.rfqId);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Supplier Quotes", href: "/execution/supplier-quotes" }, { label: quote.id }]}
        eyebrow="Supplier quote"
        title={`${supplier?.name ?? "Supplier"} → ${rfq?.name ?? "RFQ"}`}
        description={quote.notes}
        badges={
          <>
            {quote.selected && <StatusBadge status="selected" />}
            <StatusBadge status={quote.status} />
            <ProvenanceBadges record={quote} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Quote details">
            <MetaGrid
              fields={[
                { label: "Unit price", value: `$${quote.unitPriceUsd}` },
                { label: "Quantity", value: quote.quantity },
                { label: "Lead time", value: `${quote.leadTimeDays} days` },
                { label: "Total value", value: `$${(quote.unitPriceUsd * quote.quantity).toLocaleString()}` },
              ]}
            />
          </Panel>
          <EvidenceTrail record={quote} />
        </div>
        <div className="space-y-5">
          <RelatedSection title="Supplier" items={supplier ? [{ id: supplier.id, label: supplier.name, href: `/supply/suppliers/${supplier.id}` }] : []} />
          <RelatedSection
            title="RFQ"
            items={rfq ? [{ id: rfq.id, label: rfq.name, href: `/execution/rfqs/${rfq.id}`, meta: <StatusBadge status={rfq.stage} /> }] : []}
          />
        </div>
      </div>
    </div>
  );
}
