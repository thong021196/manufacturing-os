# Robotics supply-chain raw research — US + Australia + China (Issues #8 + #10)

**Status: RAW DATA. Human Gate not yet passed.** This is a top-down raw-research corpus on the
robot supply chain for the US + Australia market, produced **before** any sub-market is chosen.
Per the issues and `AGENTS.md`, this folder contains **no scoring, no opportunity ranking, no
"best opportunity" conclusion, and no demand/competition tiers.** It does not narrow to
gripper/actuator/fixture or any other sub-market — that decision is explicitly deferred to a
human, after this data is reviewed.

**Two research passes, same fact table:**
- **Pass 1 (issue #8 / PR #9):** 82 records, R001-R082 — seed market map, all 8 required robot
  categories, first BOM pass through subsystem -> component -> material -> process.
- **Pass 2 (issue #10, this update):** 89 new records, R083-R171 — deepens Pass 1 by (a) opening
  all four subsystems the issue requires that Pass 1 had not yet covered (Safety, Thermal/
  cooling, Communication, Wiring/connectors), (b) closing or re-confirming every gap Pass 1
  explicitly flagged, (c) adding named-component-level China-advantage / US-AU-friction
  evidence across many more components (torque sensor, brake, driver, LiDAR, battery, gripper,
  encoder, magnet wire, rare-earth processing, PCB/SMT, injection molding, die casting, sheet
  metal, etc.), and (d) adding two well-evidenced categories beyond the original 8 — Mining/
  autonomous haulage robot (AU-dominant) and Exoskeleton/wearable robot (US-heavy) — per the
  issue's explicit allowance for an important category found during research.
- **171 records total** as of this pass. See `coverage-audit.md` for the full per-category
  audit (what's mapped, what's still a gap) and for why this is below the issue's 600-1,400
  sanity-check range (explicitly a sanity check, not a KPI, per the issue) despite covering
  every required subsystem, all 8 original categories plus 2 new ones, and every Pass-1-flagged
  gap.

## What this is

A raw evidence ledger mapping, for each robot category with meaningful adoption/growth signal in
the US and/or Australia:

```
Robot type -> Buyer/User -> Subsystem -> Component -> Material -> Manufacturing process
           -> Supplier cluster -> China advantage -> US/AU local weakness/friction
```

covering both the **enterprise / OEM / startup / integrator** view and the
**maker / hobbyist / lab / small-team** view, as required by the issue.

## Files in this folder

| File | Shape | What it holds |
|---|---|---|
| `robot-categories.csv` | CSV | One row per adoption/growth-signal fact, per robot category (US, AU, or Global), with buyer, use case, lifecycle stage. |
| `buyers-users.csv` | CSV | One row per buyer/user fact, tagged `enterprise/OEM/integrator` or `maker/hobbyist/startup` view. |
| `subsystems.csv` | CSV | One row per subsystem-level fact (Mechanical structure, Motion/actuator, Perception/sensor, Compute/controller, Power, End-effector, Communication), with component examples. |
| `components.csv` | CSV | One row per component-level fact (e.g. harmonic-drive reducer, RV reducer, encoder, bearing, LiDAR, gripper, edge-AI compute module), with material/process/supplier where known. |
| `materials.csv` | CSV | One row per material fact (aluminum, titanium, NdFeB magnets, electrical steel, engineering plastics, battery chemistries), with China-advantage / US-AU-friction signal where applicable. |
| `manufacturing-processes.csv` | CSV | One row per manufacturing-process fact (CNC, PCB fab/SMT, injection molding, sheet metal, die casting, motor winding), by country. |
| `china-supply-advantage.csv` | CSV | Every fact tagged with a China-advantage signal — supplier density, price, cluster geography, integrated modules, export-readiness. Each row keeps its own source; no rows were merged into a single "China is strong" conclusion. |
| `us-au-frictions.csv` | CSV | Every fact tagged with a US or AU friction signal — tariffs, import dependency, workforce shortage, compliance/liability, manufacturing-capacity weakness. |
| `maker-startup-signals.csv` | CSV | Every fact specific to the maker/hobbyist/lab/small-startup/SME-automation view, including the `idea -> AI-assisted design -> CAD -> BOM -> standard modules -> custom parts -> fabrication -> assembly -> software -> iterate` workflow the issue names. |
| `sources.csv` | CSV | All 183 sources used across both passes (S01-S94 from Pass 1, S95-S183 from Pass 2), with `source_id`, URL, source type, publication date, and a one-line note — cross-referenced by every fact record via its Source URL. |
| `pass2-master.csv` | CSV | **New in Pass 2.** The 89 new records (R083-R171) in the full 24-column schema, i.e. exactly the rows appended to the Google Sheet. Kept as its own file (rather than only distributed across the 9 topic CSVs above) so a reviewer can see everything Pass 2 added in one place, cross-referenced against Pass 1's same-schema rows in the Google Sheet. Every Pass-2 row is *also* sliced into the relevant topic CSV(s) above, exactly as Pass 1's rows are — so a row commonly appears in 2-4 files (e.g. a China-sourced bearing fact appears in `components.csv`, `materials.csv` and `china-supply-advantage.csv`), matching Pass 1's existing pattern. |
| `coverage-audit.md` | Markdown | **New in Pass 2.** The per-category coverage audit required by the issue: subsystems/components/materials/processes mapped, US gaps, AU gaps, China-structural-advantage gaps, and remaining `unknown`s — for all 10 categories (8 original + 2 added this pass). |

**Why topic CSVs and `pass2-master.csv` both exist, instead of only slicing into topic files:**
Pass 1's rows were manually distributed across the 9 topic files without a separate master
CSV in the repo (the master table lived only in the Google Sheet). For Pass 2, keeping a
repo-local `pass2-master.csv` makes the new rows independently reviewable/diffable in the PR
without needing to open the Google Sheet, while the topic-CSV slices preserve exact continuity
with Pass 1's file structure. This is the "clearly-named Pass-2 supplement file" approach the
issue explicitly allows as an alternative to editing only the existing files.

**Format choice:** CSV for every file. The data is uniformly tabular (one fact/evidence record
per row) and CSV keeps it directly diffable in PRs and directly importable into a spreadsheet,
which matches how the issue's Google Sheet output is structured. JSON was not used because none
of these tables need nested/hierarchical structure beyond what the `subsystem`/`component`
foreign-key-style columns already express.

**Relationship between files:** `robot-categories.csv`, `buyers-users.csv`, `subsystems.csv`,
`components.csv`, `materials.csv`, `manufacturing-processes.csv`, `china-supply-advantage.csv`,
`us-au-frictions.csv` and `maker-startup-signals.csv` are all **projections of the same
underlying 82-record master fact table** (the one also published as the Google Sheet — see
below), filtered/re-columned per topic. Every row carries a `fact_id` (`R001`-`R082`) that maps
1:1 to the `ID` column in the Google Sheet, so a reviewer can cross-reference "this CNC-cost claim
in `manufacturing-processes.csv`" to its full 24-column record (country, confidence, fact vs
inference, missing/unknown, etc.) in the Sheet.

## Google Sheet (raw data, required by the issue)

**v1 (Pass 1, unchanged, kept as an audit trail):**
https://docs.google.com/spreadsheets/d/1UDWKuvG3ZNIkOCjPWDJvpX8x4u_XSXBKwV4vWSO-sJc/edit
Single tab, Vietnamese headers, 24 columns, the original 82 records (R001-R082). **Left
untouched, not trashed**, so it remains available for diffing against v2.

**v2 (Pass 2, canonical — these are the versions to review going forward), in TWO linked
sheets:** see the PR description for both links.
- **v2, part 1** — same title with a `(v2)` marker, 24-column / Vietnamese-header structure,
  containing **all 82 original rows unchanged, immediately followed by the first 33 new
  Pass-2 rows (R083-R115)** — 115 rows total.
- **v2, part 2** — title marked `(v2, phần 2: R116-R171)`, same 24-column schema (header
  repeated for standalone readability), containing the **remaining 56 new Pass-2 rows
  (R116-R171)**.
- Together, v2 part 1 + part 2 contain the full 171-row combined dataset (82 original + 89
  new), with no row omitted, duplicated or reordered relative to `pass2-master.csv` /
  `combined_master.csv` in this repo.

**Why a new file ID instead of an in-place update to v1, and why two files instead of one:**
this environment's only Google Drive tool (`mcp__Google_Drive__*`) has no Sheets-values-append
or in-place-overwrite capability — `create_file` always creates a new file, and `update_file`
only changes a file's title/parent folder, never its content. Appending in place was therefore
not possible; the only way to deliver "all 82 old rows plus new rows in one sheet" was to build
that combined content locally (downloaded v1 as CSV, verified it against the 82 rows in this
repo, appended the 89 new rows, re-uploaded as a new Sheet) and publish it as a new file.
Separately, this session's tool-call content size for a single file-creation call proved to
have a hard ceiling reached partway through the 171-row / ~200KB combined CSV (confirmed by two
independent attempts that both truncated at a similar point) — well under Google Sheets' own
limits, but a real limit of this specific session's upload path. Splitting the canonical v2
data across two sequential, non-overlapping files was the reliable way to deliver 100% of the
data without silent truncation. This is a tooling constraint, not a sign that data was
discarded or that a merge was skipped by choice — v1 stays live and byte-for-byte unchanged as
the audit copy, and both v2 parts are additive, read-only-safe, non-overlapping slices of the
exact same combined table that is also fully present in this repo's CSV files.

## Coverage summary

- **171 evidence/fact records** (82 from Pass 1 + 89 from Pass 2), drawn from **183 sources**
  (Pass 1: S01-S94; Pass 2: S95-S183) — industry standards bodies (IFR, ISO, EtherCAT
  Technology Group), government/policy sources (CSIS, Australian Government/DISR/CSIRO/Ai
  Group, US Census Bureau, US BIS/Section-301, Australian DFAT/AUSFTA), a peer-reviewed
  research paper (*Scientific Reports*) plus an academic review paper (agriculture
  actuators/sensors), market-research reports, company/supplier sites (marked
  `supplier-claimed` throughout), B2B marketplace listings, SEC filings, and independent
  industry commentary/newsletters.
- **Robot categories covered:** the 8 minimums named in the issue (Humanoid/general-purpose,
  AMR/warehouse/logistics, Cobot/industrial arm/machine tending, Agriculture robot,
  Inspection/field robot, Service robot, Maker/hobby/education robot, Startup-built custom
  robot systems) **plus 2 added in Pass 2** per the issue's allowance for an important
  category found during research: Mining/autonomous haulage robot (AU-dominant — Rio
  Tinto/BHP/FMG autonomous fleets) and Exoskeleton/wearable robot (US-heavy).
- **Subsystems covered:** all 10 named in the issue, including the 4 (Safety, Thermal/cooling,
  Communication, Wiring/connectors) that Pass 1 had not yet opened.
- **Countries covered:** US, AU, CN, and Global (for cross-cutting supply-chain/market facts).
- **BOM depth reached:** category -> subsystem (all 10 named in the issue, see
  `coverage-audit.md`) -> component (e.g. harmonic-drive reducer, RV/cycloidal reducer,
  frameless/servo motor, brake, driver board, torque sensor, absolute encoder, crossed-roller
  bearing, LiDAR, edge-AI SoC, PLC, gripper, dexterous hand, battery pack, DC-DC converter,
  drone gimbal, mecanum wheel, GNSS/RTK module) -> material (aluminum 6061/7075, titanium,
  NdFeB magnets + upstream rare-earth processing, electrical steel, engineering plastics
  incl. PEEK, copper magnet wire, Li-ion/LiPo chemistries, 3D-print filament) -> manufacturing
  process (CNC milling/turning, PCB fab/SMT, injection molding, sheet metal, die casting,
  motor winding) -> supplier/cluster (Shenzhen/Dongguan/Songgang/Pearl-River-Delta/Luoyang,
  named Chinese and Western suppliers) -> China advantage signal -> US/AU friction signal, per
  the issue's required chain.
- **Both required views present:** enterprise/OEM/integrator (most records) and
  maker/hobbyist/lab/startup/SME (`maker-startup-signals.csv`, 32 records after Pass 2, plus
  the RobStride integrated-actuator record which explicitly spans both views).

## Known coverage gaps / explicitly flagged `unknown`s

Full per-category detail is in `coverage-audit.md` (new this pass). The Pass-1 gaps below are
kept here for continuity, each annotated with its Pass-2 status — closed, partially closed, or
still open, per the issue's instruction not to silently drop or fabricate a resolution:

1. **AU humanoid warehouse/industrial deployment:** still **not found** — Pass 2 explicitly
   re-confirmed this as a dated negative-evidence record (R083) rather than leaving it as
   silence; the one real AU humanoid deployment found (Andromeda/Abi, 22 units/1,500 residents)
   is aged-care companionship, a different use case.
2. **AU maker/hobby participation stats:** **partially closed** — VEX AU 200 teams
   (2025-26 Nationals, R084) is a real, dated AU figure, but it is a team count, not a student
   count, so it is still not directly comparable to the US FIRST 93,000-student figure.
3. **AU aggregate robotics-startup funding:** **partially closed** — AU hardware+robotics+IoT
   sector funding (A$297M, 2025, R085) was located, but it is sector-wide, not robotics-only.
4. **Steel/stainless-steel BOM share:** **still open** — searched again this pass, still no
   quantitative source; re-confirmed as `inference` (R131).
5. **Like-for-like US-vs-China component pricing:** **still open** — no controlled comparison
   found for any component in either pass; every China-cost claim remains `supplier-claimed`
   or market-report-level.
6. **"Brake"/"driver" as distinct BOM line items:** **closed** — both now have dedicated
   records (R086 brake, R087 driver) with named non-China suppliers (brake) and a
   China-vs-foreign servo/driver market-share breakdown (driver).
7. **2-10 person startup tooling/workflow specificity:** **partially closed** — a general
   (non-robotics-specific) hardware-prototyping workflow record (R111) and cost-band record
   (R146) were added; still no robotics-specific small-team figure.
8. **Maker 3D-printing-vs-CNC share:** **partially closed** — a hobby-CNC-community survey
   proxy (70% CNC, R128) was located and explicitly flagged as an imperfect, non-robot-specific
   proxy, not a resolution.
9. **Contradictory US cobot-market-size figures:** **worsened (by design)** — a *third*,
   also-disagreeing figure (US$850M machine-tending-segment, US$2B overall, R103) was found
   this pass; all figures are kept as separate records per the raw-data rule rather than
   reconciled.
10. `WebFetch`/search-tool limitations: unchanged from Pass 1 — this pass's research was
    performed via `WebSearch`, which returns real source URLs and retrieved content/snippets.

**New Pass-2-only gaps** (not present in the Pass-1 list because the topics weren't yet
researched) are listed in `coverage-audit.md`, including: AU robot density (not disclosed in
the located IFR release), no dominant China supplier found for cobot grippers/torque
sensors/machine-vision cameras/EtherCAT chips (a real asymmetry vs. the strong China
concentration found in LiDAR/batteries/humanoid-hands/drones), and two new categories (Mining,
Exoskeleton) that are adoption-level only pending a further pass.

## Provenance rules applied

Every record in every file (and in the Google Sheet) carries: source URL, source type
(government / industry standards body / research paper / market-research report / company
official site / **supplier-claimed** / B2B marketplace listing / news media / industry
publication / independent commentary), publication date (where available), country, a confidence
rating (`high` / `medium` / `low`), and an explicit `fact` / `inference` / `supplier-claimed`
tag. Marketing claims from suppliers are marked `supplier-claimed` rather than treated as
verified fact. Contradictory evidence (e.g. the two different US cobot-market-size figures) was
kept as separate records rather than resolved into a single number.

## What this folder deliberately does NOT contain

- No scoring, weighting, or ranking of categories, components, or opportunities.
- No "best opportunity," "demand tier," or "competition tier."
- No sub-market selection (gripper/actuator/fixture or otherwise).
- No Opportunity Map.
- No Alibaba research, supplier-SKU/catalog mining, or MOQ/shop-ranking data (Pass 2 stayed at
  the market-map level throughout, per the issue's explicit scope lock).
- No changes to `app/`, `lib/`, `components/`, or any other runtime/frontend code — this update
  is research/docs/data only.

## Human Gate

Per both issues: this remains open for human review of the raw data. All three Google Sheet
links (v1 original, v2 part 1, v2 part 2) are in the PR description. No sub-market has been chosen, no
Opportunity Map has been built, no Alibaba/SKU-level research was done, no opportunity
scoring/ranking exists anywhere in this data, and the PR has not been merged.
