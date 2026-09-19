export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Overview", href: "/" }],
  },
  {
    label: "Discovery",
    items: [
      { label: "Market Intelligence", href: "/discovery/market-intelligence" },
      { label: "Demand Graph", href: "/discovery/demand-graph" },
      { label: "Opportunity Map", href: "/discovery/opportunity-map" },
      { label: "Competitors", href: "/discovery/competitors" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { label: "Ontology", href: "/knowledge/ontology" },
      { label: "Components", href: "/knowledge/components" },
      { label: "Materials", href: "/knowledge/materials" },
      { label: "Processes", href: "/knowledge/processes" },
      { label: "Engineering Problems", href: "/knowledge/engineering-problems" },
      { label: "Applications", href: "/knowledge/applications" },
      { label: "Geographies", href: "/knowledge/geographies" },
      { label: "Search Surfaces", href: "/knowledge/search-surfaces" },
    ],
  },
  {
    label: "Supply",
    items: [
      { label: "Suppliers", href: "/supply/suppliers" },
      { label: "Capability Graph", href: "/supply/capability-graph" },
      { label: "Supplier Performance", href: "/supply/supplier-performance" },
    ],
  },
  {
    label: "Execution",
    items: [
      { label: "CAD Packages", href: "/execution/cad-packages" },
      { label: "RFQs", href: "/execution/rfqs" },
      { label: "Supplier Quotes", href: "/execution/supplier-quotes" },
      { label: "Customer Quotes", href: "/execution/customer-quotes" },
      { label: "Orders", href: "/execution/orders" },
      { label: "Production", href: "/execution/production" },
      { label: "QC / Inspection", href: "/execution/qc" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Search Performance", href: "/intelligence/search-performance" },
      { label: "Demand Learning", href: "/intelligence/demand-learning" },
      { label: "Supplier Learning", href: "/intelligence/supplier-learning" },
      { label: "Economics", href: "/intelligence/economics" },
      { label: "Evidence", href: "/intelligence/evidence" },
      { label: "Revisions", href: "/intelligence/revisions" },
    ],
  },
];
