# Sanity Schema Proposal

**Status: proposal only.** No Sanity project exists in this repository yet. The schemas below are written as TypeScript-flavored pseudocode (close to Sanity's actual `defineType`/`defineField` shape so a future BUILD pass can transcribe them directly), inside markdown fences — nothing here is a file Sanity Studio will load. This satisfies deliverable #3 without adding a `sanity/` folder or any dependency to the repo, per the issue's "architecture + schema proposal + mapping only" constraint.

## 1. Conventions used throughout

- Every knowledge entity (`part`, `assembly`, `application`, `processCapability`, `material`, `engineeringProblem`, `lifecycle`, `inspectionConcept`) shares a base set of fields via a reusable `traceableFields` fragment: `status`, `evidenceRefs`, `lastVerified`. This mirrors the `Traceable` mixin already used in `lib/types.ts` for the private object model, so the two layers use a consistent provenance vocabulary even though they are different systems (see `operational-boundary.md` §5).
- All cross-entity relations are Sanity `reference` (or `array of reference`) fields, never inlined/duplicated documents. This is what makes "edit once, every referencing page updates" true.
- `slug` fields use Sanity's native `slug` type, `source: 'name'`, with a **custom uniqueness scope of `(entityType)`**, not global — two different entity types may reuse a slug fragment where the namespace itself disambiguates (`/parts/joint-housing/` vs. a differently-slugged `/engineering/...` page), but two `Part` documents may never share a slug.
- No field on any document in this file may hold customer names, CAD files, RFQ content, quote pricing, or any other private operational data — enforced by convention here, and structurally in `operational-boundary.md` (Sanity has no schema field capable of referencing a `Company`/`Rfq`/`CadPackage`/`Order` row at all).

```ts
// Shared fragment — not a standalone document type.
const traceableFields = [
  { name: 'status', type: 'string',
    options: { list: ['draft', 'researched', 'reviewed', 'published', 'deprecated'] } },
  { name: 'evidenceRefs', type: 'array', of: [{ type: 'reference', to: [{ type: 'evidence' }] }] },
  { name: 'lastVerified', type: 'date' },
]
```

## 2. Core manufacturing/knowledge entities

```ts
defineType({
  name: 'part',
  title: 'Part',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: R => R.required() },
    { name: 'slug', type: 'slug', options: { source: 'name' }, validation: R => R.required() },
    { name: 'aliases', type: 'array', of: [{ type: 'string' }] }, // alternate names/search phrasings, NOT separate pages
    { name: 'summary', type: 'text' }, // short, for cards/meta description — NOT the page body
    { name: 'partFamily', type: 'string' }, // free-text grouping, e.g. "housing", "shaft", "bracket"
    { name: 'relatedParts', type: 'array', of: [{ type: 'reference', to: [{ type: 'part' }] }] },
    { name: 'partOfAssemblies', type: 'array', of: [{ type: 'reference', to: [{ type: 'assembly' }] }] },
    { name: 'applications', type: 'array', of: [{ type: 'reference', to: [{ type: 'application' }] }] },
    { name: 'processes', type: 'array', of: [{ type: 'reference', to: [{ type: 'processCapability' }] }] },
    { name: 'materials', type: 'array', of: [{ type: 'reference', to: [{ type: 'material' }] }] },
    { name: 'engineeringProblems', type: 'array', of: [{ type: 'reference', to: [{ type: 'engineeringProblem' }] }] },
    { name: 'inspectionConcepts', type: 'array', of: [{ type: 'reference', to: [{ type: 'inspectionConcept' }] }] },
    { name: 'lifecycleStages', type: 'array', of: [{ type: 'reference', to: [{ type: 'lifecycle' }] }] },
    { name: 'contentBlocks', type: 'array', of: [{ type: 'reference', to: [{ type: 'contentBlock' }] }] },
    ...traceableFields,
  ],
})

defineType({
  name: 'assembly',
  title: 'Assembly',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: R => R.required() },
    { name: 'slug', type: 'slug', options: { source: 'name' }, validation: R => R.required() },
    { name: 'summary', type: 'text' },
    { name: 'contains', type: 'array', of: [{ type: 'reference', to: [{ type: 'part' }] }] }, // ordered, but NOT ownership
    { name: 'applications', type: 'array', of: [{ type: 'reference', to: [{ type: 'application' }] }] },
    { name: 'processes', type: 'array', of: [{ type: 'reference', to: [{ type: 'processCapability' }] }] },
    { name: 'materials', type: 'array', of: [{ type: 'reference', to: [{ type: 'material' }] }] },
    { name: 'contentBlocks', type: 'array', of: [{ type: 'reference', to: [{ type: 'contentBlock' }] }] },
    ...traceableFields,
  ],
})

defineType({
  name: 'application',
  title: 'Application',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: R => R.required() },
    { name: 'slug', type: 'slug', options: { source: 'name' }, validation: R => R.required() },
    { name: 'summary', type: 'text' },
    { name: 'domain', type: 'reference', to: [{ type: 'domain' }] }, // optional, nav-grouping only — never in the canonical path
    { name: 'usedParts', type: 'array', of: [{ type: 'reference', to: [{ type: 'part' }] }] },
    { name: 'usedAssemblies', type: 'array', of: [{ type: 'reference', to: [{ type: 'assembly' }] }] },
    { name: 'relevantProcesses', type: 'array', of: [{ type: 'reference', to: [{ type: 'processCapability' }] }] },
    { name: 'relevantMaterials', type: 'array', of: [{ type: 'reference', to: [{ type: 'material' }] }] },
    { name: 'engineeringProblems', type: 'array', of: [{ type: 'reference', to: [{ type: 'engineeringProblem' }] }] },
    { name: 'contentBlocks', type: 'array', of: [{ type: 'reference', to: [{ type: 'contentBlock' }] }] },
    ...traceableFields,
  ],
})

defineType({
  name: 'processCapability',
  title: 'Process Capability',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: R => R.required() }, // e.g. "5-Axis Machining"
    { name: 'slug', type: 'slug', options: { source: 'name' }, validation: R => R.required() },
    { name: 'summary', type: 'text' },
    { name: 'appliesToParts', type: 'array', of: [{ type: 'reference', to: [{ type: 'part' }] }] },
    { name: 'appliesToAssemblies', type: 'array', of: [{ type: 'reference', to: [{ type: 'assembly' }] }] },
    { name: 'compatibleMaterials', type: 'array', of: [{ type: 'reference', to: [{ type: 'material' }] }] },
    { name: 'contentBlocks', type: 'array', of: [{ type: 'reference', to: [{ type: 'contentBlock' }] }] },
    ...traceableFields,
  ],
})

defineType({
  name: 'material',
  title: 'Material',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: R => R.required() }, // e.g. "7075-T6 Aluminum"
    { name: 'slug', type: 'slug', options: { source: 'name' }, validation: R => R.required() },
    { name: 'summary', type: 'text' },
    { name: 'usedByParts', type: 'array', of: [{ type: 'reference', to: [{ type: 'part' }] }] },
    { name: 'compatibleProcesses', type: 'array', of: [{ type: 'reference', to: [{ type: 'processCapability' }] }] },
    { name: 'contentBlocks', type: 'array', of: [{ type: 'reference', to: [{ type: 'contentBlock' }] }] },
    ...traceableFields,
  ],
})

defineType({
  name: 'engineeringProblem',
  title: 'Engineering Problem',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: R => R.required() }, // e.g. "Bearing Bore Concentricity"
    { name: 'slug', type: 'slug', options: { source: 'name' }, validation: R => R.required() },
    { name: 'summary', type: 'text' },
    { name: 'addressedInParts', type: 'array', of: [{ type: 'reference', to: [{ type: 'part' }] }] },
    { name: 'addressedInAssemblies', type: 'array', of: [{ type: 'reference', to: [{ type: 'assembly' }] }] },
    { name: 'relevantApplications', type: 'array', of: [{ type: 'reference', to: [{ type: 'application' }] }] },
    { name: 'contentBlocks', type: 'array', of: [{ type: 'reference', to: [{ type: 'contentBlock' }] }] },
    ...traceableFields,
  ],
})

defineType({
  name: 'lifecycle',
  title: 'Lifecycle Stage',
  type: 'document',
  fields: [
    { name: 'stage', type: 'string',
      options: { list: ['prototype', 'low_volume', 'production', 'end_of_life'] },
      validation: R => R.required() },
    { name: 'summary', type: 'text' },
    { name: 'relevantToParts', type: 'array', of: [{ type: 'reference', to: [{ type: 'part' }] }] },
    { name: 'contentBlocks', type: 'array', of: [{ type: 'reference', to: [{ type: 'contentBlock' }] }] },
    ...traceableFields,
  ],
})

defineType({
  name: 'inspectionConcept',
  title: 'Inspection Concept',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: R => R.required() }, // e.g. "CMM Bore Report"
    { name: 'slug', type: 'slug', options: { source: 'name' }, validation: R => R.required() },
    { name: 'summary', type: 'text' },
    { name: 'relevantToParts', type: 'array', of: [{ type: 'reference', to: [{ type: 'part' }] }] },
    { name: 'relevantToProcesses', type: 'array', of: [{ type: 'reference', to: [{ type: 'processCapability' }] }] },
    { name: 'contentBlocks', type: 'array', of: [{ type: 'reference', to: [{ type: 'contentBlock' }] }] },
    ...traceableFields,
  ],
})
```

## 3. `ContentBlock` — the reusable content contract

Two distinct kinds, disambiguated by `blockKind`. This is the design decision referenced in `architecture-decision.md` §5 and proven out in `rendering-revalidation.md` §3.

```ts
defineType({
  name: 'contentBlock',
  title: 'Content Block',
  type: 'document',
  fields: [
    { name: 'blockKind', type: 'string',
      options: { list: ['knowledge', 'relational'] }, validation: R => R.required() },

    { name: 'blockType', type: 'string', validation: R => R.required(),
      description: 'Reusable, extensible vocabulary — not a hard-coded enum in code. ' +
        'Starting set (per the issue): definition, part_variants, critical_features, materials, ' +
        'manufacturing_routes, inspection_strategy, applications, prototype_to_production, ' +
        'example_rfq, files_to_send, faq, cta.' },

    { name: 'title', type: 'string' },

    // --- knowledge blocks only: authored, reusable prose ---
    { name: 'body', type: 'array', of: [{ type: 'block' }],
      hidden: ({ document }) => document?.blockKind !== 'knowledge' },

    // --- relational blocks only: no prose, a typed pointer to a render-time aggregation ---
    { name: 'renderQuery', type: 'string',
      options: { list: [
        'related_parts', 'related_applications', 'related_processes',
        'related_materials', 'example_rfq_fields', 'faq_from_intent_cluster',
      ] },
      hidden: ({ document }) => document?.blockKind !== 'relational',
      description: 'Named query the renderer resolves against the current page\'s primary/secondary ' +
        'entities at request/build time. See rendering-revalidation.md §3.' },

    // Scope: which entities this block is authoritative content for. Required on knowledge blocks —
    // this is what lets the revalidation system find every page that must refresh when this block changes.
    { name: 'appliesToEntityRefs', type: 'array',
      of: [{ type: 'reference', to: [
        { type: 'part' }, { type: 'assembly' }, { type: 'application' }, { type: 'processCapability' },
        { type: 'material' }, { type: 'engineeringProblem' }, { type: 'lifecycle' }, { type: 'inspectionConcept' },
      ] }],
      validation: R => R.custom((refs, ctx) =>
        (ctx.document?.blockKind === 'knowledge' && (!refs || refs.length === 0))
          ? 'Knowledge blocks must declare at least one entity they apply to' : true) },

    { name: 'evidenceRefs', type: 'array', of: [{ type: 'reference', to: [{ type: 'evidence' }] }] },
    { name: 'confidence', type: 'string', options: { list: ['low', 'medium', 'high', 'verified'] } },
    { name: 'lastVerified', type: 'date' },
  ],
})
```

**Why this split matters, concretely:** a `critical_features` block about bearing-bore concentricity is a **knowledge** block, `appliesToEntityRefs: [engineeringProblem:bearing-bore-concentricity]`. It is pulled onto every `Part` page whose `engineeringProblems` array includes that `EngineeringProblem` — by resolving the relation at render time, not by the `Part` document embedding a copy of the block. A `part_variants` block on an `Application` page (e.g. "parts used in Humanoid Robots") is a **relational** block, `renderQuery: 'related_parts'` — it has no authored body at all; the renderer resolves `application.usedParts` live. Editing the joint-housing `Part`'s `applications` array is therefore the entire mechanism for that variant list to update; there is nothing to "sync."

## 4. Publishing/evidence entities

```ts
defineType({
  name: 'evidence',
  title: 'Evidence',
  type: 'document',
  fields: [
    { name: 'claimId', type: 'string', validation: R => R.required(),
      description: 'Stable id for the specific claim this evidence backs, e.g. "joint-housing-bearing-bore-tolerance". ' +
        'Multiple Evidence documents may share a claimId (corroborating or superseding sources over time).' },
    { name: 'sourceUrl', type: 'url' },
    { name: 'sourceType', type: 'string',
      options: { list: ['ai_inferred', 'supplier_marketing', 'documentation_verified',
                         'quote_derived', 'production_proven', 'manual_entry'] },
      description: 'Same vocabulary as lib/types.ts SourceType, kept identical across both systems ' +
        'so a claim\'s provenance rule reads the same way in Sanity and Postgres.',
      validation: R => R.required() },
    { name: 'sourceTitle', type: 'string' },
    { name: 'observedFact', type: 'text', validation: R => R.required() },
    { name: 'confidence', type: 'string', options: { list: ['low', 'medium', 'high', 'verified'] },
      validation: R => R.required() },
    { name: 'lastVerified', type: 'date', validation: R => R.required() },
    { name: 'notes', type: 'text' },
  ],
})

defineType({
  name: 'searchIntentCluster',
  title: 'Search Intent Cluster',
  type: 'document',
  fields: [
    { name: 'clusterId', type: 'string', validation: R => R.required() }, // e.g. "INT-01"
    { name: 'representativeQueries', type: 'array', of: [{ type: 'string' }] },
    { name: 'primaryEntityRef', type: 'reference', to: [
        { type: 'part' }, { type: 'assembly' }, { type: 'application' },
        { type: 'processCapability' }, { type: 'engineeringProblem' } ] },
    { name: 'resolvedPageId', type: 'reference', to: [{ type: 'pageRegistry' }] },
    { name: 'commercialStrength', type: 'string', options: { list: ['low', 'medium', 'high'] } },
    { name: 'serpFragmentation', type: 'string', options: { list: ['giant_platform_dominated', 'fragmented_specialist', 'mixed'] } },
    { name: 'notes', type: 'text' },
  ],
})
```

`pageRegistry` schema is defined in full in `page-registry.md` (it owns that document type; repeated here would drift).

## 5. Helper entities

```ts
defineType({
  name: 'domain',
  title: 'Domain (navigation grouping only)',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: R => R.required() }, // e.g. "Robotics", "Industrial Automation Equipment"
    { name: 'summary', type: 'text' },
    { name: 'applications', type: 'array', of: [{ type: 'reference', to: [{ type: 'application' }] }] },
  ],
  // Deliberately has NO slug field and NO canonical_path anywhere in the system references it for URL
  // construction — see url-namespace-policy.md §2. It exists purely so "Robotics" is an editable,
  // queryable grouping without being a graph root or a URL segment.
})

defineType({
  name: 'navNode',
  title: 'Navigation Node',
  type: 'document',
  fields: [
    { name: 'label', type: 'string', validation: R => R.required() },
    { name: 'parentNavNode', type: 'reference', to: [{ type: 'navNode' }] },
    { name: 'target', type: 'reference', to: [{ type: 'pageRegistry' }] },
    { name: 'order', type: 'number' },
    { name: 'menu', type: 'string', options: { list: ['primary', 'footer', 'sidebar'] },
      description: 'Which rendered menu this node belongs to — the same PageRegistry entry may ' +
        'appear via multiple navNode documents in different menus/parents.' },
  ],
})

defineType({
  name: 'entityRelation',
  title: 'Entity Relation (evidence-bearing edge, optional)',
  type: 'document',
  fields: [
    { name: 'fromRef', type: 'reference', to: [/* any knowledge entity type */], validation: R => R.required() },
    { name: 'toRef', type: 'reference', to: [/* any knowledge entity type */], validation: R => R.required() },
    { name: 'relationType', type: 'string' }, // e.g. "used_in", "addresses", "requires"
    { name: 'confidence', type: 'string', options: { list: ['low', 'medium', 'high', 'verified'] } },
    { name: 'evidenceRefs', type: 'array', of: [{ type: 'reference', to: [{ type: 'evidence' }] }] },
    { name: 'lastVerified', type: 'date' },
  ],
  // Used only when a specific relation itself needs provenance independent of either endpoint.
  // Not required by any worked example in this pass — see entity-relationship.md §2.3.
})
```

## 6. Provenance model (issue invariant #7, applied concretely)

Every entity document above carries `status`/`evidenceRefs`/`lastVerified` via `traceableFields`. Every `ContentBlock` additionally carries its own `evidenceRefs`/`confidence`/`lastVerified`, because a block can be reused across entities with different overall confidence — the block's own provenance is what actually appears on the page, not an inherited rollup from whichever entity happens to reference it. A `Part` document's own `evidenceRefs` covers claims stated directly in its structured fields (e.g. `partFamily`, the existence of the relation itself); claims stated in prose live in the `ContentBlock`'s own `evidenceRefs`. This two-tier model avoids the ambiguity of "which evidence backs which sentence" that a single flat `evidence[]` array on the page would create.

## 7. What is deliberately not in this schema

- No field anywhere accepts a file upload of CAD/drawing/BOM content, or a reference to `lib/types.ts`'s `CadPackage`/`Rfq`/`Revision` types. See `operational-boundary.md` §2.
- No `country` field on any entity or on `PageRegistry` (see `url-namespace-policy.md` §4 — no permutation surface).
- No `permutationOf` or auto-generation field of any kind on `Part`/`Material`/`ProcessCapability` — the only mechanism that can make a combination of entities into a URL is a human-approved `PageRegistry` record (`page-registry.md` §3).
