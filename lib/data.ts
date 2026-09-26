// Data access layer.
//
// Every page and component reads domain data through this module, never
// through lib/mock/data.ts directly. That boundary is what lets the mock
// fixtures be replaced later by real Sanity (public knowledge) and
// Postgres/Supabase (private operational data) queries without any UI
// rewrite -- only the function bodies below would change.

import * as mock from "@/lib/mock/data";
import type {
  Application,
  CadPackage,
  Company,
  Competitor,
  Component,
  Contact,
  CustomerQuote,
  DemandLearningRecord,
  EconomicsRecord,
  EngineeringProblem,
  Geography,
  Industry,
  ManufacturingProcess,
  Market,
  MarketOpportunity,
  Material,
  Opportunity,
  Order,
  Outcome,
  PartInstance,
  ProductionJob,
  QcResult,
  Revision,
  Rfq,
  SearchPerformanceRecord,
  SearchQuery,
  SearchSurface,
  Supplier,
  SupplierCapability,
  SupplierLearningRecord,
  SupplierMachineEvidence,
  SupplierPerformance,
  SupplierQuote,
  SourceType,
  Traceable,
} from "@/lib/types";

interface WithId {
  id: string;
}

function collection<T extends WithId>(list: T[]) {
  const index = new Map(list.map((item) => [item.id, item]));
  return {
    all: (): T[] => list,
    byId: (id: string | undefined): T | undefined => (id ? index.get(id) : undefined),
    byIds: (ids: string[]): T[] => ids.map((id) => index.get(id)).filter((x): x is T => Boolean(x)),
    where: (predicate: (item: T) => boolean): T[] => list.filter(predicate),
  };
}

export const Markets = collection<Market>(mock.markets);
export const Industries = collection<Industry>(mock.industries);
export const Geographies = collection<Geography>(mock.geographies);
export const Applications = collection<Application>(mock.applications);
export const EngineeringProblems = collection<EngineeringProblem>(mock.engineeringProblems);
export const Materials = collection<Material>(mock.materials);
export const Processes = collection<ManufacturingProcess>(mock.processes);
export const Components = collection<Component>(mock.components);
export const SearchSurfaces = collection<SearchSurface>(mock.searchSurfaces);
export const SearchQueries = collection<SearchQuery>(mock.searchQueries);
export const Opportunities = collection<Opportunity>(mock.opportunities);
export const MarketOpportunities = collection<MarketOpportunity>(mock.marketOpportunities);
export const Competitors = collection<Competitor>(mock.competitors);

export const Suppliers = collection<Supplier>(mock.suppliers);
export const SupplierCapabilities = collection<SupplierCapability>(mock.supplierCapabilities);
export const SupplierMachineEvidences = collection<SupplierMachineEvidence>(mock.supplierMachineEvidence);
export const SupplierPerformances = collection<SupplierPerformance>(mock.supplierPerformance);

export const Companies = collection<Company>(mock.companies);
export const Contacts = collection<Contact>(mock.contacts);
export const CadPackages = collection<CadPackage>(mock.cadPackages);
export const Parts = collection<PartInstance>(mock.parts);
export const Revisions = collection<Revision>(mock.revisions);
export const Rfqs = collection<Rfq>(mock.rfqs);
export const SupplierQuotes = collection<SupplierQuote>(mock.supplierQuotes);
export const CustomerQuotes = collection<CustomerQuote>(mock.customerQuotes);
export const Orders = collection<Order>(mock.orders);
export const ProductionJobs = collection<ProductionJob>(mock.productionJobs);
export const QcResults = collection<QcResult>(mock.qcResults);
export const Outcomes = collection<Outcome>(mock.outcomes);

export const SearchPerformance = collection<SearchPerformanceRecord>(mock.searchPerformance);
export const DemandLearning = collection<DemandLearningRecord>(mock.demandLearning);
export const SupplierLearning = collection<SupplierLearningRecord>(mock.supplierLearning);
export const Economics = collection<EconomicsRecord>(mock.economics);

// ---------------------------------------------------------------------------
// Cross-entity helpers used by detail pages to render "related objects".
// ---------------------------------------------------------------------------

export function suppliersForComponent(componentId: string): Supplier[] {
  return Suppliers.where((s) => s.componentIds.includes(componentId));
}

export function opportunitiesForComponent(componentId: string): Opportunity[] {
  return Opportunities.where((o) => o.componentIds.includes(componentId));
}

export function commercialOpportunitiesForMarketOpportunity(marketOpportunityId: string): Opportunity[] {
  return Opportunities.where((o) => o.marketOpportunityId === marketOpportunityId);
}

export interface ComponentOutcome {
  order: Order;
  outcome: Outcome | undefined;
}

/** Orders (and their outcomes, when closed) placed for a given component --
 * per FRONTEND_SPEC.md, a component detail page must expose linked outcomes. */
export function outcomesForComponent(componentId: string): ComponentOutcome[] {
  return Orders.where((o) => o.componentId === componentId).map((order) => ({
    order,
    outcome: outcomeForOrder(order.id),
  }));
}

export function componentsForSupplier(supplierId: string): Component[] {
  return Components.where((c) => c.supplierIds.includes(supplierId));
}

export function rfqsForCompany(companyId: string): Rfq[] {
  return Rfqs.where((r) => r.companyId === companyId);
}

export function rfqsForComponent(componentId: string): Rfq[] {
  return Rfqs.where((r) => r.componentId === componentId);
}

export function supplierQuotesForRfq(rfqId: string): SupplierQuote[] {
  return SupplierQuotes.where((q) => q.rfqId === rfqId);
}

export function ordersForSupplier(supplierId: string): Order[] {
  return Orders.where((o) => o.supplierId === supplierId);
}

export function ordersForCompany(companyId: string): Order[] {
  return Orders.where((o) => o.companyId === companyId);
}

export function productionJobForOrder(orderId: string): ProductionJob | undefined {
  return ProductionJobs.where((j) => j.orderId === orderId)[0];
}

export function qcResultForProductionJob(jobId: string): QcResult | undefined {
  return QcResults.where((r) => r.productionJobId === jobId)[0];
}

export function outcomeForOrder(orderId: string): Outcome | undefined {
  return Outcomes.where((o) => o.orderId === orderId)[0];
}

export function capabilitiesForSupplier(supplierId: string): SupplierCapability[] {
  return SupplierCapabilities.where((c) => c.supplierId === supplierId);
}

export function machineEvidenceForSupplier(supplierId: string): SupplierMachineEvidence[] {
  return SupplierMachineEvidences.where((m) => m.supplierId === supplierId);
}

export function searchSurfacesForComponent(componentId: string): SearchSurface[] {
  return SearchSurfaces.where((s) => s.componentIds.includes(componentId));
}

export function searchPerformanceForSurface(surfaceId: string): SearchPerformanceRecord[] {
  return SearchPerformance.where((s) => s.searchSurfaceId === surfaceId);
}

// ---------------------------------------------------------------------------
// Evidence ledger (aggregated across every object type)
// ---------------------------------------------------------------------------

export interface EvidenceLedgerEntry {
  evidenceId: string;
  summary: string;
  sourceType: SourceType;
  capturedAt: string;
  recordType: string;
  recordLabel: string;
  recordHref: string;
}

function labelFor(record: { id: string } & Record<string, unknown>): string {
  const named = record as { name?: string; id: string };
  return named.name ?? named.id;
}

export function evidenceLedger(): EvidenceLedgerEntry[] {
  const sources: { list: { id: string; evidence: Traceable["evidence"] }[]; recordType: string; href: (id: string) => string }[] = [
    { list: Markets.all(), recordType: "Market", href: () => "/discovery/market-intelligence" },
    { list: Industries.all(), recordType: "Industry", href: () => "/discovery/market-intelligence" },
    { list: MarketOpportunities.all(), recordType: "Market Opportunity", href: () => "/discovery/opportunity-map" },
    { list: Opportunities.all(), recordType: "Opportunity", href: (id) => `/discovery/opportunity-map/${id}` },
    { list: Competitors.all(), recordType: "Competitor", href: (id) => `/discovery/competitors/${id}` },
    { list: Components.all(), recordType: "Component", href: (id) => `/knowledge/components/${id}` },
    { list: Materials.all(), recordType: "Material", href: (id) => `/knowledge/materials/${id}` },
    { list: Processes.all(), recordType: "Process", href: (id) => `/knowledge/processes/${id}` },
    { list: EngineeringProblems.all(), recordType: "Engineering Problem", href: (id) => `/knowledge/engineering-problems/${id}` },
    { list: Applications.all(), recordType: "Application", href: (id) => `/knowledge/applications/${id}` },
    { list: Geographies.all(), recordType: "Geography", href: (id) => `/knowledge/geographies/${id}` },
    { list: SearchSurfaces.all(), recordType: "Search Surface", href: (id) => `/knowledge/search-surfaces/${id}` },
    { list: SearchQueries.all(), recordType: "Search Query", href: (id) => `/knowledge/search-surfaces/${SearchQueries.byId(id)?.searchSurfaceId ?? ""}` },
    { list: Suppliers.all(), recordType: "Supplier", href: (id) => `/supply/suppliers/${id}` },
    { list: SupplierCapabilities.all(), recordType: "Supplier Capability", href: () => "/supply/capability-graph" },
    { list: SupplierMachineEvidences.all(), recordType: "Supplier Machine Evidence", href: (id) => `/supply/suppliers/${SupplierMachineEvidences.byId(id)?.supplierId ?? ""}` },
    { list: SupplierPerformances.all(), recordType: "Supplier Performance", href: (id) => `/supply/suppliers/${SupplierPerformances.byId(id)?.supplierId ?? ""}` },
    { list: Companies.all(), recordType: "Company", href: () => "/execution/rfqs" },
    { list: Contacts.all(), recordType: "Contact", href: () => "/execution/rfqs" },
    { list: CadPackages.all(), recordType: "CAD Package", href: (id) => `/execution/cad-packages/${id}` },
    { list: Parts.all(), recordType: "Part", href: (id) => `/execution/cad-packages/${Parts.byId(id)?.cadPackageId ?? ""}` },
    { list: Revisions.all(), recordType: "Revision", href: (id) => `/intelligence/revisions#${id}` },
    { list: Rfqs.all(), recordType: "RFQ", href: (id) => `/execution/rfqs/${id}` },
    { list: SupplierQuotes.all(), recordType: "Supplier Quote", href: (id) => `/execution/supplier-quotes/${id}` },
    { list: CustomerQuotes.all(), recordType: "Customer Quote", href: (id) => `/execution/customer-quotes/${id}` },
    { list: Orders.all(), recordType: "Order", href: (id) => `/execution/orders/${id}` },
    { list: ProductionJobs.all(), recordType: "Production Job", href: (id) => `/execution/production/${id}` },
    { list: QcResults.all(), recordType: "QC Result", href: (id) => `/execution/qc/${id}` },
    { list: Outcomes.all(), recordType: "Outcome", href: (id) => `/execution/orders/${Outcomes.byId(id)?.orderId ?? id}` },
    { list: SearchPerformance.all(), recordType: "Search Performance", href: () => "/intelligence/search-performance" },
    { list: DemandLearning.all(), recordType: "Demand Learning", href: () => "/intelligence/demand-learning" },
    { list: SupplierLearning.all(), recordType: "Supplier Learning", href: () => "/intelligence/supplier-learning" },
    { list: Economics.all(), recordType: "Economics", href: () => "/intelligence/economics" },
  ];

  const entries: EvidenceLedgerEntry[] = [];
  for (const source of sources) {
    for (const record of source.list) {
      const label = labelFor(record as { id: string } & Record<string, unknown>);
      for (const evidenceItem of record.evidence) {
        entries.push({
          evidenceId: evidenceItem.id,
          summary: evidenceItem.summary,
          sourceType: evidenceItem.sourceType,
          capturedAt: evidenceItem.capturedAt,
          recordType: source.recordType,
          recordLabel: label,
          recordHref: source.href(record.id),
        });
      }
    }
  }
  return entries.sort((a, b) => (a.capturedAt < b.capturedAt ? 1 : -1));
}

// ---------------------------------------------------------------------------
// Overview aggregates
// ---------------------------------------------------------------------------

export function overviewStats() {
  const allOpportunities = Opportunities.all();
  const activeOpportunities = allOpportunities.filter(
    (o) => o.stage !== "won" && o.stage !== "lost",
  );
  const rfqStageCounts = Rfqs.all().reduce<Record<string, number>>((acc, rfq) => {
    acc[rfq.stage] = (acc[rfq.stage] ?? 0) + 1;
    return acc;
  }, {});
  const totalSuppliers = Suppliers.all().length;
  const qualifiedSuppliers = Suppliers.where((s) => s.status === "qualified").length;
  const totalSearchVisitors = SearchSurfaces.all().reduce((sum, s) => sum + s.monthlyVisitors, 0);
  const totalQualifiedVisitors = SearchSurfaces.all().reduce((sum, s) => sum + s.qualifiedVisitors, 0);
  const latestEconomics = [...Economics.all()].sort((a, b) => (a.period < b.period ? 1 : -1))[0];
  const totalOrders = Orders.all().length;
  const deliveredOrders = Orders.where((o) => o.status === "delivered").length;

  return {
    activeOpportunitiesCount: activeOpportunities.length,
    totalOpportunitiesCount: allOpportunities.length,
    wonOpportunitiesCount: Opportunities.where((o) => o.stage === "won").length,
    rfqStageCounts,
    totalRfqs: Rfqs.all().length,
    totalSuppliers,
    qualifiedSuppliers,
    totalSearchVisitors,
    totalQualifiedVisitors,
    latestEconomics,
    totalOrders,
    deliveredOrders,
  };
}
