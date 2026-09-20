# Coverage audit — Alibaba supply-side sub discovery (Issue #18, WebSearch/WebFetch pivot)

## Status: real (non-fabricated) data collected via WebSearch; WebFetch confirmed blocked for alibaba.com after one test; still at Human Gate

This pass substitutes the tool only. Every quality rule from Issue #18 remains in force:
no fabricated listings/suppliers/prices, sub candidates must come from real repeated
supply-side patterns, dedupe at both listing and supplier level, keep contradictory
evidence, exclude/flag generic resale items, no SKU-shopping research.

## What happened, in order

1. Checked out the existing branch `claude/issue-18-alibaba-sub-discovery-apify` and read
   the prior pass's `README.md`, `coverage-audit.md`, `queries.csv`, and the five
   header-only CSVs (all confirmed to match the 23-column schema from the issue, with
   zero rows — nothing to build on except the 18 planned queries).
2. Confirmed with the human owner's instructions that no Apify token exists or is needed
   for this pivot; did not look for one.
3. Tested WebFetch against two real `alibaba.com/product-detail/...` URLs returned by an
   early WebSearch call, to see whether full page content (price, MOQ, supplier profile)
   was retrievable:
   - `https://www.alibaba.com/product-detail/Custom-Steel-Bearing-Housing-Machining-With_1601492318329.html`
   - `https://www.alibaba.com/product-detail/Supplier-s-High-Quality-Zinc-Aluminium_1601611521485.html`
   Both calls failed immediately with `{"error_type":"EGRESS_BLOCKED","domain":"www.alibaba.com", ...}`
   — the same organization-policy egress mechanism that blocked Apify in the prior pass,
   applied here to `alibaba.com` directly. Per the task's instruction not to keep
   retrying a blocked domain, **no further WebFetch calls were made** for the rest of
   this pass. This means every field in every CSV in this pass comes from WebSearch's
   result titles/URLs and WebSearch's own synthesized summary text — never from an
   actually-fetched Alibaba page.
4. Ran all **18** prepared queries via WebSearch, each as `site:alibaba.com <query
   text>` (5 Phase-1 plain wordings + 13 Phase-2 qualified wordings). Full per-query
   outcome is recorded in `queries.csv`'s `Run status` column.
5. For every result returned, manually classified each URL into one of three buckets
   before it went into `alibaba-listings-raw.csv`:
   - **Genuine custom-manufacturing capability signal** — a specific
     `alibaba.com/product-detail/...` (or `m.alibaba.com/product/...`) listing whose
     title clearly describes a made-to-spec / custom / OEM / CNC-machined-to-order item
     (housing, bracket, enclosure, bearing shaft, etc.), not a finished catalog product.
   - **Resale / component / false-positive** — a finished stock product (e.g. a
     pre-made pneumatic gripper, a servo joint module, a battery pack, a sensor module,
     or — for the welded-chassis query — a welding *robot machine* for sale, which
     matched on the word "robot" but is capital equipment, not a fabrication service).
     These are **logged but excluded from sub-candidate evidence**, per the issue's rule
     that generic resale items must not be counted as capability-cluster evidence.
   - **Alibaba's own SEO/content pages** — `/showroom/...`, `/product-insights/...`,
     `/supplier/...` aggregator and buying-guide pages that `site:alibaba.com` search
     returns in large numbers. These are **not listings at all** (no specific
     product/supplier behind them) and were excluded entirely from every CSV — they are
     noise from Alibaba's own SEO, not supply-side evidence. This is itself an important
     finding (see "Method limitation" below): Alibaba SEO content dominates
     `site:alibaba.com` search results, and genuine product listings are often a
     minority of what comes back.
   - **Supplier storefront/category pages** (`*.en.alibaba.com/productgrouplist-...`) —
     kept separately: these expose a real company name (or at least a stable seller
     subdomain) but no single product's data, so they went into `supplier-dedup.csv`
     as supplier-identity evidence, not into the listing-level candidate counts.
6. Built `alibaba-listings-raw.csv` (49 rows), `alibaba-listings-clean.csv` (43 deduped
   rows), `supplier-dedup.csv` (6 rows), `sub-candidates.csv` (5 rows), and
   `supply-density.csv` (12 rows, one per RFQ family) from that classification. No row in
   any file was invented; every unfilled field is `unknown`, not a guess.
7. Checked the diff for the string `apify` / `APIFY_API_TOKEN` before every commit —
   none present; this pass never touched Apify.

## Method limitation — what WebSearch/WebFetch could and could not retrieve, vs. the planned Apify Actor scrape

| Field | Apify Actor scrape (planned) | This pass (WebSearch only, WebFetch blocked) |
|---|---|---|
| Product title / URL | Full, exact, from every listing on the results page(s) | Retrievable — WebSearch reliably returns title + exact URL for `product-detail` pages |
| Supplier name / URL / verified badge | Present on every listing (seller panel is part of the page) | **Not retrievable for individual product-detail pages.** Of 43 deduped listings, supplier identity is `unknown` for **35** (see `supplier-dedup.csv`, `SUP-UNKNOWN`). Only known where a *storefront* page happened to surface separately (4 named companies) or where an aggregated WebSearch summary paragraph happened to name a location (2 cases: Jiangsu and Guangdong, both **unverified** — see Confidence column, `low-aggregated_summary`) |
| MOQ | Present on every listing | Retrievable for **1 of 43** listings (the Raspberry Pi sheet-metal enclosure, MOQ 10 pcs) and even that came from WebSearch's synthesized summary text, not the raw title, so it is flagged lower-confidence |
| Price / price ladder | Present on every listing | Retrievable for **2 of 43** listings (the same enclosure at ~US$7.30, and a welding-robot-equipment listing at US$30,000 — the latter itself excluded as a false-positive/resale item). 0 came from an actually-fetched price table |
| Sold/reviews count | Present when Alibaba shows it | **0 of 43** — never exposed by a WebSearch snippet |
| Category/breadcrumb | Present on every listing | **0 of 43** — never exposed by a WebSearch snippet |
| Material/process hints | Present in spec table + title | Retrievable from the **title text alone** for most genuine listings (aluminum, steel, brass, CNC machining/turning/milling) — this is the one field WebSearch covers almost as well as a full scrape would, because sellers put material/process in the product title |
| Duplicate rate / missing-field rate | Computed directly from full dataset | Computed on this smaller, snippet-only dataset (see below); almost certainly understates true duplicate rate, since near-identical listings from the same seller are only visible as duplicates when their titles happen to differ enough to both surface in results, and their shared seller identity (the real dedupe signal) is exactly the field WebSearch does not expose |
| Run cost | Metered per Apify Actor run | **$0** — WebSearch/WebFetch do not draw on the Apify credit at all; no cost tracking applies to this pass |

**Bottom line:** WebSearch is usable for *discovery* (finding that a listing/query
pattern exists at all, and reading its title) but not for *verification* (confirming
supplier identity, price, MOQ, trust signals) for individual Alibaba product pages,
because WebFetch — the only tool that could have pulled that detail — is blocked for
`alibaba.com` by this session's organization egress policy, confirmed by direct test
(see step 3 above). Every confidence value in the CSVs reflects this: `medium-title_only`
where the fact came straight from the listing's own title (the most reliable tier
available in this pass), `low-aggregated_summary` where it came from WebSearch's
synthesized paragraph instead of the row's own title (less reliable — the paragraph
blends multiple results and attribution to one specific URL cannot be independently
checked without a page fetch).

## Real record counts achieved

- **Queries run: 18 of 18** (100% — all 5 Phase-1 + all 13 Phase-2 queries executed via
  WebSearch). **1 of 18 (Q09, "robot motor mount cnc machining") returned zero usable
  results at all** — every hit was an Alibaba SEO/aggregator page.
- **Raw listing rows: 49** — 22 genuine custom-manufacturing capability signals, 23
  resale/component/false-positive (flagged, excluded from candidate evidence), 4 named
  supplier storefront pages.
- **Deduped listings: 43** — 19 genuine, 20 resale-flagged, 4 storefront (49 → 43 after
  collapsing 6 raw rows that were the same URL surfacing under more than one query).
- **Suppliers with a confirmed real name: 4** (Ningbo Surely Metal Technology Co., Ltd.;
  "laifual" — subdomain only, legal name unconfirmed; Dongguan Jiada Automation
  Technology Co., Ltd.; Suzhou Crg Robotics Technology Co., Ltd.). **1 additional
  inferred-but-unconfirmed same-seller cluster** (4 actuator-housing listings sharing
  near-sequential Alibaba product IDs). **Supplier identity unknown for 35 of the 43**
  deduped listings — the majority. This is the pass's central, honestly-reported
  limitation, not a gap that was papered over.
- **Sub candidates formed: 5** — see next section.

## Sub candidates actually formed (and why the rest were not)

Formed (real, repeated, ≥2-listing genuine evidence — see `sub-candidates.csv` for full
detail on each):

1. **SC-01 — Precision CNC-machined actuator/rotor housing** (Precision CNC housing
   family). 5 genuine listings, all aluminum, all CNC machined/milled/turned. Strongest
   pattern found in this pass by listing count, but supplier count is an unconfirmed
   inference (~2, from product-ID clustering), and price/MOQ/verified-badge data is
   entirely absent.
2. **SC-02 — Custom-machined bearing housing / motor-mount shaft** (Shaft/bearing seat/
   motor mount family). 3 genuine listings (steel/carbon steel, CNC machined/turned).
3. **SC-03 — CNC-machined joint housing (OEM/ODM)** (Joint/structural link family). 2
   genuine listings — weakest of the three positive candidates, because one of the two
   is a generic "robot housing model" listing that also surfaced under two *other*
   families' queries (Q10, Q18), undermining its claim to be joint-specific.
4. **SC-04 — CNC-machined bracket/mount adapter** (Bracket/mount/adapter family) —
   reported explicitly as **watchlist/marginal**: 2 listings, one of which is an
   automotive brake-caliper bracket (cross-industry, not robotics).
5. **SC-05 — CNC-machined battery/electronics enclosure** (Battery/electronics enclosure
   family) — also **watchlist/marginal**: 2 listings, one generic ("custom robotics
   parts"), one an EV battery enclosure (cross-industry, not robot/AGV-specific).

**Not formed** (reported honestly as gaps, not padded to look complete):

- **Gripper jaw/finger** — 0 genuine listings. All 5 hits across both its queries
  (Q03, Q08) were finished stock gripper products for resale.
- **Welded frame/chassis** — 0 genuine listings. Both hits under Q12 were welding-robot
  *equipment* for sale (false positives on the word "robot"), not fabrication-service
  listings. Flagged as a query-wording problem for any future pass (search for "AGV
  chassis welding fabrication custom" without the bare word "robot").
- **Sensor/camera mount** — only 1 genuine listing (and it is cross-industry,
  fluid-control, not robotics) — below the 2-listing bar used consistently in this pass.
- **Sheet-metal enclosure** — only 1 genuine listing (a Raspberry Pi case, not a robot
  enclosure) — below the bar.
- **Jig/fixture/EOAT structure** — only 1 borderline genuine listing (reads partly as a
  finished product) — below the bar. Two named component suppliers were found (Dongguan
  Jiada, Suzhou Crg) but neither ties to a jaw/fixture-machining listing specifically.
- **Prototype multi-part assembly** — only 1 genuine listing — below the bar.
- **Pressure/sealed housing** — only 1 genuine listing dedicated to this family — below
  the bar (the generic "robot housing model" listing is loosely cross-relevant but was
  primarily attributed to Joint/structural link).

## All 12 "Output cuối" points from Issue #18, restated with real numbers

1. **Actor nào đã dùng (which Actor was used):** None. Per the owner's pivot decision,
   this pass used Claude's WebSearch tool (`site:alibaba.com <query>`) instead of any
   Apify Actor. WebFetch was tested and confirmed blocked for `alibaba.com` (see above)
   and was not used beyond that one test.
2. **Input schema/config thực tế (actual input schema/config):** N/A for Apify (no Actor
   was run). The actual method: 18 WebSearch calls, one per query in `queries.csv`, each
   formatted `site:alibaba.com <query text>`; 2 WebFetch calls (both failed with
   `EGRESS_BLOCKED`) as the one-time compatibility test.
3. **Token đã đọc từ secret/env và không bị ghi ra ngoài (token read from secret/env and
   not leaked):** No Apify token was read, needed, or referenced anywhere in this pass —
   confirmed by design (the task explicitly said not to look for one) and by a
   pre-commit `grep` of the diff for `apify`/`APIFY_API_TOKEN`, which found nothing.
4. **Tổng cost (total cost):** **$0.00.** WebSearch and WebFetch do not draw on the
   Apify $5 free-tier credit; that credit remains fully unused (as it was after the
   prior pass).
5. **Tổng raw listings (total raw listings):** **49** rows in
   `alibaba-listings-raw.csv` (22 genuine, 23 resale-flagged, 4 supplier-storefront).
6. **Listings sau dedupe (listings after dedupe):** **43** rows in
   `alibaba-listings-clean.csv` (19 genuine, 20 resale-flagged, 4 storefront).
7. **Unique suppliers:** **4 confirmed named suppliers** + **1 inferred-but-unconfirmed**
   same-seller cluster. Supplier identity is **unknown for 35 of 43** deduped listings —
   see `supplier-dedup.csv`'s `SUP-UNKNOWN` row and the "Method limitation" section above
   for exactly why (WebSearch does not expose seller identity on individual Alibaba
   `product-detail` pages; the page itself, which does, could not be fetched).
8. **Số query (number of queries):** **18 of 18** run (100%). 1 (Q09) returned zero
   usable results.
9. **Số sub candidates hình thành (number of sub candidates formed):** **5** — 3 with
   meaningfully positive (if thin) evidence, 2 explicitly marked watchlist/marginal. 7 of
   the 12 RFQ families produced **no** candidate (insufficient or zero genuine evidence);
   see `supply-density.csv` for the full per-family accounting.
10. **Sub nào có supply density rõ nhất (which sub has the clearest supply density):**
    **SC-01 (precision CNC-machined actuator/rotor housing)** — 5 genuine listings, the
    most of any cluster in this pass, all following a consistent aluminum/CNC-machining
    pattern. Caveat: this is the clearest signal *relative to the other clusters found in
    this pass*, not a confirmed high-density claim in absolute terms — see
    `supply-density.csv`, rated `low` (not `medium`/`high`) for every family in this
    pass, because even the best cluster's absolute listing/supplier counts remain small
    and largely unconfirmed.
11. **Field nào Alibaba/Actor không cung cấp (which fields Alibaba/the method could not
    provide):** Supplier name/URL/verified badge (35/43 unknown), MOQ (42/43 unknown),
    price (41/43 unknown), sold/reviews count (43/43 unknown), category/breadcrumb
    (43/43 unknown). See the comparison table above for the full field-by-field
    breakdown against what an Apify scrape would have given.
12. **Có cần mua thêm Apify credit / đổi Actor hay không (whether more Apify credit or a
    different Actor is needed):** This question no longer applies as originally framed,
    since the owner's pivot removed Apify from this pass entirely. What this pass *does*
    recommend instead: if the human reviewer wants supplier identity, MOQ, price, or
    verified-badge confirmation for any of the 5 sub-candidates (especially SC-01), the
    only paths available to this session are (a) get `alibaba.com` allowlisted for
    WebFetch in this session's egress policy, (b) get `api.apify.com` allowlisted so the
    originally-planned Actor scrape can run, or (c) a human manually opens the specific
    evidence-link URLs in `sub-candidates.csv` in a normal browser. This pass cannot
    determine which of (a)/(b) is cheaper or more reliable without being able to test
    either — that judgment call is for the human owner.

## Relationship to Issue #17 (unchanged from the prior pass)

Issue #17 still assumes a Google/SERP-first flow and explicitly excludes an Alibaba
deep-dive from its own scope. Issue #18 is the correction. This pass produced real (if
thin) Alibaba-derived sub candidates, so **Issue #17's Phase A could now proceed for the
3 positive-signal candidates (SC-01/02/03) if the human reviewer accepts this evidence as
sufficient** — but given how thin the evidence is (2–5 listings each, supplier identity
mostly unconfirmed), the reviewer may reasonably decide more verification is needed
first. This pass does not make that call; it is left at Human Gate. This session did not
modify Issue #17 or any of its artifacts.

## Token handling — explicit confirmation (updated for this pass)

No Apify API token was read, stored, referenced, or needed anywhere in this pass. No
other credential was used either — WebSearch and WebFetch are standard tool calls that
do not require a secret from this repository. The pre-commit diff check for
`apify`/`APIFY_API_TOKEN` found no matches in this pass's changes.
