# Page Registry

The firewall between "this relation exists in the graph" and "this is a public, indexable URL." One `pageRegistry` document per URL, full stop — the renderer has no other way to decide what routes exist (see `rendering-revalidation.md` §1).

## 1. Schema

```ts
defineType({
  name: 'pageRegistry',
  title: 'Page Registry',
  type: 'document',
  fields: [
    { name: 'pageId', type: 'string', validation: R => R.required() }, // stable internal id, e.g. "PART-ROBOT-JOINT-HOUSING"

    { name: 'pageType', type: 'string', validation: R => R.required(),
      options: { list: [
        'part', 'assembly', 'application', 'capability', 'engineering',
        'material', 'resource', 'quality', 'how_it_works', 'rfq', 'hub',
      ] },
      description: 'Determines which URL namespace this page lives in — see url-namespace-policy.md §1.' },

    { name: 'primaryEntityRef', type: 'reference',
      to: [ { type: 'part' }, { type: 'assembly' }, { type: 'application' }, { type: 'processCapability' },
            { type: 'material' }, { type: 'engineeringProblem' }, { type: 'inspectionConcept' }, { type: 'lifecycle' } ],
      description: 'Required for every pageType except resource/how_it_works/rfq, which may be pure ' +
        'informational/funnel pages with no single owning entity (primaryEntityRef omitted).' },

    { name: 'secondaryEntityRefs', type: 'array',
      of: [{ type: 'reference', to: [
        { type: 'part' }, { type: 'assembly' }, { type: 'application' }, { type: 'processCapability' },
        { type: 'material' }, { type: 'engineeringProblem' }, { type: 'inspectionConcept' }, { type: 'lifecycle' } ] }],
      description: 'Every other entity this page aggregates content from at render time (e.g. an ' +
        'Application page lists Part entities here so the renderer knows what to pull, without those ' +
        'Parts themselves gaining a second canonical page).' },

    { name: 'canonicalPath', type: 'string', validation: R => R.required(),
      description: 'The full path, e.g. "/parts/robot-joint-housing/". Must start with one of the ' +
        'namespaces in url-namespace-policy.md §1. Unique across the whole registry.' },

    { name: 'slug', type: 'slug', validation: R => R.required() },

    { name: 'searchIntentCluster', type: 'reference', to: [{ type: 'searchIntentCluster' }] },

    { name: 'indexPolicy', type: 'string', validation: R => R.required(),
      options: { list: ['index', 'noindex', 'canonical_redirect'] },
      description: '"canonical_redirect" means this record exists (e.g. for a merged query variant) ' +
        'but points readers/crawlers at another pageRegistry record\'s canonicalPath rather than rendering its own content.' },
    { name: 'redirectTarget', type: 'reference', to: [{ type: 'pageRegistry' }],
      hidden: ({ document }) => document?.indexPolicy !== 'canonical_redirect' },

    { name: 'buildStatus', type: 'string', validation: R => R.required(),
      options: { list: ['not_registered', 'planned', 'in_progress', 'built', 'blocked'] },
      description: 'Distinct axis from publishStatus — a page can be fully built and still awaiting ' +
        'Human Gate approval to publish.' },

    { name: 'priority', type: 'string', options: { list: ['P0', 'P1', 'P2', 'P3'] } },

    { name: 'contentVersion', type: 'number', initialValue: 1,
      description: 'Incremented whenever the composed page output changes in a way that should be ' +
        'considered a new version for revalidation/cache-key purposes — see rendering-revalidation.md §2. ' +
        'Not auto-derived from Sanity\'s own document _rev in this proposal — see migration-plan.md UQ-6.' },

    { name: 'publishStatus', type: 'string', validation: R => R.required(),
      options: { list: ['draft', 'in_review', 'approved', 'published', 'archived'] },
      description: 'The Human Gate lives here: a page moves from approved → published only via an ' +
        'explicit human action, never automatically from buildStatus alone.' },

    { name: 'lastReviewed', type: 'date' },

    { name: 'evidenceRefs', type: 'array', of: [{ type: 'reference', to: [{ type: 'evidence' }] }],
      description: 'Evidence that justifies THIS PAGE existing (distinct search intent, real buyer ' +
        'problem) — separate from the evidenceRefs on the underlying entity/content blocks, which back ' +
        'the technical claims on the page.' },
  ],
})
```

## 2. Lifecycle / status values

Two independent status axes, deliberately not collapsed into one:

| Axis | Values | Meaning |
|---|---|---|
| `buildStatus` | `not_registered → planned → in_progress → built` (or `blocked`) | Is the page's content assembled yet? Mirrors PR #21's `build_status` concept (`validated`/`validate_first`/`defer`), generalized: `planned` ≈ "validated, ready to build," `blocked` ≈ "validate_first/defer, don't invest yet." |
| `publishStatus` | `draft → in_review → approved → published` (or `archived`) | Is the page live and indexable? `published` is the only state where `indexPolicy: index` actually takes effect at the renderer — see `rendering-revalidation.md` §1. |

A page can be `buildStatus: built` and `publishStatus: draft` simultaneously (fully written, held pending Human Gate review) — this is the expected steady state for every page this pass produces evidence for, since **no page is published in this pass** (`publishStatus` starts and stays `draft` for anything mapped from PR #21; see `pr21-mapping.csv`).

## 3. Rules for creating, splitting, and merging pages

### 3.1 Creating a page — "entity relation ≠ public page"

A `pageRegistry` record may be created only when a human can point at:
1. A `primaryEntityRef` that already exists in the graph (or, for `resource`/`how_it_works`/`rfq` pages, a clear informational/funnel purpose), **and**
2. Either a `searchIntentCluster` with real evidence (a live query with a fragmented, non-giant-platform-dominated SERP — PR #21's own bar), or an explicit non-SEO reason (e.g. a required `/rfq/` intake page needs to exist regardless of search evidence).

The existence of a relation in the graph — e.g. `Part.processes` including `ProcessCapability: 5-axis-machining` — creates **zero** obligation or default to create a page for that pair. This is the literal mechanism that prevents `part × material × process × robot-type × country` pages: nothing in the renderer, the CMS, or any script walks the graph and emits routes. Routes come from `pageRegistry` documents only, and every `pageRegistry` document is created by a human action (a Sanity Studio edit, reviewed like any other content change), not generated. This directly satisfies acceptance test 6 ("Page Registry can keep an entity in the knowledge graph while preventing it from becoming an indexable page") — see `worked-examples.md` for OBJ03 (Harmonic Reducer Housing) as a concrete instance: it is a real `Part` in the graph, referenced from Robot Joint Housing and Actuator Housing, with **no** `pageRegistry` record of its own yet.

### 3.2 Splitting a page

Split `pageRegistry` record A into A + B when a `searchIntentCluster` shows two representative-query groups with genuinely different buyer intent that A's content cannot both serve well (PR #21's own example: OBJ13A battery-enclosure-mechanical vs. full battery-pack manufacturing — kept separate specifically because the buyer verticals differ, per `cannibalization-map.csv` row 10). Splitting never changes A's existing `canonicalPath` — B gets a new record and a new path; A's audience/links/history are undisturbed.

### 3.3 Merging a page

Merge B into A (B's `indexPolicy` becomes `canonical_redirect` pointing at A, B's `publishStatus` moves to `archived`) when evidence shows B's search intent is not independently distinct from A's — the exact situation `cannibalization-map.csv` documents for the LiDAR-mount-into-sensor-mount merge (row 1) and the two `prototype_to_production` queries merging into one page (row 5). B's `pageId` and history are retained (never deleted) so the decision is auditable later.

### 3.4 Deferral

A page may exist as a `pageRegistry` record with `buildStatus: blocked` and `publishStatus: draft` indefinitely — this is the correct state for PR #21's `defer` pages (APP02 cobot, APP05 inspection-robot) and its `validate_first` pages until further evidence resolves them. Deferral is not deletion; the record documents the decision and its rationale via `evidenceRefs`/notes on the linked `searchIntentCluster`.

## 4. `index_policy` / `noindex` rules

- `index`: only reachable when `publishStatus: published`. A page with `indexPolicy: index` but `publishStatus: draft` renders nothing publicly (it does not exist as a route at all — see `rendering-revalidation.md` §1) — `indexPolicy` describes *intent for when published*, not a bypass of the Human Gate.
- `noindex`: page may render (e.g. for internal review, or a legitimately thin/duplicate-risk page kept live for UX navigation but excluded from search) but carries a `noindex` meta directive. Used sparingly — most `blocked`/deferred pages simply have no route at all rather than a rendered-but-noindexed one.
- `canonical_redirect`: page never renders its own content; requests 301 to `redirectTarget.canonicalPath`. This is how merges (§3.3) and future slug changes (`url-namespace-policy.md` §5) stay non-destructive to inbound links.

## 5. Why this scales from ~100 to 1,000+ pages (acceptance test 10)

Nothing about the schema above changes shape between 100 and 10,000 records — it is one flat collection of documents, each independently reviewable, each independently gated. The thing that does not scale in the PR #21 shape (a hand-maintained CSV that is also the content) is exactly the thing this schema separates out: content lives in `ContentBlock`/entity documents (reused across many pages), while `PageRegistry` stays a thin index of "which URL, which entity, what state." Adding page #1,000 is adding one more `pageRegistry` document pointing at entities that likely already exist from page #200's authoring — it is not a proportional increase in authored prose. See `worked-examples.md` §4 (future-domain reuse) for the concrete mechanism.
