# Alibaba supply-side sub discovery — Pass 5A (Issue #18)

**Status: blocked before execution. No Apify Actor ever ran. $0 of the $5 credit budget
spent. See `coverage-audit.md` for the full account.**

## Purpose (per Issue #18)

Correct Pass 5's ordering: before selecting a robotics-custom-manufacturing "sub"
(sub-market) using Google/SERP demand signal, use **Alibaba supply-side data** as the
primary source for finding sub candidates — real backend supply in China for
custom-manufacturing capability clusters (joint housings, actuator housings, gripper
jaws, sensor mounts, welded chassis, etc.), not SKU resale.

Required flow: `RFQ family → Alibaba supply reality → sub candidates → Google/SERP
demand → pilot sub → page pilot`. Issue #17 ("Pass 5 — Sub-market discovery + 30–100 page
search pilot") is currently written the other way around (Google/SERP-first) and even
explicitly excludes an Alibaba deep-dive from its own scope; Issue #18 is the correction.
See `coverage-audit.md` → "Relationship to Issue #17" for detail. This session did not
modify Issue #17 or touch any of its artifacts — it has not been worked yet.

## Why this folder is mostly empty schema, not data

This session's outbound network access goes through a policy-enforcing egress proxy that
rejected every connection attempt to `api.apify.com` (HTTP CONNECT → 403, organization
policy). No Apify MCP tool exists as an alternative path. That is a hard infrastructure
block, not a judgment call this session could route around, per the proxy's own
documented instructions ("do not retry or route around it — report the blocked host").
Full technical detail, exact error text/timestamp, and the recommended remedy are in
`coverage-audit.md`.

Because the issue is explicit that sub candidates "phải hình thành từ pattern supply-side
lặp lại, không phải agent tự nghĩ ra" (must form from a repeated real supply-side
pattern, never be invented), this pass does not populate `sub-candidates.csv` or any
listings file with placeholder/synthetic data. An empty, correctly-shaped dataset is the
honest deliverable here — not a padded one.

## What is real in this folder

- **`queries.csv`** — 18 real queries: the 5 Phase-1 smoke-test queries and 13 Phase-2
  expansion queries (10 given directly in Issue #18, plus 3 generated the same way to
  give the 3 RFQ families the issue didn't give an explicit example for — Bracket/mount/
  adapter, Battery/electronics enclosure, Pressure/sealed housing — equal Phase-2
  coverage). Every query maps to exactly one of the 12 RFQ families from Issue #11/#13/
  #15 and to a normalization cluster (joint housing, actuator housing, bearing housing,
  motor mount, sensor mount, EOAT jaw/fixture, welded robot chassis, sheet-metal robot
  enclosure, sealed/pressure housing, bracket/mount adapter, battery/electronics
  enclosure, prototype assembly package) per the issue's dedupe/normalization rule. This
  is real planning work, independent of Apify access, ready to run as soon as the
  infrastructure block clears.
- **The 23-column listings schema, the supplier-dedup schema, the sub-candidate report
  schema, and the supply-density schema** — all defined exactly per Issue #18's spec, as
  CSV headers with zero rows, ready to receive real rows from the first successful run.

## Files

- `README.md` — this file.
- `queries.csv` — Phase 1 + Phase 2 query set, each row mapped to an RFQ family and
  normalization cluster (18 rows, no data collected yet).
- `alibaba-listings-raw.csv` — 23-column raw-listing schema (Issue #18 §"Schema listings
  tối thiểu"), header only, 0 rows.
- `alibaba-listings-clean.csv` — same schema, intended post-dedupe, header only, 0 rows.
- `supplier-dedup.csv` — supplier-level dedup schema, header only, 0 rows.
- `sub-candidates.csv` — sub-candidate report schema (RFQ family origin, representative
  queries, unique supplier count, listing count after dedupe, verified supplier share,
  MOQ/prototype-friendly signal, custom/OEM signal, process/material pattern, geographic
  clustering, technical fit, evidence links, gap/uncertainty), header only, 0 rows.
- `supply-density.csv` — per-sub-candidate density rollup schema, header only, 0 rows.
- `coverage-audit.md` — full account of what was attempted, the exact blocker, cost/
  credit accounting ($0 spent), token-handling confirmation, and the recommendation to
  the human owner for unblocking this.

## Seed context used for `queries.csv`

Built from the three prior, already-produced research passes referenced by Issue #18
(read directly from their branches in this repo, since none is merged to `main` yet):

- Issue #11 / PR #12 — `docs/research/robotics-custom-rfq-raw/` on branch
  `claude/issue-11-custom-manufacturing-rfq-research`.
- Issue #13 / PR #14 — `docs/research/robotics-rfq-anatomy/` on branch
  `claude/issue-13-robot-rfq-anatomy-research` (defines the 12 RFQ families in
  `rfq-families.csv`).
- Issue #15 / PR #16 — `docs/research/robotics-rfq-family-expansion/` on branch
  `claude/issue-15-rfq-family-expansion-research` (per-family technical evidence used to
  sanity-check that each generated query maps to a real, sourced manufacturing
  object/capability, not an invented one).

## Next steps once unblocked

1. Get `api.apify.com` allowed for this session's egress policy, or run this specific
   task from an environment with direct API access, using the same token and the plan
   below.
2. Actor: `xtracto/alibaba-search-scraper` (Issue #18's stated preference) — inspect its
   input schema via `GET /v2/acts/xtracto~alibaba-search-scraper` before any run.
3. Phase 1 smoke test: run `Q01`–`Q05` from `queries.csv`, 1 page/query, target ~100–250
   listings total, low concurrency, default proxy. Audit per Issue #18's checklist
   (missing-field rate, duplicate rate, run cost) before scaling.
4. If output quality and cost/listing are acceptable, run Phase 2 (`Q06`–`Q18`) within
   remaining credit, dedupe at listing and supplier level, and only then populate
   `alibaba-listings-raw.csv` → `alibaba-listings-clean.csv` → `supplier-dedup.csv` →
   `sub-candidates.csv` → `supply-density.csv` with real rows.
5. Only after real sub candidates exist here should Issue #17's Phase A (Google/SERP
   sub-market shortlist) proceed, per the corrected flow this issue establishes.
