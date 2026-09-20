# Robotics RFQ family technical evidence — Pass 4 (Issue #15)

This folder deep-expands the RFQ-family technical evidence base built in Issue #13 / PR #14
(`docs/research/robotics-rfq-anatomy/`, branch `claude/issue-13-robot-rfq-anatomy-research`,
**not yet merged to `main`**). It does not modify or overwrite that baseline; it is a
separate, additive dataset covering the same 12 RFQ families with new, independently
sourced technical evidence.

## Scope (per Issue #15)

- Target market context: US + Australia. Supply-backend (China manufacturing capability)
  appears only as technical capability/context, never as market data.
- Technical evidence only, mapped to real robot custom-manufacturing RFQs.
- No shipping/freight/Incoterm/payment/packaging/PO-workflow data.
- No Alibaba/SKU/shop-ranking data, no opportunity scoring, no "best sub" selection.
- Taxonomy-first research: for each family, the coverage grid (geometry × material ×
  process × tolerance/GD&T × interface × assembly × inspection × lifecycle) was built
  first, then targeted searches filled specific gaps — not open-ended browsing followed
  by ad hoc appends.

## What's actually in this dataset

**75 evidence records, 123 unique source URLs**, across all 12 required RFQ families.
This is well below the issue's 800–1,200 target range. That is a deliberate, disclosed
trade-off, not an oversight — see "Honest accounting" below.

Every record maps to one or more of the 46 master-schema columns and states explicitly,
in the `Coverage cell` column, which taxonomy cell it fills. Fields with no real source
are marked `unknown`, never inferred. Where two sources disagreed, both were kept with a
note in the `Conflict/contradiction` column (see e.g. the ANSI B17.1-1967 vs NEMA MG 1
motor-keyway discrepancy in `shaft-bearing-motor-mount.csv`).

## Files

- `rfq-family-evidence-master.csv` — all 75 records, Vietnamese headers, 46-column schema, IDs R0001–R0075.
- One CSV per family (12 files): `precision-cnc-housing.csv`, `bracket-mount-adapter.csv`,
  `shaft-bearing-motor-mount.csv`, `joint-structural-link.csv`, `gripper-jaw-finger.csv`,
  `welded-frame-chassis.csv`, `sheet-metal-enclosure.csv`, `sensor-camera-mount.csv`,
  `battery-electronics-enclosure.csv`, `pressure-sealed-housing.csv`, `jig-fixture-eoat.csv`,
  `prototype-multipart-assembly.csv`.
- `rfq-family-coverage-matrix.csv` — per-family record count, unique-source count,
  vendor-claimed vs primary/standard/academic source mix, and % coverage by field group
  (geometry, material/process, finish/heat/weld, tolerance/GD&T, interface,
  fastening/assembly, inspection, lifecycle/revision, failure/repeat, process strategy).
- `sources.csv` — all 123 unique source URLs, each with source type, typical confidence,
  publication date, which RFQ families it was used for, and which record IDs cite it.
- `coverage-audit.md` — per-family narrative audit against the issue's own coverage
  acceptance rule, biggest remaining gap per family, and an honest accounting of why this
  pass landed at 75 records rather than 800–1,200.

## Source diversification (the issue's explicit ask)

Issue #15 flagged that Pass 3's richest tolerance/GD&T data over-relied on a single vendor
(DakingsRapid). This pass deliberately diversified:

- **US patents from named assignees**: Boston Dynamics (screw-actuator leg housing),
  Shenzhen Yuejiang/DOBOT-affiliated (2 cobot joint-module bearing-seat patents), multiple
  F/T-sensor and LiDAR-vibration-isolation patents, an AGV chassis-fastening patent, a
  gripper quick-change-finger patent.
- **Standards bodies**: ISO 9409-1 / ISO 286 / ISO 1101 / ISO 261 / ISO 5817 / ISO 965-1,
  ASME Y14.5, AS9102, EN 10204, NEMA MG1, UL 2580, UN 38.3, IEC 62133, IPC-CC-830,
  MIL-I-46058C, ABS (classification-society hydrostatic proof-test guidance).
- **Peer-reviewed/academic sources**: an MIT precision-engineering thesis, a NASA
  generative-design technical report, papers on keyed shaft-hub fatigue, welded-joint
  fatigue and robotic crack repair, humanoid BOM/actuator-standardization analysis, and
  soft-gripper contact-mechanics research.
- **Named-OEM primary documentation** (not marketing copy): Robotiq gripper manuals,
  REV Robotics bracket catalog, Kollmorgen motor-flange standards, HEIDENHAIN encoder
  mounting-tolerance guidance, Parker Hannifin's O-Ring Handbook, Blue Robotics and REACH
  ROBOTICS underwater-robotics product/QC documentation, ABB spare-parts program, Lincoln
  Electric welding-fixture guidance, Piab/Millibar/ASS Automation EOAT quick-change
  systems, Marposs/Inficon leak-test equipment documentation.
- **Independent trade press / engineering blogs**: Machine Design, The Fabricator,
  Robotics and Automation News, and an independent robotics-engineering Substack
  (zanerobotics) with unusually specific cobot-joint design detail.
- Manufacturing-platform/fabricator technical guides (Fictiv, RivCut, Protolabs, Frigate,
  epocrafter, Able Hardware, and many others) are used throughout but no single one
  dominates any family — see `rfq-family-coverage-matrix.csv`'s vendor-vs-primary column.
  One DakingsRapid citation remains (EOAT lightweighting numbers), retained only because
  it is a specific, real, non-duplicated numeric claim not found in an alternative source;
  it is 1 of 75 records (1.3%), versus its outsized role in Pass 3.

## Honest accounting: why 75, not 800–1,200

Issue #15 explicitly instructs: *"if you get close to running low on your own turn
budget, prioritize finishing coverage-audit.md accurately over reaching the top of the
range... a smaller, well-documented, honest dataset with accurate gap reporting is
strictly better than an inflated one."* This pass was executed as a single, continuous
agent session with a bounded number of tool calls, not the multi-day research effort the
800–1,200 target implicitly assumes. Within that budget, the priority was:

1. Every one of the 12 families gets genuine geometry + tolerance/GD&T + interface +
   fastening/assembly + inspection + lifecycle coverage from at least 4 independent
   sources (achieved for all 12 — see `coverage-audit.md`).
2. No padding: no two records restate the same fact from the same source, no marketing
   sentence split into multiple rows, no market-size data substituting for technical
   evidence.
3. Deliberate, visible reduction in single-vendor dependence versus Pass 3.

Given more session time, the highest-value next step is not new families but *more
independent named-OEM/patent/standards evidence per family* to reach the issue's
suggested per-family ranges (e.g., precision CNC housing at 100–150; this pass reached
11). `coverage-audit.md` states this explicitly per family rather than leaving it
implicit.

## Known limitations

- Some sources are secondary explainers of a standard (e.g., a blog summarizing NEMA MG1
  or ISO 9409-1) rather than the paywalled standard text itself; where this is the case
  it is marked in `Source type` and the exact numeric standard values are marked
  `unknown` if not independently confirmed.
- A few records apply evidence from an adjacent domain (automotive axle fatigue,
  submersible-class pressure-hull proof testing, EV battery vibration/shock standards) to
  the robotics context "by analogy," and this is stated explicitly in the record's
  `Unknown/gap` and `Notes` columns rather than presented as robot-specific fact.
- WebFetch was unavailable for external domains in this session (consistent with prior
  research sessions in this repo); all evidence was gathered via WebSearch result
  snippets, never fabricated URLs or specs.
