import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { Orders, Companies, Suppliers, Components, CustomerQuotes, productionJobForOrder, outcomeForOrder } from "@/lib/data";

export default async function OrderDetailPage({ params }: PageProps<"/execution/orders/[id]">) {
  const { id } = await params;
  const order = Orders.byId(id);
  if (!order) notFound();

  const company = Companies.byId(order.companyId);
  const supplier = Suppliers.byId(order.supplierId);
  const component = Components.byId(order.componentId);
  const customerQuote = CustomerQuotes.byId(order.customerQuoteId);
  const productionJob = productionJobForOrder(order.id);
  const outcome = outcomeForOrder(order.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Orders", href: "/execution/orders" }, { label: order.id }]}
        eyebrow="Order"
        title={`${company?.name ?? "Company"} — ${component?.name ?? "Component"}`}
        badges={
          <>
            <StatusBadge status={order.status} />
            <ProvenanceBadges record={order} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Order details">
            <MetaGrid
              fields={[
                { label: "Company", value: company?.name ?? "—" },
                { label: "Supplier", value: supplier?.name ?? "—" },
                { label: "Component", value: component?.name ?? "—" },
                { label: "Order value", value: `$${order.orderValueUsd.toLocaleString()}` },
              ]}
            />
          </Panel>

          {outcome && (
            <Panel title="Outcome" description="Real production outcome feeding demand and supplier learning.">
              <MetaGrid
                fields={[
                  { label: "On time", value: <StatusBadge status={outcome.onTime ? "on_time" : "late"} /> },
                  { label: "Quality pass", value: <StatusBadge status={outcome.qualityPass ? "pass" : "fail"} /> },
                  { label: "Actual lead time", value: `${outcome.actualLeadTimeDays} days` },
                  { label: "Realized margin", value: `${outcome.marginRealizedPct}%` },
                  { label: "Repeat purchase", value: <StatusBadge status={outcome.repeatPurchase ? "yes" : "not_yet"} /> },
                ]}
              />
              <p className="mt-3 text-sm text-muted">{outcome.feedback}</p>
            </Panel>
          )}

          <EvidenceTrail record={order} />
        </div>

        <div className="space-y-5">
          <RelatedSection
            title="Customer quote"
            items={customerQuote ? [{ id: customerQuote.id, label: customerQuote.id, href: `/execution/customer-quotes/${customerQuote.id}` }] : []}
          />
          <RelatedSection
            title="Production job"
            items={productionJob ? [{ id: productionJob.id, label: productionJob.id, href: `/execution/production/${productionJob.id}`, meta: <StatusBadge status={productionJob.stage} /> }] : []}
          />
        </div>
      </div>
    </div>
  );
}
