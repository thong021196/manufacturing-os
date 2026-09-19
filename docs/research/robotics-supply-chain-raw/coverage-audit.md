# Coverage audit — Pass 2 (issue #10)

Per-category audit of what this two-pass dataset (Pass 1: R001-R082, Pass 2: R083-R171,
171 records total) now covers, and what is still missing. Kept as bullet lists, not narrative,
per the issue's low-to-medium-effort / data-capture-over-writeup instruction.

**How to read this:** "Mapped" = at least one sourced record exists. It does not mean the
topic is exhaustively covered — see each category's "Gaps" lines for what is still thin.

## 1. Humanoid / general-purpose

- Subsystems mapped: Mechanical structure, Motion/actuator (reducer, motor, brake, driver,
  torque sensor, magnets), Perception (LiDAR), Compute (edge AI SoC, whole-body-control
  software), Power (battery), End-effector (dexterous hand — LinkerBot/AGILINK/1X/Schaeffler),
  Thermal/cooling.
- Components mapped: harmonic-drive/RV reducer, frameless servo motor, brake, driver board,
  dexterous-hand actuator (tendon/direct-drive/linkage), heat sink/liquid cooling module.
- Material/process evidence: NdFeB magnets + upstream rare-earth mining/processing
  (China ~90% processing share); die casting for joint housings.
- US: Tesla Optimus (1,000+ units deployed Jan 2026, 100k/2026 target vs. observed-production
  gap flagged), Figure (10,000+ deployments), Apptronik ($5.3B Series A).
- AU: **no industrial/warehouse humanoid deployment found** (explicit negative-evidence
  record, R083); the one real AU humanoid deployment found is aged-care companionship
  (Andromeda/Abi, 22 units/1,500 residents — a different use case, not industrial).
- China structural advantage: **strongest single record in the dataset** — Unitree + AgiBot
  ~80% of global humanoid shipments, ~90% with UBTech/Leju added (R149, TrendForce).
- Remaining unknowns: no China-vs-US/EU price comparison for any named humanoid component;
  no independent verification of Tesla's production-target claims; no AU industrial-pilot
  timeline.

## 2. AMR / warehouse / logistics

- Subsystems mapped: Motion/actuator (mecanum wheel/drivetrain module), Perception (SLAM
  software/hardware), Power (battery, charging dock).
- Components mapped: integrated wheel-motor module, SLAM localization stack, Li-ion pack,
  auto-align charging dock.
- China structural advantage: BYD >35% share of AGV/ground-handling-robot batteries;
  China-based mecanum-wheel/drivetrain suppliers (RoboCT, Hangzhou Mindong); Shanghai
  Slamtec (SLAM/LiDAR hardware).
- US: Locus Robotics (350+ sites, 4B+ picks), Amazon (750k+ robots), warehouse robotics
  market US$8.2B (2025).
- AU: **no AU-specific AMR-warehouse adoption figure located** — a specific gap.
- Remaining unknowns: no US-based mecanum-wheel/drivetrain manufacturer found (possible real
  gap or just a search-round miss — flagged, not assumed).

## 3. Cobot / industrial arm / machine tending

- Subsystems mapped: Motion/actuator (torque/force-torque sensor), Safety (ISO 10218,
  ISO/TS 15066 power-and-force-limiting), End-effector (gripper).
- Components mapped: 6-axis F/T sensor (ATI/OnRobot/Bota/Shenzhen Chengzhou/Changzhou Kunwei),
  electric/pneumatic grippers (Schunk/Festo/OnRobot/Robotiq/DESTACO).
- China structural advantage: **weak/negative finding** — no dominant China torque-sensor or
  gripper OEM identified (unlike LiDAR/battery/bearing); logged explicitly as a gap, not
  silently assumed absent.
- US: Universal Robots ~40% global share, 100k+ units; US cobot market ~US$2B (2026) — **but
  this figure materially disagrees with another US cobot-market figure from Pass 1 (R010 —
  US$133.1M vs US$653.45M) and this pass's own US$850M machine-tending-segment figure; all
  three are kept as separate, non-reconciled records** per the raw-data rule.
- AU: cobot installed base 4.6k units (2025) -> 17.4k (2034 projected); Australian Cobotics
  Centre (ARC-funded research body); SME rental pricing (A$1,000-3,000/month).
- Remaining unknowns: no China cobot-brand share of the AU or US market found.

## 4. Agriculture robot

- Subsystems mapped: Perception (machine vision/LiDAR/GNSS/RTK, academic-paper-sourced full
  value-chain), Motion (hydraulic cylinders/linear-rotary motors named but not
  supplier-mapped).
- Components mapped: GNSS/RTK receiver (Septentrio/LOCOSYS/CHC Navigation/Topcon/Unicore).
- US: Carbon Robotics (LaserWeeder), Harvest CROO (strawberry harvesting), FarmWise; US market
  US$17.73B (2025) -> US$56.26B (2030); farm-labor-shortage demand driver (2.4M open jobs,
  56% of farmers report shortages) quantified as the underlying adoption driver.
- AU: SwarmFarm Robotics, LYRO Robotics, UTS Robotics Institute, CSIRO agriculture-robotics
  partnerships — but **no AU agriculture-robot fleet-size/revenue figure located**.
- China structural advantage: **not directly evidenced for this category** in either pass —
  flagged as a real gap (agriculture robotics appears less China-concentrated than
  humanoid/AMR/LiDAR, or simply under-searched this pass).
- Remaining unknowns: no hydraulic-actuator supplier names; no China-vs-US agri-robot
  component sourcing comparison.

## 5. Inspection / field robot

- Subsystems mapped: Perception (drone gimbal/camera — DJI).
- New sub-categories added: underwater ROV/AUV (Oceaneering 22% share, Teledyne, Kongsberg,
  Saab Seaeye, Fugro); powerline/pipeline crawler inspection (US pipeline 58% robotic-inspection
  adoption, water utilities 41%).
- China structural advantage + US friction paired directly: **DJI >70% global drone/gimbal
  share, but excluded from US federal/defense programs under NDAA** — a clear,
  well-evidenced concentration+friction pair.
- AU: **no AU-specific underwater-ROV or drone-inspection adoption figure located** — flagged
  gap, notable given AU's offshore energy/marine-infrastructure base.
- Remaining unknowns: no AU pipeline/utility robotic-inspection adoption percentage; no
  crawler-robot drivetrain component supplier mapped.

## 6. Service robot

- Subsystems mapped: none component-level this pass (market/adoption-level only, both passes).
- Sub-categories deepened: healthcare/delivery (30-50% supply-delivery-time reduction),
  commercial cleaning (US$657.2M 2025 -> $3,326.6M 2033), hospitality (45%+ luxury hotels),
  sidewalk last-mile delivery (Starship 2,700+ robots/9M+ deliveries, Serve Robotics,
  Kiwibot/Robot.com, Coco Robotics), aged-care companion (Andromeda/Abi, AU, 22 units/1,500
  residents — the strongest single AU deployment record in the whole dataset).
- China structural advantage: not evidenced for this category in either pass.
- AU: aged-care companion robot is well-evidenced; **no AU sidewalk-delivery, cleaning-robot
  or hospitality-robot adoption data located** — flagged gap.
- Remaining unknowns: no component/subsystem-level (motor, sensor, compute) breakdown for any
  service-robot sub-category in either pass — this category remains adoption-level only, a
  genuine depth gap relative to the issue's Section A/B/C requirement.

## 7. Maker / hobby / education robot

- Subsystems mapped: Compute (Arduino/Raspberry Pi, KEYESTUDIO), materials (3D-printing
  filament PLA/ABS/PETG/TPU), distribution infrastructure (Digi-Key, Mouser).
- China structural advantage: China dominates global 3D-printer-filament production
  (Guangdong/Zhejiang clusters, 30-50% cost advantage claimed); KEYESTUDIO (CN) supplies
  hobbyist kit ecosystem.
- US/AU: VEX AU 200 teams (2025-26 Nationals) closes part of Pass-1 gap #2, but **still no
  AU student-count figure comparable to the US FIRST 93,000-student figure** — gap remains,
  now more precisely scoped.
- Remaining unknowns: hobby-CNC-vs-3D-printing 70/30 split (Pass-1 gap #8) is only a proxy
  (hobby-CNC-community survey, not robot-specific) — explicitly flagged as imperfect, not
  resolved.

## 8. Startup-built custom robot systems

- Subsystems mapped: none (this category is about workflow/infrastructure, not a BOM).
- Depth added: CAD-to-BOM workflow sequence, team-composition risk (solo-founder red flag),
  prototype cost bands (US$2k-30k by stage), on-demand manufacturing marketplaces
  (Xometry/Protolabs/Fictiv), accelerators (HAX — $500k/6-month residency, 50+ startups
  backed since 2024), US robotics/humanoid VC funding (US$18.8B-55.8B 2026, two disagreeing
  figures kept separate; humanoid-specific US$8.6B; US leads humanoid-startup funding at
  US$3.02B/28 startups vs. China's 26).
- AU: AU startup funding figure closed (Pass-1 gap #3) at the sector level (hardware+robotics
  +IoT A$297M, 2025) — **still not robotics-only**; **no AU-based hardware/robotics
  accelerator identified** with comparable scale to HAX.
- Remaining unknowns: Pass-1 gap #7 (2-10 person team specific cost/tooling scale) still only
  has a general (non-robotics-specific) proxy — logged as still open.

## 9. Mining / autonomous haulage robot (NEW category, added this pass)

- Added per the issue's explicit allowance for an important category beyond the named 8.
- AU: **world-leading, extremely well-evidenced** — Rio Tinto 130+ autonomous Komatsu 930E
  trucks (Pilbara), BHP Escondida fully-autonomous pit (33 trucks/11 drills, 350k t/day),
  BHP/Rio Tinto/Caterpillar battery-electric haul-truck trial (2026); "Australia is the
  undisputed world leader" per named source.
- US: no comparable US autonomous-mining-fleet scale found (mining automation in this dataset
  is AU/Chile-concentrated, not US).
- Subsystem/component/China-advantage depth: **not yet mapped** — this pass captured
  category-level adoption evidence only; a follow-up pass would need to map haul-truck
  subsystems (batteries, autonomous-control stack, sensors) if this category is pursued
  further.

## 10. Exoskeleton / wearable robot (NEW category, added this pass)

- Added per the issue's explicit allowance.
- US: well-evidenced — US$1.02B market (2026), manufacturing 68% of industrial shipments,
  NASA/Boeing/GM/Toyota (Levitate Technologies suits) named deployments.
- AU: **no AU exoskeleton data located** — flagged gap.
- Subsystem/component/China-advantage depth: not mapped this pass (adoption-level only).

## Cross-cutting subsystem coverage (all categories)

| Subsystem | Pass 1 | Pass 2 additions |
|---|---|---|
| Mechanical structure | partial | sheet-metal fab (China Pearl River Delta >70% share; US: Komaspec) |
| Motion / actuator | reducer, motor, bearing | + brake, driver, torque sensor, lubrication, shaft/fastener (**negative finding — no dedicated source, logged as gap**), electrical-steel lamination, magnet wire, mecanum wheel, encoder |
| Perception / sensor | none | + LiDAR (Hesai/RoboSense, China-dominant), machine vision (Cognex/Keyence, US/Japan-led — **no China leader found**), GNSS/RTK, drone gimbal (DJI) |
| Compute / controller | none | + edge AI SoC (NVIDIA Jetson), PLC/IPC (Siemens/Rockwell/Mitsubishi), PCB/SMT, chip fabrication (TSMC Arizona), whole-body-control software, robot-simulation software |
| Power | none | + battery pack (BYD/CATL vs. Samsung SDI/LG/Panasonic), DC-DC converter, charging dock |
| End-effector | gripper (generic) | + named gripper OEMs, humanoid dexterous hand (LinkerBot 80%+ share) |
| Communication | **not present in Pass 1** | + EtherCAT (Beckhoff/Germany), 5G/wireless (China example only — **no US/AU example found**) |
| Safety | **not present in Pass 1** | + ISO 10218-1/-2:2025, ISO/TS 15066 power-and-force-limiting |
| Thermal / cooling | **not present in Pass 1** | + heat sink/liquid cooling (China-heavy: Lori/Keli/Sanhua/Ziitek) |
| Wiring / connectors | **not present in Pass 1** | + cable/harness assembly (Molex/JST/Hirose/TE; China/Thailand/Philippines assembly) |

All four subsystems the issue names but Pass 1 did not cover (Safety, Thermal/cooling,
Communication, Wiring/connectors) are now opened with at least one sourced record each.

## US gaps (still open after both passes)

- No US robot-specific (HTS-code-level) import value/volume figure — only whole-economy
  China-import totals located; Census Bureau source identified but not queried at the
  commodity level.
- No UL/ANSI robot-certification cost figure (certifiers do not publish list pricing).
- No US-based mecanum-wheel, machine-vision-camera-leader, or GNSS-leader identified (US is
  strong in machine vision generally — Cognex/Teledyne — but not confirmed dominant in
  robotics-specific mecanum-wheel/GNSS).
- No robotics-specific breakdown of the TSMC Arizona ramp (general AI-chip data only).

## AU gaps (still open after both passes)

- **AU robot density** (IFR's headline international metric) was not disclosed in the IFR
  release located this pass — AU is absent from the named top-10-automated-economies list.
- No AU-specific AMR-warehouse, sidewalk-delivery, cleaning-robot, hospitality-robot,
  underwater-ROV, exoskeleton, or drone-inspection adoption figures.
- No AU industrial/warehouse humanoid deployment (explicit negative finding, see Category 1).
- No AU robotics-only (vs. sector-wide hardware+IoT) startup-funding figure.
- No AU-based hardware/robotics accelerator comparable to HAX.
- No primary Australian Border Force tariff-schedule citation for robotics HTS lines (only an
  aggregator source) — flagged for follow-up.

## China structural-advantage gaps (still open — i.e. NOT found, logged as negative findings)

- No dominant China supplier identified for: cobot grippers, torque/force sensors, machine
  vision cameras, EtherCAT/fieldbus chips, or power-electronics/DC-DC converters — these
  component categories appear US/EU/Japan-led based on this pass's searches, in contrast to
  the strong China concentration found in LiDAR, batteries, humanoid dexterous hands,
  humanoid OEM shipments, drones/gimbals, bearings, die casting, sheet metal, magnet wire,
  rare-earth processing and 3D-printing filament.
- Agriculture-robot and Service-robot categories have no evidenced China structural-advantage
  angle in either pass — flagged as an open question rather than assumed absent.

## Remaining `unknown`s carried forward from Pass 1 (still unresolved)

1. No source-quantified steel/stainless-steel share of robot BOMs (**re-confirmed unresolved
   this pass** — searched again, still no quantitative source; logged as R131, still `inference`).
2. No independently verified like-for-like US-vs-China price comparison for any named
   component (encoder, gripper, torque sensor, bearing, reducer) — every China-cost claim in
   both passes remains `supplier-claimed` or `low`-confidence market-report data, never a
   controlled like-for-like comparison.
3. No dedicated source for "shaft" or "fastener" as distinct robotics-market line items,
   separate from general CNC/bearing/coupling coverage (explicit negative finding, R123, this
   pass).
4. No quantitative maker/hobbyist-specific 3D-printing-vs-CNC split (only a hobby-CNC-community
   proxy located, explicitly flagged as imperfect).
5. Contradictory cobot-market-size figures (three, not two, after this pass) remain
   unreconciled per the raw-data rule.
6. Contradictory total-2026-robotics-funding figures (US$18.8B vs US$55.8B) newly identified
   this pass, kept unreconciled.

## Sanity-check against the issue's 600-1,400 record expectation

This pass added **89 new records (R083-R171)**, bringing the two-pass total to **171**. This
is materially below the issue's stated 600-1,400 sanity-check range. The issue explicitly
frames that range as "a sanity check, not a mandatory KPI," and explicitly prioritizes
*depth over row-count* ("khong dat quota chi de chay so dong"). This pass prioritized: (a)
opening all four previously-missing required subsystems (Safety, Thermal, Wiring,
Communication), (b) closing every explicitly-flagged Pass-1 gap (or re-confirming it as a
genuine, still-open gap rather than leaving it silently unaddressed), (c) adding two
material new categories (Mining/autonomous-haulage, Exoskeleton) with real evidence, and (d)
keeping every fact single-sourced and provenance-complete rather than compressing multiple
sources into fewer, denser rows. Reaching the full 600-1,400 range would require continuing
this same methodology across many more search rounds (e.g. per-category component-level
passes for Service robot, Mining, and Exoskeleton, which this pass left at adoption-level
only) — flagged here explicitly, per the issue's instruction to keep researching rather than
stop just because "enough sources" were reached, rather than silently presented as complete.
