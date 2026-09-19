import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { MetaGrid } from "@/components/ui/meta-grid";
import { StatusBadge } from "@/components/ui/badges";
import { ProvenanceBadges, EvidenceTrail } from "@/components/ui/provenance";
import { RelatedSection } from "@/components/ui/related-section";
import { SearchSurfaces, SearchQueries, Components, Geographies, searchPerformanceForSurface } from "@/lib/data";

export default async function SearchSurfaceDetailPage({ params }: PageProps<"/knowledge/search-surfaces/[id]">) {
  const { id } = await params;
  const surface = SearchSurfaces.byId(id);
  if (!surface) notFound();

  const performance = searchPerformanceForSurface(surface.id);
  const geography = Geographies.byId(surface.geographyId);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Search Surfaces", href: "/knowledge/search-surfaces" }, { label: surface.name }]}
        eyebrow="Search surface"
        title={surface.name}
        description={surface.slug}
        badges={
          <>
            <StatusBadge status={surface.status} />
            <StatusBadge status={surface.indexState} />
            <ProvenanceBadges record={surface} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Traffic">
            <MetaGrid
              fields={[
                { label: "Geography", value: geography?.name ?? "—" },
                { label: "Locale", value: surface.locale },
                { label: "Canonical surface", value: surface.canonical ? "Yes" : "No — duplicate/localized variant" },
                { label: "Monthly visitors", value: surface.monthlyVisitors.toLocaleString() },
                { label: "Qualified visitors", value: surface.qualifiedVisitors.toLocaleString() },
              ]}
            />
          </Panel>

          <Panel title="Search performance history">
            {performance.length === 0 ? (
              <p className="text-sm text-muted">No performance records yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-4 font-medium">Period</th>
                    <th className="py-2 pr-4 font-medium">Impressions</th>
                    <th className="py-2 pr-4 font-medium">Clicks</th>
                    <th className="py-2 pr-4 font-medium">Qualified visitors</th>
                    <th className="py-2 pr-4 font-medium">CAD uploads</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-b-0">
                      <td className="py-2.5 pr-4">{p.period}</td>
                      <td className="py-2.5 pr-4">{p.impressions.toLocaleString()}</td>
                      <td className="py-2.5 pr-4">{p.clicks.toLocaleString()}</td>
                      <td className="py-2.5 pr-4">{p.qualifiedVisitors.toLocaleString()}</td>
                      <td className="py-2.5 pr-4">{p.cadUploads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <EvidenceTrail record={surface} />
        </div>
        <div className="space-y-5">
          <RelatedSection
            title="Components"
            items={Components.byIds(surface.componentIds).map((c) => ({ id: c.id, label: c.name, href: `/knowledge/components/${c.id}` }))}
          />
          <RelatedSection
            title="Search queries"
            items={SearchQueries.byIds(surface.searchQueryIds).map((q) => ({ id: q.id, label: q.query, meta: `${q.volumeMonthly}/mo`, href: `/knowledge/search-surfaces/${surface.id}` }))}
          />
        </div>
      </div>
    </div>
  );
}
