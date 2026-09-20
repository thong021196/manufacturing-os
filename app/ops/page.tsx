import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badges";
import { Opportunities, Rfqs, overviewStats } from "@/lib/data";

export default function OperationsOverviewPage() {
  const stats = overviewStats();
  const opportunities = Opportunities.where((item) => item.stage !== "won" && item.stage !== "lost").slice(0, 5);
  const rfqs = Rfqs.all().filter((item) => !item.stage.startsWith("closed"));
  return <div><PageHeader eyebrow="Operations" title="System operating summary" description="Internal view of demand, RFQ pipeline, supplier coverage, and outcomes. Public technical pages live at the root." /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"><StatCard label="Active opportunities" value={stats.activeOpportunitiesCount} sub={`${stats.totalOpportunitiesCount} total`} tone="accent" /><StatCard label="Open RFQs" value={rfqs.length} sub={`${stats.totalRfqs} total`} /><StatCard label="Qualified suppliers" value={stats.qualifiedSuppliers} sub={`${stats.totalSuppliers} tracked`} /><StatCard label="Qualified visitors / mo" value={stats.totalQualifiedVisitors} sub={`${stats.totalSearchVisitors} total visitors`} /><StatCard label="Orders delivered" value={stats.deliveredOrders} sub={`${stats.totalOrders} total orders`} /><StatCard label="Latest gross margin" value={stats.latestEconomics ? `${stats.latestEconomics.grossMarginPct.toFixed(1)}%` : "—"} sub={stats.latestEconomics?.period} /></div><div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2"><Panel title="Active opportunities" description="Opportunities not yet won or lost."><ul className="divide-y divide-border">{opportunities.map((item) => <li key={item.id} className="py-2.5"><Link href={`/discovery/opportunity-map/${item.id}`} className="flex items-center justify-between gap-3 text-sm hover:text-accent"><span className="font-medium text-navy-800">{item.name}</span><StatusBadge status={item.stage} /></Link></li>)}</ul></Panel><Panel title="RFQ pipeline" description="Current work awaiting normalization, matching, or quoting."><ul className="divide-y divide-border">{rfqs.map((item) => <li key={item.id} className="py-2.5"><Link href={`/execution/rfqs/${item.id}`} className="flex items-center justify-between gap-3 text-sm hover:text-accent"><span className="font-medium text-navy-800">{item.name}</span><StatusBadge status={item.stage} /></Link></li>)}</ul></Panel></div></div>;
}
