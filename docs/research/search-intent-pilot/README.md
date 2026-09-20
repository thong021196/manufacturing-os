# Search-intent map + 35–50 page pilot architecture — Pass 6 (Issue #20)

This folder does **not** re-derive the manufacturing/RFQ taxonomy — that already exists in
`docs/research/robotics-rfq-anatomy/` (Issue #13) and `docs/research/robotics-rfq-family-expansion/`
(Issue #15), neither of which is modified here. This pass answers a different question:
**how do real US/AU buyers actually search, and which distinct search intents deserve their
own SEO landing page?**

Two taxonomies are kept explicitly separate, per the issue:

- **Manufacturing/RFQ taxonomy** (unchanged, lives elsewhere in this repo) — everything we
  can potentially quote and route to suppliers. Nothing is deleted from it based on weak
  search evidence.
- **Search-acquisition taxonomy** (this folder) — only the intents judged to deserve a
  dedicated SEO page, based on live search evidence gathered in this pass.

## Method (honest accounting)

50 real WebSearch queries were run across 20 seed objects, 8 application areas, and 6
problem/process areas (plus 3 cross-cutting checks: AU signal, China-supply signal, broad
giant-platform-dominance check). This is well below the issue's suggested ~10–30 queries
*per sub* (which would be 340–1,020 total) — a deliberate breadth-over-depth trade-off
given this session's tool budget, disclosed here and in `market-summary.md` rather than
padded with fabricated rows. Every SERP-composition claim in every CSV traces to one of
these 50 searches via its `query_id`. No search-volume, keyword-tool, or Search Console
data was used or is claimed anywhere in this pass — all strength/fragmentation judgments
are qualitative, based only on observed result types and domains.

## Files

- `query-candidates.csv` (50 rows) — every query actually searched, its market, dimension,
  intent class, and observed SERP composition.
- `intent-clusters.csv` (38 rows) — candidate queries deduped into distinct search intents,
  including several explicitly **excluded** intents (`INT-EXC-*`) documenting query
  framings that returned the wrong buyer (e.g. bare "robot bracket" → hobby/FRC retail).
- `pilot-pages.csv` (34 rows) — the proposed pilot pages: 1 category hub, 19 object pages,
  9 application pages, 5 problem/process pages.
- `cannibalization-map.csv` (20 rows) — merge/parent-child/defer decisions with the SERP
  evidence behind each one.
- `market-summary.md` — narrative synthesis: strongest object-first wedges, giant-platform
  dominated queries, the recurring bare-query contamination pattern, US/AU differences,
  what should not become a page, and open uncertainties.
- `pilot-architecture.md` — the proposed site map (parent/child hierarchy) with rationale
  for every page.

## Human Gate

Nothing in this folder is published, deployed, or wired into the live site. This is a
research/planning deliverable for human review per `AGENTS.md`'s required workflow
(`ISSUE → PLAN → BUILD → PR → TEST → AUDIT → FIX → VERIFY → HUMAN GATE → MERGE`).
