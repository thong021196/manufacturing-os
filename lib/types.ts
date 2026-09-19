// Core object model for Manufacturing OS.
//
// This file is the single source of truth for the shape of every domain
// object in the system. The frontend shell currently reads mock data that
// conforms to these types (see lib/mock/*). When Sanity/Postgres-backed
// data is introduced, only lib/data.ts and lib/mock/* should need to
// change -- these types and every component built on them stay put.

/** Provenance rule: never treat an AI guess, a marketing claim, verified
 * documentation, a quote and a proven production outcome as equivalent. */
export type SourceType =
  | "ai_inferred"
  | "supplier_marketing"
  | "documentation_verified"
  | "quote_derived"
  | "production_proven"
  | "manual_entry";

export type ConfidenceLevel = "low" | "medium" | "high" | "verified";

export interface Evidence {
  id: string;
  summary: string;
  sourceType: SourceType;
  url?: string;
  capturedAt: string;
}

/** Shared metadata every important object should carry. */
export interface Traceable {
  id: string;
  status: string;
  source: SourceType;
  confidence: ConfidenceLevel;
  revision?: number;
  createdAt: string;
  updatedAt: string;
  owner: string;
  evidence: Evidence[];
  lastVerified?: string;
}

export type DemandStage =
  | "search"
  | "visitor"
  | "cad_rfq"
  | "quote"
  | "paid"
  | "repeat";

export interface DemandSignal {
  stage: DemandStage;
  value: number;
  unit: string;
  period: string;
}

// ---------------------------------------------------------------------------
// Market / knowledge objects
// ---------------------------------------------------------------------------

export interface Market extends Traceable {
  name: string;
  description: string;
  sizeUsd: number;
  growthRatePct: number;
  industryIds: string[];
  geographyIds: string[];
}

export interface Industry extends Traceable {
  name: string;
  description: string;
  marketIds: string[];
}

export interface Application extends Traceable {
  name: string;
  description: string;
  industryId: string;
  componentIds: string[];
  engineeringProblemIds: string[];
}

export interface Component extends Traceable {
  name: string;
  category: string;
  description: string;
  applicationIds: string[];
  materialIds: string[];
  processIds: string[];
  engineeringProblemIds: string[];
  opportunityIds: string[];
  supplierIds: string[];
  cadPackageIds: string[];
  searchSurfaceIds: string[];
  demandSignals: DemandSignal[];
}

export interface Material extends Traceable {
  name: string;
  category: string;
  properties: Record<string, string>;
  componentIds: string[];
  processIds: string[];
}

export interface ManufacturingProcess extends Traceable {
  name: string;
  category: string;
  description: string;
  componentIds: string[];
  materialIds: string[];
  supplierCapabilityIds: string[];
}

export interface EngineeringProblem extends Traceable {
  name: string;
  description: string;
  componentIds: string[];
  applicationIds: string[];
}

export interface Geography extends Traceable {
  name: string;
  region: string;
  country: string;
  marketIds: string[];
  supplierIds: string[];
}

export interface SearchQuery extends Traceable {
  query: string;
  volumeMonthly: number;
  intent: "informational" | "commercial" | "transactional";
  componentIds: string[];
  searchSurfaceId: string;
}

export interface SearchSurface extends Traceable {
  name: string;
  slug: string;
  componentIds: string[];
  searchQueryIds: string[];
  monthlyVisitors: number;
  qualifiedVisitors: number;
}

export type OpportunityStage =
  | "identified"
  | "qualifying"
  | "cad_received"
  | "rfq_active"
  | "quoted"
  | "won"
  | "lost";

export interface Opportunity extends Traceable {
  name: string;
  description: string;
  stage: OpportunityStage;
  marketId: string;
  geographyId: string;
  componentIds: string[];
  estValueUsd: number;
  demandSignals: DemandSignal[];
}

export interface Competitor extends Traceable {
  name: string;
  description: string;
  website?: string;
  marketIds: string[];
  geographyIds: string[];
  strengths: string[];
  weaknesses: string[];
}

// ---------------------------------------------------------------------------
// Supply objects
// ---------------------------------------------------------------------------

export type CapabilityLayer = "declared" | "observed";

export interface SupplierCapability extends Traceable {
  supplierId: string;
  processId: string;
  materialIds: string[];
  layer: CapabilityLayer;
  toleranceMm?: number;
  maxPartSizeMm?: string;
  notes: string;
}

export interface SupplierMachineEvidence extends Traceable {
  supplierId: string;
  machineType: string;
  description: string;
  processId: string;
}

export interface SupplierPerformance extends Traceable {
  supplierId: string;
  onTimeRatePct: number;
  qualityScorePct: number;
  avgLeadTimeDays: number;
  totalOrders: number;
  repeatOrderRatePct: number;
}

export interface Supplier extends Traceable {
  name: string;
  website?: string;
  geographyId: string;
  description: string;
  declaredCapabilityIds: string[];
  observedCapabilityIds: string[];
  machineEvidenceIds: string[];
  performanceId?: string;
  componentIds: string[];
}

// ---------------------------------------------------------------------------
// Customer / execution objects
// ---------------------------------------------------------------------------

export interface Contact extends Traceable {
  name: string;
  companyId: string;
  email: string;
  role: string;
}

export interface Company extends Traceable {
  name: string;
  industryId: string;
  geographyId: string;
  contactIds: string[];
}

export interface Revision extends Traceable {
  partId: string;
  revisionCode: string;
  changeSummary: string;
  released: boolean;
  internalFileRef: string;
}

export interface Part extends Traceable {
  name: string;
  cadPackageId: string;
  componentId: string;
  materialId: string;
  processId: string;
  revisionIds: string[];
  currentRevisionId: string;
}

export interface CadPackage extends Traceable {
  name: string;
  companyId: string;
  opportunityId: string;
  componentId: string;
  partIds: string[];
  internalFileRef: string;
  rfqId?: string;
}

export type RfqStage =
  | "intake"
  | "normalized"
  | "supplier_matching"
  | "quoting"
  | "quoted"
  | "closed_won"
  | "closed_lost";

export interface Rfq extends Traceable {
  name: string;
  companyId: string;
  cadPackageId: string;
  componentId: string;
  stage: RfqStage;
  quantity: number;
  targetUnitPriceUsd?: number;
  dueDate: string;
  supplierQuoteIds: string[];
  customerQuoteId?: string;
}

export interface SupplierQuote extends Traceable {
  rfqId: string;
  supplierId: string;
  unitPriceUsd: number;
  leadTimeDays: number;
  quantity: number;
  notes: string;
  selected: boolean;
}

export type CustomerQuoteStatus = "draft" | "sent" | "accepted" | "declined";

export interface CustomerQuote extends Traceable {
  rfqId: string;
  companyId: string;
  supplierQuoteId: string;
  sellUnitPriceUsd: number;
  marginPct: number;
  status: CustomerQuoteStatus;
  orderId?: string;
}

export type OrderStatus =
  | "pending"
  | "in_production"
  | "qc"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order extends Traceable {
  customerQuoteId: string;
  companyId: string;
  supplierId: string;
  componentId: string;
  orderValueUsd: number;
  status: OrderStatus;
  productionJobId?: string;
}

export type ProductionStage =
  | "queued"
  | "in_progress"
  | "qc"
  | "rework"
  | "complete";

export interface ProductionJob extends Traceable {
  orderId: string;
  supplierId: string;
  partId: string;
  revisionId: string;
  stage: ProductionStage;
  startDate: string;
  dueDate: string;
  qcResultId?: string;
}

export type QcOutcome = "pass" | "fail" | "rework";

export interface QcResult extends Traceable {
  productionJobId: string;
  partId: string;
  revisionId: string;
  result: QcOutcome;
  inspector: string;
  notes: string;
  measurements: { dimension: string; nominal: string; actual: string; withinTolerance: boolean }[];
}

export interface Outcome extends Traceable {
  orderId: string;
  onTime: boolean;
  qualityPass: boolean;
  actualLeadTimeDays: number;
  actualCostUsd: number;
  marginRealizedPct: number;
  repeatPurchase: boolean;
  feedback: string;
}

// ---------------------------------------------------------------------------
// Intelligence objects
// ---------------------------------------------------------------------------

export interface SearchPerformanceRecord extends Traceable {
  searchSurfaceId: string;
  period: string;
  impressions: number;
  clicks: number;
  qualifiedVisitors: number;
  cadUploads: number;
}

export interface DemandLearningRecord extends Traceable {
  componentId: string;
  period: string;
  insight: string;
  demandDeltaPct: number;
}

export interface SupplierLearningRecord extends Traceable {
  supplierId: string;
  period: string;
  insight: string;
  performanceDeltaPct: number;
}

export interface EconomicsRecord extends Traceable {
  period: string;
  revenueUsd: number;
  grossMarginPct: number;
  avgOrderValueUsd: number;
  ordersCount: number;
}
