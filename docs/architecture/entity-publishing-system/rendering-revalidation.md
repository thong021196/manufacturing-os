# Rendering & Revalidation

Target conceptual flow (per the issue): Sanity public knowledge → entity graph → relations/evidence/content blocks → Page Registry → Next.js renderer → complete static/server-rendered HTML. This document describes that flow and the dependency-driven revalidation strategy. **No code is added in this pass** — the repo's `next.config.ts`/`app/` directory are untouched, and per the issue's own implementation constraint, any actual Next.js code in a future pass must first read this checkout's version-specific docs (this repo runs Next 16.3.5, resolved via `node_modules/next/dist/docs/` relative to the app; that directory is not present in this docs-only pass since no Next code is being written — the constraint is recorded here for whoever picks up the BUILD phase).

## 1. Route resolution: PageRegistry is the only source of routes

Conceptually, the renderer's routing layer does not walk the entity graph to decide what pages exist. It queries `pageRegistry` for records where `publishStatus: published`, and for each one:

1. Resolves `canonicalPath` → route.
2. Loads `primaryEntityRef` (if present) and `secondaryEntityRefs`.
3. Loads every `ContentBlock` reachable from those entities (via each entity's own `contentBlocks[]`, plus any `ContentBlock` whose `appliesToEntityRefs` includes an entity on this page — see §3).
4. For `blockKind: relational` blocks, resolves the named `renderQuery` against the page's primary/secondary entities (e.g. `related_parts` on an Application page walks `application.usedParts`).
5. Composes the full page (all sections, all metadata) server-side and emits complete HTML — no block is deferred to a client-side fetch. This directly satisfies invariant #11 ("primary SEO content must not depend on client-only loading"): every `ContentBlock`, every relational aggregation, and every breadcrumb is resolved before the response is sent (via static generation at build time for `published` pages, or server-side rendering on request for anything needing fresher data), never as an empty shell hydrated later.

A `pageRegistry` record with `publishStatus` anything other than `published` produces **no route at all** in the public renderer — not a 404 page, not a stub, simply nothing registered. This is what makes the Page Registry an actual firewall rather than a display filter: there is no rendering code path that can accidentally expose a draft page's URL.

## 2. What "complete crawlable HTML" means here, concretely

- Static generation (Next's build-time prerendering) is the default for `published` pages, since public knowledge content changes on an editorial cadence (hours/days), not per-request.
- Server-side rendering on request is reserved for pages whose content depends on something that must be fresh at request time and isn't practical to fully pre-render (none of the pages this pass proves out — Robot Joint Housing, Humanoid, 5-Axis — need this; they are pure knowledge-graph composition and are static-generation candidates). `/rfq/` pages, which involve form state and may eventually show live capacity/lead-time information, are the most likely future candidate for server rendering rather than static generation — flagged for the BUILD phase, not decided here.
- Either way, the HTML returned to the first request (including to a crawler with no JS execution) contains the full composed page — headings, body content from every `ContentBlock`, the resolved list from every relational block, breadcrumbs, structured data. Nothing is client-fetched for the primary content to be readable/indexable.

## 3. Dependency-driven revalidation — the `bearing_bore` example, worked through

The issue's own test case: updating a reusable `bearing_bore` knowledge block should revalidate joint housing, actuator housing, and bearing housing pages "without rewriting each page manually." Mechanism:

1. `bearing_bore` is authored as one `ContentBlock` document, `blockKind: knowledge`, `blockType: critical_features`, `appliesToEntityRefs: [engineeringProblem:bearing-bore-concentricity]`.
2. `EngineeringProblem: bearing-bore-concentricity` has `addressedInParts: [Part:robot-joint-housing, Part:actuator-housing, Part:bearing-housing]` (a plain reference array, per `entity-relationship.md` §1).
3. Each of those three `Part` documents lists `EngineeringProblem: bearing-bore-concentricity` in its own `engineeringProblems[]` array (the inverse edge — Sanity references are navigable in both directions via a backlink/reverse-reference query, so this does not require manually duplicating the relation on both documents, though the schema keeps both fields for query ergonomics).
4. The **dependency index** (a derived, queryable structure — either a Sanity GROQ query run at revalidation time, or a materialized reverse-index refreshed on each publish, per the BUILD phase's choice) answers: "which `pageRegistry` records have a `primaryEntityRef` or `secondaryEntityRefs` entry whose resolved `ContentBlock` set includes this changed block?" For the `bearing_bore` edit, that query returns exactly the three `pageRegistry` records for Robot Joint Housing, Actuator Housing, and Bearing Housing (per `worked-examples.md` §1's relations) — not the whole site, and not zero pages either.
5. Each returned page's static output is regenerated (Next's on-demand revalidation, triggered from Sanity's webhook-on-publish) and its `pageRegistry.contentVersion` is incremented (§4 below) so caches/CDNs invalidate correctly.

Because the block is a **reference**, not a copy, step 3 requires no per-page authoring at all when the block's own body changes — only the one-time authoring of the relation in step 2/3 when the `Part` was first set up. This is the entire mechanism; there is no separate "sync" or "propagation" job beyond the dependency query + selective revalidation. Relational blocks (§3 of `sanity-schema-proposal.md`) need no propagation step at all, since they compute their result fresh on every (re)generation from the live graph rather than storing anything to go stale.

## 4. `contentVersion` and cache keys

`pageRegistry.contentVersion` (an integer, `sanity-schema-proposal.md`/`page-registry.md` §1) is incremented whenever a page's composed output changes for any reason — its own content edited directly, or a dependency revalidation per §3. It is not auto-derived from Sanity's internal document `_rev` in this proposal (a single Sanity `_rev` bump on an unrelated field of the same document would trigger a version bump that doesn't reflect a real content change, and a dependency-triggered revalidation touches zero fields on the `pageRegistry` document itself unless something explicitly increments this field) — **left as an unresolved implementation detail for the BUILD phase (UQ-6, see `migration-plan.md`)**: whether the increment is done by an explicit Sanity Studio document action, a webhook handler computing a content hash, or another mechanism. Its purpose here is only to guarantee the architecture has *a* stable version signal available to key CDN/ISR caches by, independent of which specific mechanism computes it later.

## 5. What the renderer is explicitly not allowed to do

- Generate a route for any entity or relation that has no `pageRegistry` record (§1 — this is the Page Registry's entire purpose, restated at the rendering layer so it's enforced in two independent places: authoring-time in Sanity, and route-resolution-time in the renderer).
- Fetch primary SEO content client-side after an initial empty/loading shell (invariant #11).
- Read any Postgres/Supabase table directly for public page content. The renderer's public-page data source is Sanity only; anything from the operational database that might legitimately appear on a public page (there is no such case identified in this pass — see `operational-boundary.md` §2) would need to go through an explicit, reviewed public-facing summary field, never a live join.

## 6. Relationship to the existing frontend shell

The current `app/` tree (Issue #2) is entirely internal-tooling pages (`app/discovery`, `app/execution`, `app/supply`, `app/intelligence`, `app/knowledge`) reading `lib/mock/data.ts` via `lib/data.ts`. None of it renders public-facing SEO pages today. This document's rendering model applies to a **new**, not-yet-built public route tree (the `/parts/`, `/applications/`, etc. namespaces from `url-namespace-policy.md`) that would sit alongside the existing internal tooling, sharing the Next.js app but not its routes or data source. No existing route, layout, or component is affected by anything in this document.
