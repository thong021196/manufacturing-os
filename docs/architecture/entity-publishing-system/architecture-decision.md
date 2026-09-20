# Architecture Decision — Entity-Driven Content & Publishing System

Issue: #22 ("Pass 7 — Entity-driven content architecture before 100-page SEO build")
Status: **Proposed, not implemented.** No app/lib/components code changed. No Sanity project created. No pages published.
Owner priority order (binding, per the approval comment on #22): (1) lock entity graph + Page Registry + structured content blocks, (2) define stable namespaces + canonical policy, (3) map PR #21 candidates into the new model, (4) prove the architecture with Robot Joint Housing / Humanoid / 5-Axis, (5) prove future-domain reuse without URL migration.

## 1. Problem

PR #21 (Issue #20) produced a real, evidence-backed 34-page candidate site map. It is good *search-intent research*, but its shape is page-centric and robotics-rooted:

- Every page is a flat CSV row: one page = one bundle of copy. Two pages that both need bearing-fit tolerance guidance (e.g. joint housing and bearing housing) would each carry their own copy of that guidance, not a shared source.
- The proposed URL prefix is `/robot-parts/...`. Every future non-robotics application (industrial automation equipment, drones, EV/industrial hardware) would either have to squat under `/robot-parts/` (wrong) or force a URL migration on every existing indexed page (expensive, SEO-destructive) the day a second domain is added.
- There is no explicit gate between "this relationship exists in research" and "this URL is public and indexed." The PR21 authors clearly *wanted* this gate (their own `build_status` column proves it), but nothing in the data model enforces it structurally — it's a spreadsheet convention, not a system invariant.
- Nothing stops a future contributor from generating `part × material × process × robot-type × country` pages once the object-first pattern is established, because nothing owns "what pages exist" separately from "what facts exist."

Issue #22 asks us to fix this **before** ~100 production pages get built on top of the PR #21 shape, because it is far cheaper to fix the model now than to migrate 100+ live URLs later.

## 2. Decision

Adopt a four-layer architecture, in this order of authority:

```
1. Entity graph (source of truth: what is true)
   Part, Assembly, Application, ProcessCapability, Material,
   EngineeringProblem, Lifecycle, InspectionConcept
        │  relations are many-to-many, not a tree
        ▼
2. Content & evidence layer (source of truth: what we can say, and why)
   ContentBlock (reusable, referenced not copied)
   Evidence (source/confidence/last_verified per claim)
   SearchIntentCluster (query intent, separate axis from entities)
        │
        ▼
3. Page Registry (source of truth: what is public)
   One record per URL. Explicit approval required to exist/index.
   Entity relation ≠ public page.
        │
        ▼
4. Renderer (Next.js — presentation only, not a data owner)
   Reads PageRegistry → resolves primary/secondary entities →
   resolves ContentBlocks → server/static-renders complete HTML.
```

Public structured knowledge (layers 1–3) lives in Sanity. Private operational data (customers, RFQs, CAD/files, quotes, suppliers, inspection results, orders, outcomes) stays in Postgres/Supabase, referencing Sanity documents by id, never the reverse. See `operational-boundary.md`.

URL namespaces are domain-neutral from day one (`/parts/`, `/assemblies/`, `/applications/`, `/capabilities/`, `/engineering/`, `/materials/`, `/resources/`, `/quality/`, `/how-it-works/`, `/rfq/`) and do not encode "robotics" anywhere in path structure. See `url-namespace-policy.md`.

## 3. Why a graph, not a tree

A tree (the PR #21 shape: hub → object pages → child pages, application pages that *own* their listed objects) forces every fact into exactly one place in the hierarchy. But manufacturing reality is many-to-many: a robot joint housing is used in humanoid robots *and* industrial robot arms; 5-axis machining applies to joint housings, actuator housings, and brackets; 7075-T6 aluminum applies across dozens of parts. A tree either duplicates that content per branch (what PR #21 already risks — see its own `cannibalization-map.csv` "bearing housing is often integrated into joint/actuator housing" note) or arbitrarily picks one owning branch and cross-links the rest as an afterthought.

A graph lets every entity be authored exactly once and referenced from every relation that is true, while navigation (what a human sees as a tree in the sidebar or breadcrumb) is rendered *from* the graph rather than *being* the data model. See `entity-relationship.md` and `internal-linking.md` for the full argument and the acceptance-test walkthroughs in `worked-examples.md`.

## 4. Why a Page Registry, not "generate a page per entity/relation"

The single most concrete risk the issue calls out is Cartesian/permutation SEO: `part × material × process × robot-type × country`. A graph makes every one of those combinations *representable as a query* (which parts use 7075 AND appear in humanoid applications AND require 5-axis machining) — that is a feature, not a bug, for internal linking and future faceted research tooling. The danger is only if "representable as a query" silently becomes "exists as an indexable URL."

The Page Registry is the explicit firewall: a relation existing in the graph implies nothing about a URL existing. A URL exists only when a human (via the workflow's Human Gate) has approved a `PageRegistry` record for it, with an explicit `index_policy`. This is enforced structurally (the renderer refuses to build a route for an entity/relation that has no approved `PageRegistry` record — see `page-registry.md` and `rendering-revalidation.md`), not by a spreadsheet column.

## 5. Why content blocks, not one article body per page

PR #21's `pilot-pages.csv` already lists per-page "technical dimensions to cover" that repeat near-verbatim across related objects (bearing-bore tolerance language on both OBJ01 joint housing and OBJ05 bearing housing; anodizing/material language on OBJ01/OBJ02/OBJ07). Left as monolithic page copy, updating a shared fact means finding and editing every page that mentions it — infeasible at 1,000+ pages and a direct source of drift/inconsistency (one page gets corrected, its siblings don't).

`ContentBlock` documents are typed, reusable, referenced by id from every entity/page that needs them. Two kinds exist (see `sanity-schema-proposal.md` §3 for the full contract):

- **Knowledge blocks** — authored prose tied to a durable technical fact (e.g. a `critical_features` block explaining bearing-bore concentricity practice). Referenced by multiple `Part`/`Assembly` documents. Edit once, every referencing page picks it up on next render/revalidation.
- **Relational blocks** — not authored prose at all, but a typed instruction to render a live aggregation from the graph at request/build time (e.g. `part_variants`, `applications`, `example_rfq`). These never go stale because they are queries, not copies.

## 6. Tradeoffs accepted

- **More moving parts than a flat CSV/page list.** Justified because the issue's own scale target (1,000+ pages) makes the flat model unmaintainable; PR #21 was correctly scoped as a 34-page pilot, not a 1,000-page architecture.
- **Reference-based reuse requires disciplined authoring** (a badly-scoped `ContentBlock` reused somewhere it doesn't quite apply is worse than a slightly-duplicated paragraph). Mitigated by the `applies_to_entity_refs` explicit-scope field on every `ContentBlock` (see `sanity-schema-proposal.md`) and by keeping the block genuinely atomic — a block should describe one concept, not "the whole tolerance section of this specific page."
- **Revalidation is dependency-driven, not simple time-based ISR.** Requires an explicit reverse-index from `ContentBlock` → pages that reference it (directly or via an entity it's attached to). This is more infrastructure than "revalidate every N minutes," but is what makes "update `bearing_bore` once, N pages refresh" actually true. See `rendering-revalidation.md`.
- **Two "Part" concepts now exist in the codebase's vocabulary** — the new public `Part` knowledge entity proposed here, and the existing private `Part` interface in `lib/types.ts` (a specific physical part instance tied to one RFQ/revision). This is flagged as unresolved question UQ-1 below and in `operational-boundary.md`; it is not fixed in this pass.

## 7. What is explicitly NOT being built in this pass

- No Sanity project, schema deployment, or GROQ queries. Schemas in `sanity-schema-proposal.md` are a proposal (TypeScript/GROQ-style pseudocode in markdown fences), not files added to a real Sanity Studio.
- No Postgres/Supabase migrations. `operational-boundary.md` documents the target boundary against the *existing* `lib/types.ts` model; it does not alter that file.
- No changes to `app/`, `components/`, or `lib/` in this repository. The existing Next.js frontend shell (Issue #2) is untouched.
- No 100-page build-out. No page is published or deployed. No production URL changes.
- No redirect infrastructure, no GSC ingestion job, no automated permutation generation, no supplier-portal/marketplace/Shopify features (out of scope per AGENTS.md and the issue).
- No literal import of PR #21's research content into Sanity documents — `pr21-mapping.csv` and `migration-plan.md` describe *how* it would be imported in a future BUILD pass, without doing the import.

## 8. Acceptance criteria addressed here

This document, together with `entity-relationship.md`, `page-registry.md`, and `worked-examples.md`, is the primary evidence for acceptance tests 1, 2, 3, 6, 8, and 10 from the issue. The PR description enumerates exactly how each of the issue's 10 acceptance tests is satisfied, partially satisfied, or left as an unresolved architecture question.

## 9. Unresolved architecture questions raised by this document

See the consolidated list at the end of `migration-plan.md` (UQ-1 through UQ-9) for every unresolved question across all 13 deliverables, gathered in one place for the Human Gate review. UQ-1 (the "Part" naming collision) and UQ-3 (where "Robotics" sits in the model) originate directly from this document.
