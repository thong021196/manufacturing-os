import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { SearchPerformance, SearchSurfaces } from "@/lib/data";

export default function SearchPerformancePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Search Performance"
        description="Monthly search-surface performance: impressions, clicks, qualified visitors and resulting CAD uploads."
      />
      <Panel>
        <DataTable
          columns={[
            {
              header: "Surface",
              cell: (r) => {
                const surface = SearchSurfaces.byId(r.searchSurfaceId);
                return surface ? (
                  <Link href={`/knowledge/search-surfaces/${surface.id}`} className="font-medium text-navy-800 hover:text-accent">
                    {surface.name}
                  </Link>
                ) : (
                  r.searchSurfaceId
                );
              },
            },
            { header: "Period", cell: (r) => r.period },
            { header: "Impressions", cell: (r) => r.impressions.toLocaleString() },
            { header: "Clicks", cell: (r) => r.clicks.toLocaleString() },
            { header: "Qualified visitors", cell: (r) => r.qualifiedVisitors.toLocaleString() },
            { header: "CAD uploads", cell: (r) => r.cadUploads },
          ]}
          rows={SearchPerformance.all()}
        />
      </Panel>
    </div>
  );
}
