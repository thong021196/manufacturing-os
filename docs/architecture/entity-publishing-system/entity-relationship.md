# Entity Relationship Model

Companion to `architecture-decision.md`. Defines every entity type, its relations, and why the graph — not a navigation tree — is the source of truth.

## 1. Entity graph (ERD, text form)

```
                                   ┌───────────────┐
                                   │  Application   │◄───────────┐
                                   │ (e.g. Humanoid)│             │
                                   └───────┬────────┘             │ used_in (M:N)
                                           │ used_in (M:N)         │
                 ┌─────────────────────────┼───────────────────────┐
                 │                         │                       │
        ┌────────▼───────┐        ┌────────▼────────┐     ┌────────▼────────┐
        │      Part        │◄──────►│    Assembly      │     │ EngineeringProblem│
        │ (Joint Housing)  │ part_of│ (Humanoid Leg Kit)│     │ (bearing preload) │
        └───┬────┬────┬────┘        └────────┬─────────┘     └─────────┬─────────┘
            │    │    │                       │  contains (M:N)         │ addressed_by (M:N)
            │    │    │                       │  → Part                 │ → Part / Assembly
   uses_material│    │ requires_process        │                         │
            │    │    │                                                  │
  ┌─────────▼┐ ┌─▼────▼──────────┐                            (same M:N edge type)
  │ Material  │ │ ProcessCapability│
  │ (7075-T6) │ │ (5-Axis Machining)│
  └─────┬─────┘ └────────┬─────────┘
        │ compatible_with │ applies_to (M:N) → Part / Assembly
        └─────────┬───────┘
                   │
          ┌────────▼─────────┐        ┌────────────────┐        ┌───────────────────┐
          │     Lifecycle      │        │ InspectionConcept│        │  ContentBlock       │
          │ (stage taxonomy:   │        │ (CMM bore report) │        │ (reusable knowledge  │
          │  prototype/low-vol/│        │  relevant_to (M:N) │        │  or relational block) │
          │  production/EOL)   │        │  → Part/Process    │        │  attached_to (M:N)    │
          │  relevant_to (M:N)  │        └───────────────────┘        │  → any entity above   │
          └─────────────────────┘                                    └──────────┬────────────┘
                                                                                   │ cites (M:N)
                                                                          ┌────────▼─────────┐
                                                                          │     Evidence       │
                                                                          │ (source/confidence/ │
                                                                          │  last_verified)     │
                                                                          └────────────────────┘

   ┌────────────────────┐        publishes         ┌────────────────────┐
   │   PageRegistry       │ ─────primary_entity────► │ (any entity above)  │
   │ (one row per URL)     │ ─────secondary_entities─►│ (0..N)              │
   │  search_intent_cluster│                          └────────────────────┘
   └─────────┬─────────────┘
             │ resolved_by
   ┌─────────▼─────────────┐
   │ SearchIntentCluster     │ ◄── groups ──  (many) SearchQuery-shaped rows (Postgres, see operational-boundary.md)
   └────────────────────────┘

   ┌────────────────────┐   groups (optional, nav-only)   ┌────────────────────┐
   │       Domain          │ ─────────────────────────────► │    Application       │
   │ (Robotics, Industrial  │                                 └────────────────────┘
   │  Automation, Drones…)  │
   └────────────────────────┘

   ┌────────────────────┐   renders (optional, nav-only)   ┌────────────────────┐
   │       NavNode          │ ─────────────────────────────► │     PageRegistry      │
   └────────────────────────┘
```

## 2. Entity types

### 2.1 Manufacturing / knowledge entities (Sanity)

| Entity | What it represents | Key relations (all M:N unless noted) |
|---|---|---|
| `Part` | A single physical component concept (e.g. "Robot Joint Housing"). The atomic unit of the parts catalog. | `related_parts` (Part↔Part), `applications` (↔Application), `processes` (↔ProcessCapability), `materials` (↔Material), `engineering_problems` (↔EngineeringProblem), `inspection_concepts` (↔InspectionConcept), `lifecycle_stages` (↔Lifecycle), `content_blocks` (↔ContentBlock), `evidence_refs` (↔Evidence), `part_of_assemblies` (↔Assembly, inverse of Assembly.contains) |
| `Assembly` | A set of Parts that ship/are specified together (e.g. "Humanoid Leg Joint Kit"). Not a page-tree parent of its Parts — a peer entity that references them. | `contains` (→Part, ordered array), `applications`, `processes`, `materials`, `content_blocks`, `evidence_refs` |
| `Application` | A buyer-persona / end-use context (e.g. "Humanoid Robots", "Industrial Automation Equipment"). Does **not** own Parts — it references the ones relevant to it. | `used_parts` (↔Part), `used_assemblies` (↔Assembly), `relevant_processes`, `relevant_materials`, `engineering_problems`, `content_blocks`, `evidence_refs`, `domain` (→Domain, optional, nav-grouping only) |
| `ProcessCapability` | A manufacturing capability class as public knowledge (e.g. "5-Axis Machining"), distinct from the private, supplier-specific `SupplierCapability` in Postgres (see `operational-boundary.md` §4). | `applies_to_parts` (↔Part), `applies_to_assemblies`, `compatible_materials` (↔Material), `content_blocks`, `evidence_refs` |
| `Material` | A material spec class (e.g. "7075-T6 Aluminum"). | `used_by_parts` (↔Part), `compatible_processes` (↔ProcessCapability), `content_blocks`, `evidence_refs` |
| `EngineeringProblem` | A recurring technical problem/decision (e.g. "Bearing Bore Concentricity", "IP-Rated Sealing"). This is the entity type most content blocks attach to, since it's the natural home for durable technical explanation reused across many Parts. | `addressed_in_parts` (↔Part), `addressed_in_assemblies`, `relevant_applications`, `content_blocks`, `evidence_refs` |
| `Lifecycle` | A small, fixed taxonomy of production-maturity stages (`prototype`, `low_volume`, `production`, `end_of_life`) plus any stage-specific guidance. Modeled as an entity (not a bare enum) so it can carry its own `content_blocks`/`evidence_refs` (e.g. "what changes about DFM once you go from prototype to production"). | `relevant_to_parts` (↔Part), `relevant_to_assemblies`, `content_blocks`, `evidence_refs` |
| `InspectionConcept` | A QC/inspection method or standard as public knowledge (e.g. "CMM Bore Report", "AS9102-style First Article"). Distinct from the private, job-specific `QcResult` in Postgres. | `relevant_to_parts`, `relevant_to_processes`, `content_blocks`, `evidence_refs` |

### 2.2 Publishing / evidence entities (Sanity)

| Entity | What it represents | Key fields / relations |
|---|---|---|
| `Evidence` | One sourced claim backing one fact used anywhere in the graph. | `evidence_id`, `claim_id`, `source_url`, `source_type`, `source_title`, `observed_fact`, `confidence`, `last_verified`, `notes`. Referenced (cited) from any `ContentBlock` and, directly, from any entity field that states a specific technical claim. |
| `SearchIntentCluster` | A deduplicated search-intent group (PR #21's `intent-clusters.csv` concept, formalized). Deliberately kept separate from the manufacturing/RFQ taxonomy — see §4. | `cluster_id`, `representative_queries[]`, `primary_entity_ref`, `resolved_page_id` (→PageRegistry), `commercial_strength`, `serp_fragmentation`, `notes` |
| `ContentBlock` | A reusable, typed unit of structured content. See `sanity-schema-proposal.md` §3 for the full type contract (knowledge vs. relational blocks). | `block_id`, `block_type`, `title`, `body` (portable text, knowledge blocks only), `render_query` (relational blocks only), `applies_to_entity_refs[]`, `evidence_refs[]`, `confidence` (rollup), `last_verified` |
| `PageRegistry` | One record per public URL. The publishing firewall. See `page-registry.md` for the full schema and lifecycle. | `page_id`, `page_type`, `primary_entity_ref`, `secondary_entity_refs[]`, `canonical_path`, `slug`, `search_intent_cluster`, `index_policy`, `build_status`, `priority`, `content_version`, `publish_status`, `last_reviewed` |

### 2.3 Helper entities (additional, allowed by the issue where they reduce duplication)

| Entity | Why it exists | Notes |
|---|---|---|
| `Domain` | Groups `Application` entities for navigation/marketing purposes only (e.g. "Robotics" groups Humanoid, Industrial Robot Arm, AMR, Exoskeleton, ROV applications). **Never appears in a canonical URL** — see `url-namespace-policy.md` §2. Exists so "Robotics" can be a first-class navigational concept (per the issue: "Robotics is the first application domain, not the root ontology") without becoming a URL segment or a parent of Part/Material/ProcessCapability. | Optional field on `Application` only. |
| `NavNode` | An explicit, editable navigation-tree node, decoupled from canonical identity. Solves invariant #13 ("URL identity must not depend on current navigation hierarchy"). A `NavNode` points at a `PageRegistry` record (or an external/section link) and has its own `parent_nav_node`, `label`, `order`. Multiple `NavNode`s may point at the same `PageRegistry` record from different places in different menus without affecting that page's canonical URL. | See `internal-linking.md` §2 for the full contract and why this is not the same thing as a breadcrumb. |
| `EntityRelation` | An **optional** upgrade for a specific M:N edge, used only when the relation itself is a claim that needs its own evidence/confidence (e.g. "Robot Joint Housings are used in Humanoid Robots" is itself something a competitor's page or industry source can corroborate, distinct from the joint-housing Part's own evidence). Most edges stay plain bidirectional references (cheaper, sufficient); an edge is promoted to an `EntityRelation` document only when it needs its own `evidence_refs`/`confidence`/`last_verified` independent of either endpoint. | `relation_id`, `from_ref`, `to_ref`, `relation_type`, `confidence`, `evidence_refs[]`, `last_verified`. Not required for the worked examples in this pass (plain references suffice there) — included so the schema doesn't need a breaking change the first time a relation-level claim shows up. |

## 3. Why many-to-many, not parent-child

Every arrow in §1 above is bidirectional and unowned by either endpoint. Concretely:

- A `Part` (Robot Joint Housing) is referenced by **multiple** `Application`s (Humanoid, Industrial Robot Arm) — it is not a child of either.
- An `Application` (Humanoid) references **multiple** `Part`s and `ProcessCapability`s — it does not contain or copy their content, only aggregates references to it at render time (see `internal-linking.md` §1 and `rendering-revalidation.md` §3).
- A `ProcessCapability` (5-Axis Machining) applies to **multiple** `Part`s across **multiple** `Application`s, without ever generating a page for every (`ProcessCapability` × `Part`) pair — see `page-registry.md` §3 "relation ≠ page."

This is what makes acceptance tests 1–3 possible: Robot Joint Housing exists once and is reachable from every application that uses it; Humanoid aggregates without owning; 5-Axis Machining aggregates without permutation. `worked-examples.md` walks all three end to end with the actual relation values.

## 4. Search-intent taxonomy vs. manufacturing/RFQ taxonomy (kept separate, linked)

Per invariant #15, these are two different graphs that share reference points, not one graph:

- **Manufacturing/RFQ taxonomy**: the entity graph in §1 — `Part`, `Assembly`, `Application`, `ProcessCapability`, `Material`, `EngineeringProblem`, `Lifecycle`, `InspectionConcept`. This describes what is *true about manufacturing*, independent of how anyone searches for it.
- **Search-intent taxonomy**: `SearchIntentCluster` (Sanity, structural) plus, operationally, `SearchQuery`/`SearchSurface`/`SearchPerformanceRecord` (Postgres, per `lib/types.ts` and `search-intent-integration.md`). This describes how buyers phrase what they want, which SERP segment they land in, and which page currently serves that intent.

The link is exactly one field wide in each direction: `SearchIntentCluster.primary_entity_ref` (search → manufacturing) and `PageRegistry.search_intent_cluster` (page → search). Neither taxonomy is a subtree of the other. This is why "harmonic reducer housing" can be a real `Part` in the manufacturing graph (it is a real thing suppliers machine) while simultaneously having a `validate_first` (not yet `validated`) `SearchIntentCluster` — the manufacturing fact and the search evidence for publishing it are tracked on separate, linked axes, exactly matching PR #21's own `build_status` distinction. See `search-intent-integration.md` for the full mapping and `worked-examples.md` for a concrete instance.

## 5. Why navigation may still render as a tree

Humans need trees (breadcrumbs, sidebar menus, a mental model of "where am I"). The graph does not forbid that — it forbids the tree from being the *storage* model. `NavNode` (§2.3) is an explicit, separate, editable rendering of some subset of `PageRegistry` entries into one or more trees. Two different `NavNode` trees can present the same `Part` page under different parents (e.g. under "Applications → Humanoid" in one menu and under "Parts → Housings" in another) without duplicating the page, changing its canonical URL, or requiring the entity graph to pick a single "true" parent. See `internal-linking.md` for the full breadcrumb/navigation contract and how it differs from canonical identity.
