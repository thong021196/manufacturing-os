import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Opportunities,
  Rfqs,
  Suppliers,
  SearchSurfaces,
  overviewStats,
  outcomeForOrder,
} from "@/lib/data";
import { Outcomes, Orders } from "@/lib/data";

export default function OverviewPage() {
  const stats = overviewStats();
  const activeOpportunities = Opportunities.where((o) => o.stage !== "won" && o.stage !== "lost").slice(0, 5);
  const openRfqs = Rfqs.all().filter((r) => !r.stage.startsWith("closed"));
  const suppliers = Suppliers.all();
  const surfaces = SearchSurfaces.all();
  const deliveredOrders = Orders.where((o) => o.status === "delivered");

  const rfqStageOrder = [
    "intake",
    "normalized",
    "supplier_matching",
    "quoting",
    "quoted",
    "closed_won",
    "closed_lost",
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="System operating summary"
        description="High-level view of the full Manufacturing OS loop: market demand, opportunities, RFQ pipeline, supplier coverage, search signals and outcomes. All data on this shell is seeded/mock and structured to be replaced by live Sanity/Postgres data."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active opportunities" value={stats.activeOpportunitiesCount} sub={`${stats.totalOpportunitiesCount} total`} tone="accent" />
        <StatCard label="Open RFQs" value={openRfqs.length} sub={`${stats.totalRfqs} total`} />
        <StatCard label="Qualified suppliers" value={stats.qualifiedSuppliers} sub={`${stats.totalSuppliers} tracked`} />
        <StatCard label="Qualified visitors / mo" value={stats.totalQualifiedVisitors} sub={`${stats.totalSearchVisitors} total visitors`} />
        <StatCard label="Orders delivered" value={stats.deliveredOrders} sub={`${stats.totalOrders} total orders`} />
        <StatCard
          label="Latest gross margin"
          value={stats.latestEconomics ? `${stats.latestEconomics.grossMarginPct.toFixed(1)}%` : "—"}
          sub={stats.latestEconomics ? stats.latestEconomics.period : undefined}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Active opportunities" description="Opportunities not yet won or lost, across all markets.">
          {activeOpportunities.length === 0 ? (
            <EmptyState label="No active opportunities." />
          ) : (
            <ul className="divide-y divide-border">
              {activeOpportunities.map((o) => (
                <li key={o.id} className="py-2.5">
                  <Link href={`/discovery/opportunity-map/${o.id}`} className="flex items-center justify-between gap-3 text-sm hover:text-accent">
                    <span>
                      <span className="font-medium text-navy-800">{o.name}</span>
                      <span className="ml-2 text-xs text-muted">${o.estValueUsd.toLocaleString()}</span>
                    </span>
                    <StatusBadge status={o.stage} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="RFQ pipeline" description="Distribution of RFQs across normalization, matching, quoting and close stages.">
          <ul className="space-y-2">
            {rfqStageOrder.map((stage) => {
              const count = stats.rfqStageCounts[stage] ?? 0;
              const max = Math.max(1, ...Object.values(stats.rfqStageCounts));
              return (
                <li key={stage} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 capitalize text-muted">{stage.replace(/_/g, " ")}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 shrink-0 text-right font-medium text-navy-800">{count}</span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Supplier coverage" description="Qualification status by supplier, spanning declared and observed capability.">
          <ul className="divide-y divide-border">
            {suppliers.map((s) => (
              <li key={s.id} className="py-2.5">
                <Link href={`/supply/suppliers/${s.id}`} className="flex items-center justify-between gap-3 text-sm hover:text-accent">
                  <span className="font-medium text-navy-800">{s.name}</span>
                  <StatusBadge status={s.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Search signals" description="Monthly visitors and qualified visitors per live search surface.">
          <ul className="divide-y divide-border">
            {surfaces.map((s) => (
              <li key={s.id} className="py-2.5">
                <Link href={`/knowledge/search-surfaces/${s.id}`} className="flex items-center justify-between gap-3 text-sm hover:text-accent">
                  <span className="font-medium text-navy-800">{s.name}</span>
                  <span className="text-xs text-muted">
                    {s.qualifiedVisitors} qualified / {s.monthlyVisitors} visitors
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Margin / outcome summary" description="Realized outcomes from completed orders, feeding demand and supplier learning.">
          {deliveredOrders.length === 0 ? (
            <EmptyState label="No delivered orders yet." />
          ) : (
            <div className="scrollbar-thin -mx-5 overflow-x-auto px-5">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-4 font-medium">Order</th>
                    <th className="py-2 pr-4 font-medium">Order value</th>
                    <th className="py-2 pr-4 font-medium">On time</th>
                    <th className="py-2 pr-4 font-medium">Quality pass</th>
                    <th className="py-2 pr-4 font-medium">Realized margin</th>
                    <th className="py-2 pr-4 font-medium">Repeat purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredOrders.map((order) => {
                    const outcome = outcomeForOrder(order.id);
                    return (
                      <tr key={order.id} className="border-b border-border last:border-b-0">
                        <td className="py-2.5 pr-4">
                          <Link href={`/execution/orders/${order.id}`} className="font-medium text-navy-800 hover:text-accent">
                            {order.id}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4">${order.orderValueUsd.toLocaleString()}</td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={!outcome ? "unknown" : outcome.onTime ? "on_time" : "late"} />
                        </td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={!outcome ? "unknown" : outcome.qualityPass ? "pass" : "fail"} />
                        </td>
                        <td className="py-2.5 pr-4">{outcome ? `${outcome.marginRealizedPct.toFixed(1)}%` : "—"}</td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={!outcome ? "unknown" : outcome.repeatPurchase ? "yes" : "not_yet"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {Outcomes.all().length > 0 && (
            <p className="mt-3 text-xs text-muted">
              Outcomes such as these continuously feed back into demand learning and supplier learning records under Intelligence.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
