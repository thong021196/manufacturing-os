# Search-intent map + 35–50 page pilot architecture — Pass 6 (Issue #20) + Human Gate fix pass (PR #21)

This folder does **not** re-derive the manufacturing/RFQ taxonomy — that already exists in
`docs/research/robotics-rfq-anatomy/` (Issue #13) and `docs/research/robotics-rfq-family-expansion/`
(Issue #15), neither of which is modified here (both live on their own unmerged branches:
`claude/issue-13-robot-rfq-anatomy-research` and `claude/issue-15-rfq-family-expansion-research`).
This pass answers a different question: **how do real US buyers actually search, and which
distinct search intents deserve their own SEO landing page?** (AU is explicitly out of scope
for page-architecture prioritization — see `market-summary.md`'s AU section.)

**This folder was updated by a focused fix pass in response to a Human Gate audit review on
PR #21** (comment id 5748538152). The fix pass deepened query evidence for the 13 P0/P1
object pages specifically (not a blanket re-research), added a `build_status` field to
`pilot-pages.csv`, neutralized several unsourced numeric tolerance claims, reworded
competitor-existence-vs-buyer-demand language throughout, and made an explicit AU scope
decision. See `market-summary.md`'s "Final summary (Human Gate fix pass, PR #21)" section
for the complete accounting.

Two taxonomies are kept explicitly separate, per the issue:

- **Manufacturing/RFQ taxonomy** (unchanged, lives elsewhere in this repo) — everything we
  can potentially quote and route to suppliers. Nothing is deleted from it based on weak
  search evidence.
- **Search-acquisition taxonomy** (this folder) — only the intents judged to deserve a
  dedicated SEO page, based on live search evidence gathered in this pass.

## Method (honest accounting)

**Original pass**: 50 real WebSearch queries were run across 20 seed objects, 8 application
areas, and 6 problem/process areas (plus 3 cross-cutting checks: AU signal, China-supply
signal, broad giant-platform-dominance check). This is well below the issue's suggested
~10–30 queries *per sub* (which would be 340–1,020 total) — a deliberate breadth-over-depth
trade-off given this session's tool budget, disclosed here and in `market-summary.md` rather
than padded with fabricated rows.

**Human Gate fix pass (PR #21)**: in response to the owner's audit review, 65 additional
queries (Q051–Q115) were run to *deepen* — not broaden — evidence: ~5 distinct query
framings (object, custom machining/fabrication, supplier, RFQ/quote, application, lifecycle)
for each of the 13 P0/P1 physical-object pages specifically. P2/P3/experimental pages and
cross-cutting application/problem-process pages were deliberately left at their original
query count, per the owner's explicit "do NOT expand everything to 10–30/sub" instruction.

**115 real WebSearch queries in total.** Every SERP-composition claim in every CSV traces to
one of these 115 searches via its `query_id`. No search-volume, keyword-tool, or Search
Console data was used or is claimed anywhere in this pass — all strength/fragmentation
judgments are qualitative, based only on observed result types and domains. See
`market-summary.md`'s "Final summary (Human Gate fix pass, PR #21)" section for the query
count, multi-query-confirmation tally, build-status counts, and AU-scope decision in one
place.

## Files

- `query-candidates.csv` (115 rows: 50 original + 65 from the Human Gate fix pass, Q051–Q115)
  — every query actually searched, its market, dimension, intent class, and observed SERP
  composition.
- `intent-clusters.csv` (38 rows, plus a `query_variation_check` column added in the fix pass)
  — candidate queries deduped into distinct search intents, including several explicitly
  **excluded** intents (`INT-EXC-*`) documenting query framings that returned the wrong
  buyer (e.g. bare "robot bracket" → hobby/FRC retail), and now recording whether each P0/P1
  intent's page-level intent survived query variation.
- `pilot-pages.csv` (34 rows, plus a `build_status` column added in the fix pass) — the
  proposed pilot pages: 1 category hub, 19 object pages, 9 application pages, 5
  problem/process pages. `build_status` splits the 34 candidate pages into **19 validated**,
  **13 validate_first**, and **2 defer** — see `pilot-architecture.md`'s "Build-status
  breakdown" section.
- `cannibalization-map.csv` (23 rows: 20 original + 3 from the fix pass) — merge/parent-child/
  defer decisions with the SERP evidence behind each one, including 3 pairs newly surfaced or
  refined by the deepened P0/P1 pass.
- `market-summary.md` — narrative synthesis: strongest object-first wedges, giant-platform
  dominated queries, the recurring bare-query contamination pattern, the deepened P0/P1
  query-variation results, the explicit US-only/AU-UNKNOWN scope decision, what should not
  become a page, and a "Final summary" section with every number the Human Gate review asked
  for.
- `pilot-architecture.md` — the proposed site map (parent/child hierarchy) with rationale
  for every page, plus the build-status breakdown.

## Human Gate

Nothing in this folder is published, deployed, or wired into the live site. This is a
research/planning deliverable for human review per `AGENTS.md`'s required workflow
(`ISSUE → PLAN → BUILD → PR → TEST → AUDIT → FIX → VERIFY → HUMAN GATE → MERGE`).
