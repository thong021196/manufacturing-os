# Alibaba supply-side sub discovery — Pass 5A (Issue #18)

**Status: pivoted from Apify to WebSearch/WebFetch, real (non-fabricated) data collected,
zero-quality-bar violations, still at Human Gate awaiting review. See
`coverage-audit.md` for the full account, including exactly what this method could and
could not retrieve compared to the originally-planned Apify Actor scrape.**

## Purpose (per Issue #18, unchanged)

Correct Pass 5's ordering: before selecting a robotics-custom-manufacturing "sub"
(sub-market) using Google/SERP demand signal, use **Alibaba supply-side data** as the
primary source for finding sub candidates — real backend supply in China for
custom-manufacturing capability clusters (joint housings, actuator housings, gripper
jaws, sensor mounts, welded chassis, etc.), not SKU resale.

Required flow: `RFQ family → Alibaba supply reality → sub candidates → Google/SERP
demand → pilot sub → page pilot`. Issue #17 ("Pass 5 — Sub-market discovery + 30–100 page
search pilot") is currently written the other way around (Google/SERP-first) and even
explicitly excludes an Alibaba deep-dive from its own scope; Issue #18 is the correction.
This session did not modify Issue #17 or touch any of its artifacts.

## The pivot: why this pass used WebSearch/WebFetch instead of the Apify Actor API

The previous pass on this branch attempted the Apify Actor API (`api.apify.com`) and hit
a hard, non-bypassable organization-policy egress block (confirmed via the proxy's own
status endpoint — a genuine 403, not a config bug). It correctly stopped at Human Gate
with zero real records rather than fabricate data.

The repo owner then decided, in their own operating session, **not to wait for network
policy changes** and instead to substitute the data-collection tool: use WebSearch (and
test WebFetch) against `alibaba.com` directly, for the same 18 already-prepared queries.
This is a tooling substitution only — every quality rule, dedupe rule, and
no-fabrication rule from the original issue is unchanged and fully in force in this pass.

**WebFetch was tested early** against two `alibaba.com/product-detail/...` URLs returned
by WebSearch. Both calls failed immediately with `EGRESS_BLOCKED` for `www.alibaba.com`
(same organization-policy mechanism that blocked Apify, just applied to this domain too).
Per the task's own instruction ("if WebFetch is blocked/fails... don't keep retrying
it"), no further WebFetch attempts were made. **Every row in this pass's CSVs is derived
from WebSearch result titles/URLs and WebSearch's own synthesized summary text — never
from a fetched Alibaba page.** This is the single biggest capability gap versus what an
Apify Actor scrape would have returned (full page HTML: seller name/URL, verified-badge,
MOQ, price ladder, order/review counts, category breadcrumb — none of which WebSearch
snippets reliably expose for an individual `product-detail` page). Full detail in
`coverage-audit.md`.

## What is real in this folder now

- **All 18 prepared queries were run** via WebSearch (`site:alibaba.com <query text>`,
  plus the 5 plain Phase-1 wordings and 13 Phase-2 qualified wordings — 18 total
  WebSearch calls). Per-query outcome (including the queries that returned genuinely
  zero usable evidence) is recorded in `queries.csv`'s `Run status` column.
- **49 raw listing rows** in `alibaba-listings-raw.csv` (one row per query×listing
  occurrence actually observed), of which:
  - 22 are genuine, non-fabricated custom-manufacturing capability signals (CNC
    machining/turning/milling, sheet-metal fabrication — made-to-spec, not stock resale).
  - 23 are explicitly flagged as **resale/component/false-positive** (finished stock
    products, or — for the "welded chassis" query — welding-robot *equipment* for sale
    that matched on the word "robot", not a fabrication service) and are **excluded from
    sub-candidate evidence**, per the task's rule, while still being logged transparently.
  - 4 are named-supplier storefront/category pages (real company names: Ningbo Surely
    Metal Technology, Dongguan Jiada Automation Technology, Suzhou Crg Robotics
    Technology, plus one unnamed "laifual" storefront) — supplier-identity evidence only,
    no product-level data.
- **43 deduped listings** in `alibaba-listings-clean.csv` (49 raw rows → 43 distinct
  URLs; 6 duplicate collapses) — 19 genuine, 20 resale-flagged, 4 storefront.
- **6 supplier-dedupe rows** in `supplier-dedup.csv` — 4 named companies, 1 inferred
  (unconfirmed) same-seller cluster from near-sequential Alibaba product IDs, and 1
  explicit "supplier identity unknown" bucket covering **35 of the 43** deduped listings
  — the majority. This is the honest, load-bearing finding of this pass: WebSearch does
  not expose seller identity for individual Alibaba `product-detail` pages, so
  supplier-level dedupe could only be done for a small minority of listings.
- **5 sub candidates** in `sub-candidates.csv`, formed only where a real, repeated
  supply-side pattern existed (≥2 distinct genuine listings): 3 with meaningfully
  positive signal (precision CNC actuator/rotor housing, bearing housing/motor-mount
  shaft, joint housing) and 2 explicitly marked **watchlist/marginal** (bracket/mount
  adapter, battery/electronics enclosure) because their 2-listing evidence base includes
  a cross-industry (non-robotics) object. **No candidate was formed** for gripper
  jaw/finger, welded frame/chassis, sensor/camera mount, sheet-metal enclosure,
  jig/fixture/EOAT structure, prototype multi-part assembly, or pressure/sealed housing —
  each either had zero genuine listings or only one, below the evidence bar used
  consistently across this pass. See `sub-candidates.csv` and `coverage-audit.md` for the
  full honest accounting, including why each non-candidate family fell short.
- **12-row density rollup** in `supply-density.csv`, one row per RFQ-family/cluster
  covering all 12 families from Issue #13, with real observed counts (not estimates) and
  an explicit caveat that these densities reflect *what this WebSearch method could
  surface*, not true Alibaba market density (see "Method limitation" in
  `coverage-audit.md` — Alibaba's own SEO/marketing pages (`/showroom/...`,
  `/product-insights/...`, `/supplier/...`) heavily outnumber genuine product listings in
  `site:alibaba.com` search results and had to be filtered out by hand).

## Files

- `README.md` — this file.
- `queries.csv` — the same 18 queries as before, now with real per-query `Run status`
  results instead of "Not run".
- `alibaba-listings-raw.csv` — 23-column schema, 49 real rows (see above).
- `alibaba-listings-clean.csv` — same schema, 43 deduped rows.
- `supplier-dedup.csv` — supplier-level dedupe, 6 rows (see above — most listings have
  unknown supplier identity; this is documented, not hidden).
- `sub-candidates.csv` — 5 rows: 3 positive-signal candidates, 2 explicit watchlist/
  marginal candidates, with every field the issue requires (unique supplier count, MOQ/
  prototype-friendly signal, custom/OEM signal, process/material pattern, geographic
  clustering, technical fit, evidence links, gap/uncertainty).
- `supply-density.csv` — 12 rows, one per RFQ family, with real listing/supplier counts
  and an honest `none`/`insufficient`/`low` density rating for every family (no family in
  this pass reached `medium` or `high` — see coverage-audit.md for why).
- `coverage-audit.md` — full account of the pivot, what WebSearch/WebFetch could and
  could not retrieve vs. the original Apify plan, real record counts, and all 12 "Output
  cuối" points from Issue #18 restated with real numbers.

## Seed context used for `queries.csv` (unchanged from the prior pass)

Built from the three prior, already-produced research passes referenced by Issue #18:

- Issue #11 / PR #12 — `docs/research/robotics-custom-rfq-raw/` on branch
  `claude/issue-11-custom-manufacturing-rfq-research`.
- Issue #13 / PR #14 — `docs/research/robotics-rfq-anatomy/` on branch
  `claude/issue-13-robot-rfq-anatomy-research` (defines the 12 RFQ families).
- Issue #15 / PR #16 — `docs/research/robotics-rfq-family-expansion/` on branch
  `claude/issue-15-rfq-family-expansion-research`.

## Recommended next steps (for the human reviewer)

1. **Review `sub-candidates.csv` and `supply-density.csv` first** — they are the
   decision-relevant outputs. The 3 positive-signal candidates are thin (2–5 listings
   each, mostly unconfirmed supplier identity) and should be read as *directional*, not
   validated.
2. If more confidence is wanted before proceeding to Issue #17's Google/SERP phase for
   any of these 3 candidates, the next-best move is a **manual visit** to the specific
   `product-detail` URLs in `sub-candidates.csv`'s evidence-links column (by a human, in
   a normal browser) to confirm supplier identity, MOQ, and price — since neither Apify
   (blocked) nor WebFetch (blocked) can do this from this session.
3. Do **not** treat the `none`/`insufficient` rows in `supply-density.csv` (gripper jaw,
   welded chassis, sensor mount, sheet-metal enclosure, EOAT fixture, prototype assembly,
   pressure housing) as "Alibaba has no supply here" — they mean this WebSearch-only
   method could not surface genuine evidence in the volume searched, which is a real but
   narrower claim (see coverage-audit.md's method-limitation section for exactly why:
   Alibaba SEO-page flooding + no supplier-identity exposure + no full-page fetch).
4. Only after the human reviews and accepts (or requests more digging into) this
   evidence should Issue #17's Phase A (Google/SERP sub-market shortlist) proceed for
   whichever candidate(s) are approved, per the corrected flow this issue establishes.
