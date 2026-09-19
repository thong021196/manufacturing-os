# Robot RFQ anatomy — deep-check research (issue #13)

Raw, unranked research answering one question: **what does a real custom-manufacturing RFQ
for a robot part/assembly actually have to contain** — product, geometry, material, process,
tolerance, interface, inspection, and lifecycle — deep enough that "aluminum → CNC" is not an
acceptable stopping point.

This is a **deep-check pass on top of issue #11 / PR #12**
(`docs/research/robotics-custom-rfq-raw/`, branch `claude/issue-11-custom-manufacturing-rfq-research`),
not a replacement for it. That folder is read-only context here and is **not modified**. Where
this task's research re-confirms or re-cites a source issue #11 already used (e.g. the
DakingsRapid and CARR Machine vendor pages), it is cited again here in the new 41-column,
RFQ-anatomy-shaped schema — the two datasets are companions, not duplicates: issue #11 answers
"what custom parts does each robot category generate," issue #13 answers "what does a real RFQ
for one of those parts have to specify."

## Scope (per issue #13, locked)

- Target market: US + Australia. Supply-backend context: China manufacturing capability.
- In scope: robot / part / assembly / manufacturing-requirement facts only — geometry,
  material, process, tolerance, GD&T, interface, fastening, assembly, inspection, FAI,
  material traceability, lifecycle stage, revision behavior, repeat/replacement pattern,
  single/multi-process, tooling/NRE tied directly to a manufacturing process.
- **Out of scope** (per issue, not researched): shipping/freight/Incoterms, payment terms,
  quote validity, delivery address, packaging/logistics, invoice/PO mechanics,
  checksum/release-signature workflow, Alibaba/SKU/shop-ranking research, sub-market
  selection, opportunity scoring/ranking.

## Files

- `rfq-anatomy-master.csv` — the full 41-column, 48-record raw dataset (R001–R048). Source of truth.
- `rfq-families.csv` — per-RFQ-family rollup: record count, robot types touched, and a
  coverage-percentage/rating computed mechanically from how many of the 19 core technical
  columns are filled with a real (non-`unknown`) value across that family's records.
- `critical-interfaces.csv` — every record with a real (non-`unknown`) critical-interface value.
- `tolerance-gdt.csv` — every record carrying a real general/critical tolerance or GD&T callout.
- `materials-processes.csv` — every record with a real material grade and/or primary process.
- `inspection-requirements.csv` — every record with a real inspection method/equipment, FAI
  requirement, or material-cert/traceability value.
- `lifecycle-revision.csv` — every record with a real lifecycle stage, revision-intensity,
  failure/rework reason, or repeat/replacement signal.
- `sources.csv` — all 39 unique source URLs used, with type, publication date (where known),
  confidence level(s) they were cited at, and which record IDs cite them.
- `coverage-audit.md` — per-family and per-robot-type audit against issue #13's own coverage
  rule (section 7): a family is not "done" just because part+material+process are known.

All derivative CSVs are mechanically filtered/derived from `rfq-anatomy-master.csv` by
non-`unknown` value in the relevant column(s) — record IDs always trace back to the master.

## Dataset shape

- **48 records** (R001–R048), all 41 columns per issue's spec, Vietnamese headers.
- **All 9 robot types** from the issue's required list appear at least once: Humanoid (13
  records — deepest-covered by far), Cobot/industrial arm (9), AMR/warehouse (7),
  Maker/startup-built (6), Inspection/field robot (5, mostly quadruped-platform evidence),
  Service robot (3), Agriculture robot (2), Exoskeleton (2), Mining/autonomous haulage (1 —
  by far the weakest, see coverage audit).
- **All 12 priority RFQ families** from section 4 appear, from 2 records (gripper jaw/finger,
  sensor/camera mount, jig/fixture/EOAT structure) to 8 (joint/link).
- A handful of records (R015, R019, R030) are **deliberate gap markers** — every field
  `unknown` except the ones establishing what was searched for and not found — kept per the
  issue's explicit instruction to write `unknown` rather than infer.

## Honesty / methodology notes

- **No fabricated tolerances, GD&T, or materials.** Every technical number in this dataset
  came from a real, cited, dated-where-possible source. Where no real source was found for a
  field, it is `unknown`, not inferred or estimated from "industry practice."
- **Vendor claims are marked `supplier_marketing`, never promoted to independent fact.** A
  large share of the richest tolerance/GD&T detail in this dataset (bearing-bore concentricity
  0.0002 in, gripper-jaw parallelism 0.05 mm, battery-enclosure sealing tolerances, hard-anodize
  spec, etc.) comes from CNC/rapid-manufacturing **vendor marketing pages** (DakingsRapid,
  RivCut, ptsmake, CharMax, Waykenrm, and similar). These are kept at `supplier_marketing`
  confidence throughout and every such row's `Notes` column says so explicitly — they read as
  internally consistent, plausible engineering numbers, but none are independently verified
  against a named OEM's actual released drawing.
- **Independent/primary sources are marked `documentation_verified`** and used wherever found:
  the Harmonic Drive component-set catalog (housing bore/shaft fit classes), the ISO 9409-1
  robot-flange standard itself, Böllhoff's own HELICOIL installation spec, PEM's own
  tightening-torque documentation, Henkel/Loctite's own threadlocker/retaining-compound
  documentation, AS9102 (First Article Inspection) and AS9100D (material traceability) as
  referenced by industry sources, ISO 15614 (welding-procedure qualification), two arXiv
  academic papers with real named-system material/geometry detail (CyberDiver robotic
  impactor's 6061-T6 housing; the open-source underwater-field-robotics toolkit's O-ring/
  pressure-housing guidance), a peer-reviewed PMC dexterous-hand-prosthesis paper (SUS303/
  Al6061 finger parts, ±0.005 mm CNC tolerance), and one independent (non-vendor) technical
  teardown of a named, shipping humanoid product (Unitree G1 — 5-axis-machined 7075 upper-arm
  flange, billet-not-cast structural parts).
- **Only two records name a specific, currently-shipping commercial robot's actual part
  material/process with independent (non-vendor) sourcing**: R002/R038 (Unitree G1 teardown)
  and R020/R033 (CyberDiver research robot, arXiv paper). Everything else is either a generic
  component-supplier/standards-body spec (applies to any robot using that interface, not
  OEM-specific), a vendor's generic capability claim, or an explicit `unknown` gap.
- **Tesla Optimus** (R027) is explicitly kept at `supplier_marketing`/low confidence: the only
  material/process claims found for Optimus actuator housings came from a third-party
  actuator-component vendor's blog analysis, not Tesla's own documentation, and are flagged as
  such — not upgraded to fact.
- **Mining/autonomous haulage** (R011) is the one robot type with essentially no part-level
  RFQ-anatomy evidence found at all; recorded honestly as a near-total gap rather than
  papered over with inference (these are OEM-built heavy vehicles typically not sourced via
  outside custom-CNC/fab RFQs, which may explain the absence of public technical detail).
- WebFetch was not attempted directly in this session (per this session's own prior-issue
  notes, it has been blocked for every external domain tried on this repo's earlier research
  tasks); all sourcing here relies on `WebSearch`'s own retrieved snippets/summaries, same as
  issue #11's research.
- No Alibaba, SKU, or shop-ranking research was performed. No sub-market was chosen. No
  scoring or ranking of families/robots/OEMs was performed — every row stands as raw evidence.
- Contradictory or partial evidence is kept as separate rows rather than reconciled (e.g. the
  quadruped-platform material claims for ANYbotics ANYmal vs. Ghost Robotics Vision 60 come
  from two different source types and are kept at two different confidence levels, not merged).

## Google Sheet

The issue asks for one logical dataset with Vietnamese headers. This dataset (48 records,
41 columns) fit under this session's upload ceiling in a single upload, so no chunking was
needed — one tab, all IDs contiguous R001–R048, verified by downloading the uploaded Sheet
back and confirming all 48 record IDs (R001 through R048) round-tripped with no row loss:

- **Robot RFQ anatomy master dataset (issue #13) — R001-R048**:
  https://docs.google.com/spreadsheets/d/1Dwot6zouCJmlBCf1EdZVQ0pOQsDYU1qDyo5F7JiXxbA/edit

## Human Gate

Raw research only — no scoring, no ranking, no sub-market selection, no logistics/commercial
fields. This PR is not merged. Per `AGENTS.md`'s required workflow, it stops at PR/TEST/AUDIT
awaiting human review before any FIX/VERIFY/MERGE step.
