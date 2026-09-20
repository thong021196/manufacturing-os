# Search Intent Integration

Documents the SearchQuery → SearchIntentCluster → PageRegistry → PrimaryEntity mapping and the future Search Console feedback loop, per the issue's requirement to prepare (not automate) this.

## 1. The mapping chain

```
SearchQuery (many, Postgres)          ← raw GSC rows: query, impressions, clicks,
     │  groups into                     average position, country, device, date
     ▼
SearchIntentCluster (Sanity)          ← deduped intent; representativeQueries[];
     │  primaryEntityRef                 commercialStrength; serpFragmentation
     │  resolvedPageId
     ▼
PageRegistry.searchIntentCluster      ← one page serves one cluster (invariant #14)
     │  primaryEntityRef
     ▼
Part / Assembly / Application / ProcessCapability / EngineeringProblem
```

This is the same chain PR #21 already runs informally (`query-candidates.csv` → `intent-clusters.csv` → `pilot-pages.csv`'s `RFQ_object` column), formalized into the graph so it survives past the pilot's 34 pages.

## 2. Where each link lives, and why the boundary falls where it does

- **`SearchQuery` (Postgres, private, operational — matches `lib/types.ts`'s existing `SearchQuery`/`SearchSurface`/`SearchPerformanceRecord` shape).** Raw, high-volume, frequently-updated performance data (`impressions`, `clicks`, `qualifiedVisitors`, `cadUploads` — already exactly `SearchPerformanceRecord`'s shape in `lib/types.ts`). This is operational telemetry, not editorial content, and changes automatically via ingestion, not human review — it belongs in Postgres per AGENTS.md rule #3, not in Sanity, which is reserved for reviewed public knowledge.
- **`SearchIntentCluster` (Sanity, public-adjacent structural taxonomy).** A human-reviewed *interpretation* of a group of queries (PR #21's own qualitative judgment calls: `commercial_strength`, `serp_fragmentation` — explicitly documented there as "qualitative judgments from observed result types only," never raw volume). This is editorial, low-frequency-change, and needs to be referenceable from `PageRegistry` — so it lives in Sanity alongside the other publishing/evidence entities, distinct from the raw `SearchQuery` rows behind it.

The two are linked by a plain id reference, not merged into one document type, exactly mirroring the general Sanity/Postgres boundary in `operational-boundary.md`: raw/private/high-frequency data in Postgres, reviewed/public/low-frequency interpretation in Sanity.

## 3. What this pass prepares vs. automates

**Prepared (schema/boundary only):**
- `SearchIntentCluster.primaryEntityRef` and `.resolvedPageId` fields exist and are populated manually per cluster (as PR #21 already does by hand in its CSVs).
- `PageRegistry.searchIntentCluster` exists as the reverse link.
- The provenance/confidence vocabulary on `SearchIntentCluster` (`commercialStrength`, `serpFragmentation`) matches PR #21's existing qualitative fields so its research transfers without reinterpretation (see `pr21-mapping.csv`).

**Explicitly not automated in this pass (per the issue: "Do not automate this now"):**
- No ingestion job pulling live GSC data into `SearchQuery`/`SearchPerformanceRecord` rows.
- No automatic promotion/demotion of a page's `buildStatus`/`priority` based on incoming performance data.
- No automatic cluster creation, splitting, or merging from query data — every `intent-clusters.csv`-equivalent decision remains a human editorial act, same as PR #21's own methodology note ("no keyword-tool or Search-Console volume data was used or is claimed anywhere in this pass").

## 4. Future decisions this schema must support without changing the base ontology

The issue requires the schema to support these decisions later without an ontology rewrite. Each is answerable purely by adding rows/documents under the existing shape, not new fields or entity types:

- **Keep**: a `SearchIntentCluster`'s `resolvedPageId` stays as-is; new `SearchQuery`/`SearchPerformanceRecord` rows accumulate underneath it over time.
- **Improve**: the linked `PageRegistry.contentVersion` increments (`rendering-revalidation.md` §4) as the page's `ContentBlock`s are edited in response to underperformance; the `SearchIntentCluster` itself is untouched.
- **Merge**: two `SearchIntentCluster` documents' `resolvedPageId`s converge — one cluster's `resolvedPageId` is repointed at the other's page, and that page's own `PageRegistry` record follows the merge rule in `page-registry.md` §3.3 (the losing page's `indexPolicy` becomes `canonical_redirect`). The underlying `SearchQuery` rows are simply now grouped under the surviving cluster; no schema change.
- **Split**: a new `SearchIntentCluster` document is created (a subset of the original cluster's `representativeQueries`), given its own `primaryEntityRef` (possibly a newly-authored entity) and, per `page-registry.md` §3.2, its own new `PageRegistry` record. The original cluster keeps the remaining queries.
- **Create new page**: a `SearchIntentCluster` with no `resolvedPageId` yet is exactly PR #21's own "evidence exists, no page approved yet" state (its `defer`/`validate_first` rows) — already representable without any new field, per `page-registry.md` §3.1's creation rule.

## 5. Country/device dimensions do not create pages (acceptance test 8, search-side)

`SearchQuery.country`/`.device` (private, Postgres — matching `lib/types.ts`'s `Geography` linkage pattern) are attributes of a *query row*, never inputs to canonical path construction (`url-namespace-policy.md` §4). A future AU-specific volume signal on an existing `SearchIntentCluster` would, at most, inform a human's decision to *prioritize* an already-existing page higher, or — if genuinely distinct AU buyer intent is found (unlike the "UNKNOWN, out of scope" AU finding in PR #21's own `market-summary.md`) — justify authoring a **new, distinct, explicitly-reviewed** `SearchIntentCluster` and `PageRegistry` record through the same human-gated process as any other page, never an automatic `/au/` path segment or a country-keyed variant of an existing page.
