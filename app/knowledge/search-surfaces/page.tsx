import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { SearchSurfaces, Components, Geographies } from "@/lib/data";

export default function SearchSurfacesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Search Surfaces"
        description="Public pages that convert search demand into qualified visitors and, eventually, CAD uploads. Each surface is scoped to a geography/locale for the US + Australia strategy, with an explicit indexing state. Search demand and paid demand are tracked as distinct layers, never conflated."
      />
      <Panel>
        <DataTable
          rowHref={(s) => `/knowledge/search-surfaces/${s.id}`}
          columns={[
            { header: "Surface", cell: (s) => s.name },
            { header: "Slug", cell: (s) => <code className="text-xs text-muted">{s.slug}</code> },
            { header: "Geography", cell: (s) => Geographies.byId(s.geographyId)?.name ?? "—" },
            { header: "Locale", cell: (s) => s.locale },
            { header: "Component", cell: (s) => Components.byIds(s.componentIds).map((c) => c.name).join(", ") || "—" },
            { header: "Monthly visitors", cell: (s) => s.monthlyVisitors.toLocaleString() },
            { header: "Qualified visitors", cell: (s) => s.qualifiedVisitors.toLocaleString() },
            { header: "Index state", cell: (s) => <StatusBadge status={s.indexState} /> },
            { header: "Status", cell: (s) => <StatusBadge status={s.status} /> },
          ]}
          rows={SearchSurfaces.all()}
        />
      </Panel>
    </div>
  );
}
