import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { ProvenanceBadges } from "@/components/ui/provenance";
import { Markets, Industries, Geographies } from "@/lib/data";

export default function MarketIntelligencePage() {
  const markets = Markets.all();
  const industries = Industries.all();

  return (
    <div>
      <PageHeader
        eyebrow="Discovery"
        title="Market Intelligence"
        description="Sized, geography-scoped markets that frame where opportunity and demand data is collected. Market sizing is AI-inferred from public data until it is independently verified."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {markets.map((market) => {
          const geos = Geographies.byIds(market.geographyIds);
          const inds = Industries.byIds(market.industryIds);
          return (
            <Panel key={market.id} title={market.name} description={market.description}>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <ProvenanceBadges record={market} />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Estimated size</dt>
                  <dd className="mt-0.5 font-medium text-navy-900">${(market.sizeUsd / 1_000_000).toFixed(0)}M</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Growth rate</dt>
                  <dd className="mt-0.5 font-medium text-navy-900">{market.growthRatePct}% YoY</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Industries</dt>
                  <dd className="mt-0.5 text-navy-900">{inds.map((i) => i.name).join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Geographies</dt>
                  <dd className="mt-0.5 text-navy-900">{geos.map((g) => g.name).join(", ") || "—"}</dd>
                </div>
              </dl>
            </Panel>
          );
        })}
      </div>

      <div className="mt-5">
        <Panel title="Industries" description="Industry segments observed across tracked markets.">
          <DataTable
            columns={[
              { header: "Industry", cell: (i) => i.name },
              { header: "Description", cell: (i) => <span className="whitespace-normal text-muted">{i.description}</span> },
              { header: "Markets", cell: (i) => Markets.byIds(i.marketIds).map((m) => m.name).join(", ") },
            ]}
            rows={industries}
          />
        </Panel>
      </div>
    </div>
  );
}
