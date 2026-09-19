import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import {
  Markets,
  Industries,
  Applications,
  Components,
  Materials,
  Processes,
  EngineeringProblems,
  Geographies,
  SearchSurfaces,
  Suppliers,
} from "@/lib/data";

const nodes = [
  { label: "Markets", href: "/discovery/market-intelligence", count: () => Markets.all().length, desc: "Sized, geography-scoped demand segments." },
  { label: "Industries", href: "/discovery/market-intelligence", count: () => Industries.all().length, desc: "Industry classification for applications and companies." },
  { label: "Applications", href: "/knowledge/applications", count: () => Applications.all().length, desc: "How components get used inside customer products." },
  { label: "Components", href: "/knowledge/components", count: () => Components.all().length, desc: "The physical parts customers actually request quotes for." },
  { label: "Engineering Problems", href: "/knowledge/engineering-problems", count: () => EngineeringProblems.all().length, desc: "Recurring technical challenges tied to components and applications." },
  { label: "Materials", href: "/knowledge/materials", count: () => Materials.all().length, desc: "Material specifications used to manufacture components." },
  { label: "Processes", href: "/knowledge/processes", count: () => Processes.all().length, desc: "Manufacturing processes capable of producing components in given materials." },
  { label: "Geographies", href: "/knowledge/geographies", count: () => Geographies.all().length, desc: "Regions scoping markets, customers and suppliers." },
  { label: "Search Surfaces", href: "/knowledge/search-surfaces", count: () => SearchSurfaces.all().length, desc: "Public pages that turn search demand into qualified visitors." },
  { label: "Suppliers", href: "/supply/suppliers", count: () => Suppliers.all().length, desc: "Manufacturing partners with declared and observed capability." },
];

export default function OntologyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Ontology"
        description="The knowledge graph connecting market demand to manufacturable components. Every node below is a distinct object type with its own list and detail views; relationships are navigable from any detail page rather than isolated per screen."
      />

      <Panel title="Core relationship chain" description="The flow every mock record in this system is built to demonstrate.">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {["Market", "Opportunity", "Component", "Supplier", "CAD Package", "RFQ", "Supplier Quote", "Customer Quote", "Order", "Production", "QC", "Outcome"].map(
            (step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-accent-soft px-2.5 py-1 font-medium text-navy-800">{step}</span>
                {i < arr.length - 1 && <span className="text-border">&rarr;</span>}
              </span>
            ),
          )}
        </div>
      </Panel>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => (
          <Link key={node.label} href={node.href} className="block rounded-lg border border-border bg-surface p-4 hover:border-accent hover:shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy-900">{node.label}</h3>
              <span className="rounded-full bg-navy-900 px-2 py-0.5 text-xs font-medium text-white">{node.count()}</span>
            </div>
            <p className="mt-1.5 text-xs text-muted">{node.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
