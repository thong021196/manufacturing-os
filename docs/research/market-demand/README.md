# Market Demand Research — Initial Manufacturing Wedge

**Issue:** #4 — Research real market demand for initial manufacturing wedge
**Scope:** United States + Australia, robotics/automation custom mechanical parts
**Status:** Research deliverable, awaiting human review (Human Gate — see bottom of this file)
**Captured:** 2026-09-19 unless a cited source carries its own publication date (noted inline)

This directory replaces mock market assumptions with sourced evidence for the parts of the
initial wedge named in `docs/product/PRODUCT.md`: actuator housings, gripper jaws/components,
sensor/camera mounts, motor mounts, EOAT/end-effector plates, adapter/base plates, joint
housings, brackets/enclosures, jigs/fixtures/inspection fixtures, and general custom
CNC/sheet-metal parts.

It does **not** build any public-facing page, does not touch `app/`, `lib/`, `components/`, or
any frontend/package file, and does not fabricate market-size or search-volume numbers.

## Methodology

### Tools used
- `WebSearch` — the only tool used to find sources. Anthropic's web search tool retrieves and
  summarizes live pages server-side; the summaries it returns are treated here as the source of
  each claim, with the original URL preserved for the human reviewer to re-verify.
- `WebFetch` — attempted on several primary sources (Xometry, Hubs/Protolabs Network, IFR,
  The Robot Report, RivCut) to pull full page text directly. **All of these attempts were
  blocked by this session's network egress proxy** (`EGRESS_BLOCKED` on `xometry.com`,
  `hubs.com`, `ifr.org`, `therobotreport.com`, `rivcut.com`). This is a disclosed limitation,
  not a silent gap: every claim below that names one of these domains was captured through
  `WebSearch`'s own retrieval/summarization, not a raw fetch Claude performed and read directly.
  The human reviewer should treat these as slightly lower-trust than a directly fetched primary
  source and spot-check the higher-stakes ones (see "Open gaps" below).
- **No paid keyword-volume tool** (Google Keyword Planner, Ahrefs, SEMrush, etc.) was available
  or used. No search-volume number in this research artifact is a real measured figure. Where a
  query's popularity is discussed, it is either (a) a qualitative, explicitly `ai_inferred`
  estimate reasoned from how many competitors target that phrase and how the phrase is used in
  primary marketing/technical copy, or (b) omitted entirely.

### What was searched
Roughly 20 `WebSearch` queries covering: instant-quote CNC/sheet-metal marketplaces (global,
US, and Australia-specific); part-type-specific machining pages for each item in the wedge list
(gripper jaws, actuator housings, sensor/camera mounts, motor mounts, adapter/base plates, joint
housings, structural brackets/enclosures, jigs/fixtures/inspection fixtures); recurring
engineering-problem literature (weight reduction, tolerance stack-up, thermal, vibration);
industry-level demand context (IFR World Robotics 2025, Australia's National Robotics Strategy,
Australia robotics-market sizing research, the 2026 humanoid-robotics component supply-chain
narrative); and supplier/marketplace directories (Thomasnet) as an alternative-solution-surface
check. Full source list is inline in each part-type file and each JSON seed record's `evidence`
array.

### What could be verified vs. what could not
- **Verified (primary/official source, `documentation_verified`, `high` confidence):**
  Australia's National Robotics Strategy existing and its stated release timing and stated
  funding vehicle (Australian Government — Department of Industry, Science and Resources /
  Austrade); the existence and stated capabilities/geography of named competitor platforms
  (their own marketing copy, read as `supplier_marketing` not as independent fact).
- **Verified as "a market-research firm published this estimate" but NOT independently
  verifiable by us (`documentation_verified` for the fact of publication, but the underlying
  numbers themselves stay `ai_inferred`/`low`-to-`medium` since we cannot audit their
  methodology):** IMARC Group's Australia robotics market-size and unit-count forecasts; various
  aggregator articles' humanoid-robot market-size projections.
  IFR's own headline global/US installation figures, as relayed through The Robot Report and
  other secondary coverage (IFR's own site was unreachable — see limitation above), are treated
  the same way: plausible, attributed, but not independently re-derived by us.
- **Could NOT be verified at all, and is explicitly NOT claimed:** any real search-volume
  number for any query; any dollar figure for how large the initial-wedge market actually is;
  any Australia-specific search-behavior data (no Australia-specific keyword or forum evidence
  was found — see "US vs AU asymmetry" below); anything about our own funnel, visitor, RFQ,
  quote, or paid-transaction data, because **we have none yet** (see "The four demand layers,"
  below — this is stated explicitly everywhere it would otherwise be implied).

### Source-type and confidence legend
Vocabulary matches `docs/architecture/OBJECT_MODEL.md` rule 7 and the app's `lib/types.ts`
provenance fields, narrowed to the four source types the issue asked for:

| `source` | Meaning here |
|---|---|
| `ai_inferred` | Claude's reasoned inference from patterns across multiple sources, with no single citable authority for the specific number/claim. Always paired with `low` or `medium` confidence, never `high`/`verified`. |
| `supplier_marketing` | A manufacturer's or marketplace's own website/marketing copy — real and citable, but self-interested (capability claims, "we serve robotics," stated tolerances). |
| `documentation_verified` | Independent published documentation — government strategy documents, industry-body press releases (IFR, A3), third-party market-research reports, technical/engineering literature (Altium, ResearchGate, arXiv). Still not "we tested this ourselves." |
| `manual_entry` | A fact entered directly by a human reviewer, not derived from search. Not used in this initial pass — flagged as a future step once a human annotates/corrects records. |

| `confidence` | Meaning here |
|---|---|
| `low` | Single weak source, or an `ai_inferred` reasoned guess. |
| `medium` | Multiple consistent sources, or one reasonably authoritative secondary source. |
| `high` | Primary/official source directly on point (e.g., a government strategy page). |
| `verified` | Not used anywhere in this artifact. Nothing here has been operationally confirmed by us (no purchase, no test, no direct primary-source fetch we performed ourselves — see WebFetch limitation above). Reserved for future use once we have first-party observed data. |

### The four demand layers (kept explicitly separate throughout)
Per the issue's "Required distinction" and `OBJECT_MODEL.md`'s demand-maturity rule:

1. **Search demand** (people searching) — addressed qualitatively per part-type file and in
   `seed-search-queries.json`. No real volume numbers; intent classification only.
2. **Buyer/commercial demand** (people/companies with budget and intent to buy) — addressed via
   competitor-platform existence (a competitor selling into a segment is evidence someone pays
   for it) and industry-adoption data (robot install-base growth, National Robotics Strategy,
   humanoid-component supply-chain investment). This is still inference from market structure,
   not a measured demand figure.
3. **Our observed funnel data** — **we have none.** Manufacturing OS has not launched any public
   surface. Every `DemandSignal`-shaped record in `seed-demand-signals.json` that would map to
   `visitor`/`site_analytics` is explicitly recorded as `value: 0` / `not yet available`, not
   omitted or implied to exist.
4. **Paid transaction data** — **we have none.** No RFQ, quote, or order has occurred. Same
   explicit-zero treatment in `seed-demand-signals.json`.

## Scope

- **Geographies:** United States, Australia (per `docs/product/PRODUCT.md` "Initial market
  scope").
- **Part types (per the issue's wedge list), clustered into files:**
  - `actuator-housings.md` — actuator housings + joint housings (harmonic-drive/gearbox
    housings) — clustered together because they share buyers, materials, tolerance regime, and
    supplier base in the research found.
  - `gripper-jaws-eoat.md` — gripper jaws/components + EOAT/end-effector plates & components.
  - `sensor-camera-mounts.md` — sensor mounts, camera mounts.
  - `motor-mounts-adapter-plates.md` — motor mounts + adapter/base plates.
  - `structural-brackets-enclosures.md` — brackets/enclosures.
  - `jigs-fixtures-inspection.md` — jigs/fixtures/inspection fixtures.
  - `cnc-sheet-metal-general.md` — the general custom CNC/sheet-metal-parts category and the
    cross-cutting competitor/marketplace landscape (US + AU instant-quote platforms), since this
    surface competes across every part type above rather than being its own component category.

## Executive summary

- There is a real, well-established, highly competitive market of instant-quote CNC/sheet-metal
  marketplaces (Xometry, Protolabs/Protolabs Network, Fictiv, RapidDirect, PCBWay, JLCCNC,
  PartsBadger and others) and specialist job shops (RivCut, Zintilon, and many single-location
  machine shops found via Thomasnet) that explicitly market to robotics/automation buyers and
  name the exact part categories in our wedge (gripper components, actuator housings, sensor/
  encoder mounts, joint/harmonic-drive housings). Their existence and the specificity of their
  robotics-industry landing pages is itself evidence of real, monetizable buyer demand in this
  segment — see each part-type file's "Competitor / alternative solution surfaces" section.
- Materials and processes converge strongly across the whole wedge: 6061-T6 and 7075-T6/T7351
  aluminum dominate, CNC milling (3- and 5-axis) is the default process, wire EDM appears for
  gripper jaw/grip-surface detail work, and sheet-metal fabrication (laser cut + form + weld) is
  the alternative process for enclosures/brackets/EOAT plates. This is consistent enough across
  independent sources to carry `medium`–`high` confidence.
- Typical quantities across nearly every source describing this segment are prototype-to-low-
  volume (single digits to low hundreds of units), consistent with `docs/product/PRODUCT.md`'s
  MVP framing (CAD upload → RFQ → quote, not mass production).
- **US signal is comparatively strong**: multiple US-headquartered marketplaces and job shops
  with dedicated robotics-industry pages, IFR/A3-reported install-base and order-growth
  statistics, and a visible 2026 humanoid-robotics supply-chain narrative driving demand for
  precision actuator/joint components.
- **Australia signal is real but thinner and more market-structural than part-specific.** We
  found: several Australia-based instant-quote CNC providers (Zeal 3D, Precision Manufacturing
  Australia, Berkeley Engineering, Elite CNC) and Xometry's dedicated AU/NZ storefront — evidence
  that buyer/commercial demand for custom machined parts exists in Australia; a primary
  government source (Australia's National Robotics Strategy, released 2024) establishing
  national-level policy and funding intent around robotics adoption; and a third-party market-
  research forecast (IMARC Group) sizing the Australia robotics market. We found **no
  Australia-specific evidence broken down by the individual wedge part types** (no Australian
  competitor page specifically selling "gripper jaws" or "sensor mounts" the way US-based RivCut
  and Zintilon do) and **no Australia-specific search-behavior or forum evidence** at all. This
  gap is flagged per-file and is not silently patched with US data.

## Open gaps and unknowns for human review

1. **No real search-volume data anywhere.** Every "search demand" claim is a qualitative,
   `ai_inferred` estimate. A follow-up pass with a keyword-volume tool (Google Keyword Planner,
   Ahrefs, or similar) is needed before any SEO surface is built.
2. **Australia part-type-level evidence is thin.** We have Australia-level market/policy
   evidence but not Australia-level per-part-type buyer or search evidence. Recommend either
   direct outreach to AU robotics integrators/job shops or a dedicated AU-focused research pass.
3. **WebFetch was blocked for several primary domains** (`xometry.com`, `hubs.com`, `ifr.org`,
   `therobotreport.com`, `rivcut.com`) in this environment. Claims sourced from these domains
   went through `WebSearch`'s own summarization rather than a direct fetch/read by Claude. Human
   reviewer should re-fetch and spot-check the highest-stakes ones, especially the IFR
   installation figures and the National Robotics Strategy GDP-impact figure.
3a. **Some `WebSearch` results blend multiple source pages into one summary** (e.g., a single
    returned paragraph citing tolerance figures without a one-to-one line-to-URL mapping). Where
    this happened, the specific numeric claim is attributed to the most plausible single URL and
    marked `supplier_marketing`/`low`–`medium` confidence rather than presented as unambiguous
    fact — flagged inline in the relevant file.
4. **Every quantitative market-size or unit figure quoted (IFR install counts, IMARC's Australia
   market-size forecast, humanoid-market CAGR figures) is a third party's estimate/count, not
   something Manufacturing OS measured.** They are included because they are real, citable,
   dated publications — not because we vouch for their precision. Treat them as directional
   context only.
5. **No competitor pricing data was systematically collected** beyond one secondary EOAT price
   guide (Qviro, "Price Guide for End of Arm Tooling 2025" — see `gripper-jaws-eoat.md`).
   Pricing/margin research was out of scope for this issue but would materially sharpen
   `MarketOpportunity.marginPotentialPct` once pursued.
6. **`DemandSignal` seed records for `visitor`/`cad_rfq`/`quote`/`paid` stages are explicit
   zero-state placeholders**, not forecasts — see `seed-demand-signals.json`. They exist so the
   object model has a row to update once the system goes live, not because we have any real
   observed value yet.
7. **`SearchQuery.volumeMonthly` is intentionally left `null`** in `seed-search-queries.json`
   with a `relativeInterestTier` qualitative field used instead, because populating a fake number
   in that field would violate the issue's explicit "do not fabricate volumes" guardrail. A human
   or a keyword-tool-equipped follow-up pass should backfill real numbers before this field is
   trusted anywhere downstream.

## Human Gate

Per the issue's **Human Gate** requirement: this is a research deliverable only. **No public
SEO/search-surface generation, no `SearchSurface` records, and no customer-facing page work
should proceed based on this research until a human has reviewed it**, per
`AGENTS.md`'s required workflow (`… → AUDIT → FIX → VERIFY → HUMAN GATE → MERGE`) and the
issue's own explicit gate. This research artifact intentionally stops short of creating any
`SearchSurface` seed data for that reason — the part-type files note candidate surface topics
qualitatively, but no surface/slug/index-state record has been created.
