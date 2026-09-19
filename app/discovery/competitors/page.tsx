import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { ConfidenceBadge } from "@/components/ui/badges";
import { Competitors, Markets } from "@/lib/data";

export default function CompetitorsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Discovery"
        title="Competitors"
        description="Known competitive alternatives per market, with strengths and weaknesses relative to a curated, evidence-backed supplier network."
      />
      <Panel>
        <DataTable
          rowHref={(c) => `/discovery/competitors/${c.id}`}
          columns={[
            { header: "Competitor", cell: (c) => c.name },
            { header: "Markets", cell: (c) => Markets.byIds(c.marketIds).map((m) => m.name).join(", ") },
            { header: "Confidence", cell: (c) => <ConfidenceBadge level={c.confidence} /> },
          ]}
          rows={Competitors.all()}
        />
      </Panel>
    </div>
  );
}
