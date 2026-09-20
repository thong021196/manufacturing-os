import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { SupplierQuotes, Suppliers, Rfqs, Materials, Revisions } from "@/lib/data";

export default async function SupplierQuoteDetailPage({ params }: PageProps<"/execution/supplier-quotes/[id]">) {
  const { id } = await params;
  const quote = SupplierQuotes.byId(id);
  if (!quote) notFound();

  const supplier = Suppliers.byId(quote.supplierId);
  const rfq = Rfqs.byId(quote.rfqId);
  const material = Materials.byId(quote.materialId);
  const revision = Revisions.byId(quote.revisionId);

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
          <Panel title="Quote details" description="Normalized fields so quotes can be compared apples-to-apples across suppliers.">
            <MetaGrid
              fields={[
                { label: "Unit price", value: `${quote.currency} $${quote.unitPriceUsd}` },
                { label: "Tooling / NRE", value: quote.toolingNreUsd > 0 ? `$${quote.toolingNreUsd}` : "None" },
                { label: "Quantity", value: quote.quantity },
                { label: "MOQ", value: quote.moq },
                { label: "Lead time", value: `${quote.leadTimeDays} days` },
                { label: "Revision quoted", value: revision ? `Rev ${revision.revisionCode}` : "—" },
                { label: "Material", value: material?.name ?? "—" },
                { label: "Finish", value: quote.finish },
                { label: "Inspection scope", value: quote.inspectionScope },
                { label: "Shipping / freight", value: `$${quote.shippingFreightUsd}` },
                { label: "Incoterm", value: quote.incoterm },
                { label: "Payment terms", value: quote.paymentTerms },
                { label: "Quote valid until", value: quote.quoteValidUntil },
                { label: "Total value", value: `$${(quote.unitPriceUsd * quote.quantity + quote.toolingNreUsd + quote.shippingFreightUsd).toLocaleString()}` },
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
export function generateStaticParams() { return SupplierQuotes.all().map((item) => ({ id: item.id })); }
