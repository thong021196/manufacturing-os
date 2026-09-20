// Public structured content layer — entity graph shape.
//
// This implements the architecture proposed in
// docs/architecture/entity-publishing-system/ (PR #24 / issue #22):
// Entity graph -> Content & evidence layer -> Page Registry -> Renderer.
//
// It is the "repository-backed structured content layer behind the same
// adapter/interface" called for by issue #25, so a future swap to a real
// Sanity project only requires a new ContentAdapter implementation (see
// lib/content/adapter.ts) — no frontend/page rewrite.
//
// Naming resolution (UQ-1 from migration-plan.md): `Part` here is the
// PUBLIC knowledge entity (a manufacturable part family we publish content
// about). The PRIVATE, RFQ-specific physical part concept in lib/types.ts
// has been renamed `PartInstance` to remove the collision — see
// lib/types.ts and docs/architecture/entity-publishing-system/migration-plan.md
// UQ-1 for the full rationale.

export type SourceType =
  | "ai_inferred"
  | "supplier_marketing"
  | "documentation_verified"
  | "quote_derived"
  | "production_proven"
  | "manual_entry"
  | "structured_fixture";

export type ConfidenceLevel = "low" | "medium" | "high" | "verified";

/** A single citable fact/source. Every claim that isn't obviously generic
 * copy should be able to point at one of these. */
export interface Evidence {
  id: string;
  summary: string;
  sourceType: SourceType;
  url?: string;
  confidence: ConfidenceLevel;
  capturedAt: string; // ISO date the evidence was captured/verified
}

/** Fields every published fact/claim carries (AGENTS.md rule #7). */
export interface Provenance {
  source: SourceType;
  confidence: ConfidenceLevel;
  lastVerified: string; // ISO date
  evidenceId?: string; // -> Evidence.id
}

export type EntityKind =
  | "part"
  | "application"
  | "processCapability"
  | "material"
  | "engineeringProblem";

export interface EntityRef {
  kind: EntityKind;
  id: string;
}

/** A reusable, typed content unit. Referenced by id from entities/pages
 * rather than copy-pasted, per architecture-decision.md §5. Two kinds:
 * "knowledge" (authored prose tied to a durable fact) and "relational"
 * (a typed instruction to render a live aggregation from the graph —
 * modeled here simply as a block whose `data` is resolved at render time
 * from entity relations rather than authored directly). */
export interface ContentBlock {
  id: string;
  kind: "knowledge" | "relational";
  /** Matches a FrontendBlock["type"] this content composes into. */
  blockType: string;
  title?: string;
  /** Arbitrary structured payload for this block type. Shape depends on
   * blockType; see lib/content/compose.ts for the mapping into
   * FrontendBlock. */
  data: unknown;
  provenance: Provenance;
  appliesTo: EntityRef[];
}

export interface BaseEntity {
  id: string;
  slug: string;
  name: string;
  summary: string;
  status: "draft" | "published";
  provenance: Provenance;
  contentBlockIds: string[];
}

export interface Part extends BaseEntity {
  kind: "part";
  family: string;
  applicationIds: string[];
  processCapabilityIds: string[];
  materialIds: string[];
}

export interface Application extends BaseEntity {
  kind: "application";
  partIds: string[];
  processCapabilityIds: string[];
}

export interface ProcessCapability extends BaseEntity {
  kind: "processCapability";
  category: string;
  partIds: string[];
}

export interface Material extends BaseEntity {
  kind: "material";
  category: string;
}

export interface EngineeringProblem extends BaseEntity {
  kind: "engineeringProblem";
}

export type Entity =
  | Part
  | Application
  | ProcessCapability
  | Material
  | EngineeringProblem;

export type IndexPolicy = "index" | "noindex";

/** One record per public URL. A relation existing in the entity graph
 * implies nothing about a URL existing — this is the explicit firewall
 * described in page-registry.md. The renderer only builds a page for a
 * slug that has an approved (published) registry record. */
export interface PageRegistryEntry {
  path: string; // e.g. "/parts/robot-joint-housing"
  /** The primary entity this page publishes, when the page is entity-owned
   * (part/application/capability pages). Editorial pages (quality,
   * resources, how-it-works, home, company, rfq) are not owned by a single
   * entity and instead list their ContentBlocks directly below. */
  entity?: EntityRef;
  /** ContentBlock ids for pages that are not entity-owned. Entity-owned
   * pages get their blocks from `entity.contentBlockIds` instead. */
  contentBlockIds?: string[];
  pageKind:
    | "home"
    | "part"
    | "application"
    | "capability"
    | "quality"
    | "howItWorks"
    | "company"
    | "manufacturingNetwork"
    | "resources"
    | "resourceArticle"
    | "rfq";
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  publishStatus: "draft" | "published";
  indexPolicy: IndexPolicy;
  seo: { title: string; description: string };
  updatedAt: string; // ISO date, drives sitemap lastModified
}
