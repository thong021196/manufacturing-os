# Operational Boundary — Sanity vs. Postgres/Supabase

Per AGENTS.md: "public structured knowledge belongs in Sanity; private operational data belongs in Postgres/Supabase." This document makes that boundary explicit and reconciles it with the object model that already exists in `lib/types.ts` (Issue #2's implementation, unmodified by this pass).

## 1. The rule

| | Sanity (public) | Postgres/Supabase (private) |
|---|---|---|
| What it holds | Facts about manufacturing that are true independent of any customer — parts, materials, processes, applications, engineering knowledge, evidence, page registry, search-intent taxonomy | Facts about a specific customer relationship, RFQ, quote, order, or supplier — anything tied to a company, a file, a price, or a person |
| Who can read it | The public, via the rendered site (subject to `index_policy`/`publish_status`) | Only authenticated internal/ops tooling (the `app/discovery`, `app/execution`, `app/supply`, `app/intelligence`, `app/knowledge` sections already scaffolded in this repo) |
| Reference direction | Never references a Postgres row | May reference a Sanity document **by id only** (e.g. `sanityPartId: string`) |
| Can it contain a CAD file, drawing, BOM, or customer name? | **Never.** No field in `sanity-schema-proposal.md` accepts one. | Yes — this is exactly what `CadPackage`, `Revision`, `Company`, `Contact` already model in `lib/types.ts`. |

This is a one-directional reference boundary: Postgres rows may point *at* Sanity documents (to say "this operational Part instance is an instance of that public Part concept"), but no Sanity document schema has a field capable of pointing at a `Company`, `Rfq`, `CadPackage`, `Order`, `Quote`, or any other private object. That asymmetry is what makes invariant #12 ("CAD/customer/private operational data must never enter the public CMS/indexable content layer") structurally true rather than a policy someone has to remember.

## 2. Concretely: what never enters Sanity

- CAD/drawing/BOM files or any reference to one (`lib/types.ts`'s `CadPackage.internalFileRef`, `Revision.internalFileRef`).
- Customer identity (`Company`, `Contact`) or anything derived from a specific customer's RFQ (`Rfq`, its `criticalRequirements`/`conflicts`/`assumptions`).
- Pricing at any stage (`SupplierQuote.unitPriceUsd`, `CustomerQuote.sellUnitPriceUsd`/`marginPct`, `Order.orderValueUsd`).
- Supplier identity and performance data (`Supplier`, `SupplierPerformance`, `SupplierMachineEvidence`) — a public `ProcessCapability` page can say "5-axis machining is a viable process for this class of part," but never "Supplier X can do it at $Y."
- QC results tied to a specific job (`QcResult.measurements`) — a public `InspectionConcept` page can explain what a CMM bore report *is*, never publish one.
- Raw GSC performance numbers (`SearchPerformanceRecord.impressions/clicks`) — these stay in Postgres and roll up into the public `SearchIntentCluster.commercialStrength` qualitative field only after human review (see `search-intent-integration.md`).

## 3. Reconciling with `lib/types.ts` — what already exists, and how it maps

`lib/types.ts` is the current in-app object model backing the mock-data frontend shell (per its own header comment: "the single source of truth for the shape of every domain object in the system... only `lib/data.ts` and `lib/mock/*` should need to change" when real data arrives). This pass does not modify that file. The mapping below is the target-state reconciliation a future BUILD pass would implement — recorded here so the two efforts don't contradict each other later.

### 3.1 `Component` (existing, private) → splits into `Part`/`Assembly` (new, public) + a thin private link

`lib/types.ts`'s `Component` interface today mixes two things that this architecture deliberately separates:

```ts
// lib/types.ts, current shape
export interface Component extends Traceable {
  name: string; category: string; description: string;
  applicationIds: string[]; materialIds: string[]; processIds: string[];
  engineeringProblemIds: string[];                      // <- public-knowledge-shaped fields
  opportunityIds: string[]; supplierIds: string[];
  cadPackageIds: string[]; searchSurfaceIds: string[];   // <- private-operational-shaped fields
  demandSignals: DemandSignal[];
}
```

Target state: the public-shaped fields (`name`, `category`→`partFamily`, `description`→`summary`, `applicationIds`, `materialIds`, `processIds`, `engineeringProblemIds`) become a Sanity `part` (or `assembly`) document per `sanity-schema-proposal.md`. The private-shaped fields (`opportunityIds`, `supplierIds`, `cadPackageIds`, `searchSurfaceIds`, `demandSignals`) stay in Postgres on a slimmer `Component` row that adds one new field, `sanityPartId: string`, pointing at the public document. **This split is not performed in this pass** — `lib/types.ts` is untouched — it is documented here as the reconciliation path so the Sanity schema and the existing private model are known to be compatible, not contradictory. Flagged as UQ-2 in `migration-plan.md`.

### 3.2 `Part` naming collision (existing, private) vs. `Part` (new, public) — UQ-1

`lib/types.ts` already defines `Part`:

```ts
export interface Part extends Traceable {
  name: string; cadPackageId: string; componentId: string;
  materialId: string; processId: string;
  revisionIds: string[]; currentRevisionId: string;
}
```

This is a **specific physical part instance tied to one customer's CAD package and revision history** — an operational object, correctly private, correctly named `Part` in that context (it is literally "a part," as in one manufactured item on one order). The new Sanity `Part` proposed in this pass is a **public knowledge concept** ("the category of thing called Robot Joint Housing"). These are different things that both deserve the name "Part" in ordinary English, and the collision is real: code in the same repo would eventually import `Part` from two different places.

This is **not resolved in this pass** (schema/mapping only, no code renames). It is called out explicitly as an unresolved question for the human/OpenAI architecture review — see `migration-plan.md` UQ-1 for the two candidate resolutions (rename the private one to `PartInstance`, or rename the public Sanity type to `PartConcept`/`PartKnowledge` in generated TypeScript bindings while keeping the Sanity document type `part`). Both are pure renames with no schema-shape impact, so deferring the choice costs nothing now.

### 3.3 `Application`, `Material`, `ManufacturingProcess`, `EngineeringProblem` (existing, private) → public counterparts

The existing private types are lighter-weight and ID-referencing only:

```ts
export interface Application extends Traceable {
  name: string; description: string; industryId: string;
  componentIds: string[]; engineeringProblemIds: string[];
}
export interface Material extends Traceable {
  name: string; category: string; properties: Record<string, string>;
  componentIds: string[]; processIds: string[];
}
export interface ManufacturingProcess extends Traceable {
  name: string; category: string; description: string;
  componentIds: string[]; materialIds: string[]; supplierCapabilityIds: string[];
}
export interface EngineeringProblem extends Traceable {
  name: string; description: string;
  componentIds: string[]; applicationIds: string[];
}
```

These map cleanly to the new public `application`, `material`, `processCapability` (note the rename — see §3.4), and `engineeringProblem` Sanity documents: `name`/`description` become `name`/`summary`, the `*Ids` reference arrays become Sanity `reference` arrays to the corresponding public document type. `ManufacturingProcess.supplierCapabilityIds` is the one field that stays purely private (it is precisely the "observed/declared supplier capability" data the issue says must stay in Postgres) — it does **not** get a public counterpart field on `processCapability`; the public page instead has a generic, non-supplier-specific `summary`/`contentBlocks` describing the capability class. See §4 below for why "capability" means two different things at these two layers and that is intentional, not a naming bug.

### 3.4 `ManufacturingProcess` (existing name) vs. `ProcessCapability` (new name) — deliberate rename in the public layer only

The issue's required schema names the public entity `ProcessCapability`, not `ManufacturingProcess`. This pass keeps that naming for the Sanity document type, and does **not** rename the existing private `ManufacturingProcess` interface. The result is that "process" content has two names depending on layer (`ManufacturingProcess` = private, ties to `supplierCapabilityIds`; `ProcessCapability` = public, general-education content) — an intentional signal that these are not the same object, deliberately choosing distinct names rather than reusing `ManufacturingProcess` for the public document and risking the same ambiguity as the `Part` collision in §3.2.

### 3.5 `Evidence` (existing, private-adjacent) vs. `Evidence` (new, public) — same name, different shape, resolved by physical separation

```ts
// lib/types.ts, current shape — attached inline to any Traceable object
export interface Evidence {
  id: string; summary: string; sourceType: SourceType; url?: string; capturedAt: string;
}
```

vs. the new public `evidence` Sanity document (`sanity-schema-proposal.md` §4): `evidence_id`, `claim_id`, `source_url`, `source_type`, `source_title`, `observed_fact`, `confidence`, `last_verified`, `notes`. The private `Evidence` is an inline array item on any `Traceable` private object (embedded, not a standalone row); the public `Evidence` is a standalone, referenceable Sanity document (so many `ContentBlock`s can cite the same piece of evidence). Both share the `SourceType` vocabulary (`ai_inferred | supplier_marketing | documentation_verified | quote_derived | production_proven | manual_entry`) verbatim, by design — see `sanity-schema-proposal.md` §4's note on this. The name collision here is lower-risk than `Part` because both objects genuinely mean "a piece of evidence backing a claim," just embedded vs. referenceable — no rename is proposed.

### 3.6 What stays entirely private, unchanged, with no public counterpart

`Company`, `Contact`, `Revision`, `CadPackage`, `Rfq`, `SupplierQuote`, `CustomerQuote`, `Order`, `ProductionJob`, `QcResult`, `Outcome`, `Supplier`, `SupplierCapability`, `SupplierMachineEvidence`, `SupplierPerformance`, `Market`, `Industry`, `Geography`, `MarketOpportunity`, `Opportunity`, `Competitor`, `SearchQuery`, `SearchSurface`, `SearchPerformanceRecord`, `DemandLearningRecord`, `SupplierLearningRecord`, `EconomicsRecord`. These already correctly model private operational/intelligence data per Issue #2's own design and AGENTS.md's rule #2/#3; this pass does not propose changes to any of them.

## 4. "Capability" means two different things — resolved by layer, not by name collision

- **Public `ProcessCapability`** (Sanity): "5-axis machining is a manufacturing capability class that exists and is relevant to these part types" — general, educational, supplier-agnostic content suitable for an `/capabilities/5-axis-machining/` page.
- **Private `SupplierCapability`** (Postgres, `lib/types.ts`, unchanged): "Supplier X has *declared* (or we have *observed*) 5-axis capability, with tolerance/size-envelope/quantity-range specifics" — the `CapabilityLayer = "declared" | "observed"` distinction from AGENTS.md rule #5.

The public page never states which specific supplier has the capability, nor exposes `SupplierCapability.toleranceMm`/`sizeEnvelopeMm`/`qcCapabilities` — those remain internal inputs to supplier matching (out of scope for this pass per the issue's scope guardrails: "avoid... automated supplier matching"). The public `ProcessCapability.appliesToParts` relation and the private `SupplierCapability.processId` relation intentionally never join directly; if a future pass needs "which suppliers can make this specific published Part," that is a new, explicitly-designed query joining `Part.slug` → `Component.sanityPartId` (§3.1) → `SupplierCapability.processId`, not an implicit consequence of shared naming.

## 5. Provenance vocabulary consistency

`Traceable`'s `source: SourceType` / `confidence: ConfidenceLevel` in `lib/types.ts` and the public `Evidence.sourceType`/`confidence` in `sanity-schema-proposal.md` use the identical enum values by design (see `sanity-schema-proposal.md` §4's note). This means a contributor reading either system encounters the same provenance vocabulary — `ai_inferred` never quietly means something different in Sanity than it does in Postgres — directly satisfying AGENTS.md rule #7 ("every important fact must support source, confidence, last_verified, and evidence") across both halves of the system rather than only within one.

## 6. Reference id format (for the future BUILD pass)

Not implemented here, recorded so the future migration doesn't have to invent it under time pressure: a Postgres row referencing a Sanity document should store the raw Sanity `_id` (a GUID-shaped string Sanity assigns), in a column named `sanity<Type>Id` (e.g. `sanityPartId`, `sanityApplicationId`), never the human-readable `slug` — slugs are allowed to change under the redirect policy in `url-namespace-policy.md` §5, `_id` never does. This directly protects the private layer from breaking silently on a future slug rename.
