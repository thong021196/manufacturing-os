# Robotics supply-chain raw research — US + Australia + China (Issue #8)

**Status: RAW DATA. Human Gate not yet passed.** This is a top-down raw-research pass on the
robot supply chain for the US + Australia market, produced **before** any sub-market is chosen.
Per the issue and `AGENTS.md`, this folder contains **no scoring, no opportunity ranking, no
"best opportunity" conclusion, and no demand/competition tiers.** It does not narrow to
gripper/actuator/fixture or any other sub-market — that decision is explicitly deferred to a
human, after this data is reviewed.

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
| `sources.csv` | CSV | All 94 sources used, with `source_id` (S01-S94), URL, source type, publication date, and a one-line note — cross-referenced by every fact record via its Source URL. |

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

A single-tab Google Sheet, in Vietnamese, titled **"Robot US + Úc — Dữ liệu thô chuỗi cung ứng"**,
holds the full 24-column master fact table (all 82 records) exactly as specified by the issue.
**Link: see the pull request description.** It is the authoritative raw-data table; the CSV files
in this folder are topic-sliced views of the same 82 records for easier in-repo review.

## Coverage summary

- **82 evidence/fact records**, drawn from **94 sources** (industry standards bodies (IFR),
  government/policy sources (CSIS, Australian Government/Ai Group/Jobs and Skills Australia,
  US Section-301/USTR-adjacent analysis), a peer-reviewed research paper (*Scientific Reports*),
  market-research reports, company/supplier sites (marked `supplier-claimed` throughout), B2B
  marketplace listings, and independent industry commentary/newsletters).
- **Robot categories covered:** Humanoid/general-purpose, AMR/warehouse/logistics,
  Cobot/industrial arm/machine tending, Agriculture robot, Inspection/field robot, Service robot,
  Maker/hobby/education robot, Startup-built custom robot systems — all eight minimums named in
  the issue.
- **Countries covered:** US, AU, CN, and Global (for cross-cutting supply-chain/market facts).
- **BOM depth reached:** category -> subsystem (Mechanical structure, Motion/actuator,
  Perception/sensor, Compute/controller, Power, End-effector) -> component (e.g. harmonic-drive
  reducer, RV/cycloidal reducer, frameless/servo motor, absolute encoder, crossed-roller bearing,
  LiDAR, edge-AI SoC, gripper, PCB/controller board, battery pack) -> material (aluminum
  6061/7075, titanium, NdFeB magnets, electrical steel, engineering plastics, Li-ion/LiPo
  chemistries) -> manufacturing process (CNC milling/turning, PCB fab/SMT, injection molding,
  sheet metal, die casting, motor winding) -> supplier/cluster (Shenzhen/Dongguan/Songgang,
  named Chinese and Western suppliers) -> China advantage signal -> US/AU friction signal, per the
  issue's required chain.
- **Both required views present:** enterprise/OEM/integrator (most records) and
  maker/hobbyist/lab/startup/SME (dedicated `maker-startup-signals.csv`, 20 records, plus the
  RobStride integrated-actuator record which explicitly spans both views).

## Known coverage gaps / explicitly flagged `unknown`s

These are called out in individual records (via the `Missing / Unknown` column) and repeated here
for visibility, per the issue's instruction not to silently fabricate or borrow data across
countries:

1. **No AU-specific humanoid warehouse/industrial deployment found** (as of the collection date) —
   AU humanoid activity located in this pass is concentrated in aged care/companionship, not
   industrial use, unlike the clearer US pattern (Figure/Agility in auto and 3PL).
2. **No AU-specific maker/hobby robotics participation statistics** (e.g. an AU-equivalent of
   FIRST/VEX team counts) were located — explicitly marked `unknown` rather than assumed similar
   to the US.
3. **No AU-specific aggregate robotics-startup funding figure** comparable to the US 2026 YTD
   figure was located — only individual-company examples (SwarmFarm, Agerris, Andromeda).
4. **No source-quantified steel/stainless/tool-steel share of robot BOMs** was found — this
   material's usage pattern is logged as `inference`, not fact, per the issue's instruction not to
   assume from general CNC-materials guidance.
5. **No independently verified like-for-like price comparison** between an equivalent US and
   Chinese absolute encoder SKU, or between a specific Chinese gripper SKU and its Robotiq/OnRobot
   "equivalent," was located — both sides' pricing claims come from their own vendor/directory
   content and are marked `supplier-claimed` / flagged as a gap.
6. **No dedicated, distinctly-sourced evidence for "brake" or "driver" (motor-driver board) as
   separate BOM line items** was located, even though the issue names them explicitly in its
   `motor -> reducer -> encoder -> bearing -> brake -> driver -> housing` example chain — flagged
   as a specific coverage gap rather than invented.
7. **No source-level evidence for a 2-10 person robotics-startup's specific tooling/workflow**
   (as distinct from either the individual-maker level or the well-funded-startup level) was
   located — flagged as `inference`/gap, not fabricated.
8. **No quantitative survey of what share of maker/hobbyist robot builds use 3D printing vs. CNC
   vs. other fabrication** was located, per the issue's explicit instruction not to assume a
   3D-printing-driven trend without evidence — qualitative project-level evidence only (Pedro,
   reBot-DevArm) is logged, marked `inference`.
9. Two US cobot-market-size figures from two different market-research firms for the same base
   year (2024) **disagree materially** (US$133.1M vs US$653.45M) — both are kept as separate
   records per the "do not merge contradictory sources into one conclusion" rule, rather than
   averaged or one discarded.
10. `WebFetch` (direct URL retrieval) was unavailable/restricted for a number of domains under this
    session's egress policy; all research in this pass was performed via `WebSearch`, which
    returns real source URLs and retrieved content/snippets. This is the same limitation flagged
    by the other two research tracks in this repo (issues #4 and #5 / PRs #6 and #7).

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
- No changes to `app/`, `lib/`, `components/`, or any other runtime/frontend code — this PR is
  research/docs/data only.

## Human Gate

Per the issue: this PR stops here for human review of the raw data. The Google Sheet link is in
the PR description. No sub-market has been chosen and no Opportunity Map has been built.
