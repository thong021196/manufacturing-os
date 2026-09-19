# Coverage audit — custom-manufacturing RFQ research (issue #11)

65 records total (R001-R065) across the 9 named robot categories plus a
`Đa loại robot (cross-category)` tag for genuinely cross-cutting China-manufacturing-fit and
US/AU sourcing-friction signals. Per the issue's rule: **a category with only adoption data and
no custom-RFQ evidence is not done.** Every category below has at least some custom
assembly/part/material/process evidence, not just adoption numbers — but depth varies
significantly, and that is stated plainly per category rather than smoothed over.

## 1. Humanoid/general-purpose (R001-R009) — deepest category in this dataset

- **Custom assemblies mapped:** chassis/frame assembly, joint housing assembly, arm/link
  assembly, battery/electronics enclosure, torso frame (open-source research build).
- **Custom parts mapped:** mounting bracket, swing-arm link bracket, joint housing (bearing
  bore), structural link housing (cast), enclosure body (billet-machined).
- **Material/process mapped:** 7075-T6 and billet 6061/7075 aluminum, aluminum/magnesium die
  casting + CNC finish machining, 5-axis CNC, Type III hard anodize (25µm), 3D-printed
  brackets (research-stage).
- **Lifecycle/RFQ pattern mapped:** prototype→assembly-validation→production span explicitly
  claimed by one vendor (R001); die-casting volume threshold (3,000-5,000 units) gives a
  direct prototype/low-volume-vs-production process fork (R007).
- **China manufacturing-fit mapped:** named China casting supplier (Sango Automation, R008)
  with 10+ years in robot-arm gravity casting; several China-based CNC/enclosure vendors.
- **US friction:** not category-specific here (see cross-cutting US machinist-shortage rows).
- **AU friction:** **not mapped for this category specifically** — no AU humanoid
  custom-manufacturing or even AU humanoid deployment evidence was found this pass, consistent
  with the #8/#10 dataset's finding of no AU industrial/warehouse humanoid deployment at all.
- **Gap:** no numeric tolerance for the die-cast structural link beyond the one Fictiv-sourced
  row; no named end-customer for any of the China vendor claims; bearing-seat anodize/tolerance
  conflict (R006) is well-evidenced but not tied to a named humanoid program.

## 2. AMR/warehouse/logistics (R010-R014, plus R... sensor-mount row appended later batch)

- **Custom assemblies mapped:** welded chassis/frame, protective enclosure (controller/vision
  housing), custom metal tray, sensor/camera mount (LiDAR).
- **Custom parts mapped:** frame member, controller enclosure, EOAT frame, vision housing,
  sensor mounting bracket.
- **Material/process mapped:** structural steel + stainless 304/316L, laser cut + press brake
  + TIG/MIG welded + powder coat/anodize (multi-process, well-evidenced); aluminum
  6061-T6/magnesium/4140 steel for sensor mounts at ~±0.02mm.
- **Lifecycle/RFQ pattern:** production-stage/repeat implied throughout (stress-relieved
  welding for durability, build-to-print supplier relationships) but not one specific
  documented revision-cycle example the way the AMR gimbal-vibration row does for inspection
  robots.
- **China manufacturing-fit:** strong — multiple named China fabricators (ShincoFab,
  sheetmetalchina.com, DRAmetal) explicitly market AMR/AGV-specific product lines.
- **US friction:** one US-based structural-frame alternative named (McAlpin Industries) as a
  domestic comparison point; no US-specific lead-time/cost figure for AMR chassis specifically.
- **AU friction:** **not mapped for this category specifically** (see cross-cutting AU rows for
  the general 85-90% import-dependence figure, which covers AMR/mobile robots as a market
  category but not this category's custom-part RFQs by name).
- **Gap:** no revision-intensity or repeat/replacement-specific evidence for AMR chassis; no
  named AMR OEM customer for any of the China fabrication vendor claims.

## 3. Cobot/industrial arm/machine tending (R015-R020)

- **Custom assemblies mapped:** custom EOAT/gripper structure, custom fixture/jig, sensor mount.
- **Custom parts mapped:** gripper jaw/finger (richly detailed — 4 material options + 2
  tolerance classes + heat treat + coating in one row), mounting bracket, hydraulic workholding
  fixture, jig/fixture body.
- **Material/process mapped:** AL6061-T6/7075-T6, 4140 steel, 304 stainless, A2/H13 tool steel,
  TiN coating; CNC machining + heat treatment + coating (genuinely multi-process, well-sourced).
- **Lifecycle/RFQ pattern:** implied iterative/application-specific design ("specialized gripper
  jaws...from simple to complex") but no explicit prototype→production example is documented.
- **China manufacturing-fit:** **not mapped for this category specifically** — every EOAT/gripper
  vendor found this pass was US-based (EMI Corp, eoatmachining.com, RivCut). This is logged as a
  genuine gap/open question, not assumed to mean China lacks this capability (consistent with
  the #8/#10 dataset's similar negative finding for cobot torque sensors/grippers).
- **US friction:** not category-specific (see cross-cutting rows).
- **AU friction:** not mapped.
- **Gap:** China-side EOAT/fixture manufacturing capability specifically is unverified this
  pass — flagged for a follow-up search round rather than silently assumed either way.

## 4. Agriculture robot (R021-R025, plus SwarmFarm AU row appended later batch)

- **Custom assemblies mapped:** mounting bracket/adapter assembly, custom EOAT/gripper
  (harvesting end-effector), chassis/frame (SwarmFarm, AU-specific).
- **Custom parts mapped:** bracket/bushing/plate/adapter, vacuum-gripper+cutting-blade
  end-effector, soft-gripper finger (dual-material), avocado end-effector (title-level only).
- **Material/process mapped:** aluminum/steel/brass/plastics brackets at up to ±0.005mm; 3D
  printing + silicone molding for soft grippers (genuinely multi-process, multi-material).
- **Lifecycle/RFQ pattern:** "repairs" explicitly named as a business line for ag-equipment
  parts (repeat/replacement signal); harvesting end-effectors are research/prototype-stage in
  every academic source found, not yet shown at commercial-production stage.
- **China manufacturing-fit:** one general robotics-bracket vendor (Beska, China) marketed
  specifically at "robotic arms and automation systems" — not ag-specific by name.
- **US friction:** not category-specific.
- **AU friction:** **well-anchored** — SwarmFarm Robotics, a real, named, 200+-unit AU
  manufacturer with its own Toowoomba factory and a named electrical-manufacturing supplier
  relationship (Harness Master NSW). This is one of the strongest single AU-domestic-manufacturing
  records in the whole dataset, though it describes SwarmFarm's own in-house build rather than
  an outsourced custom-part RFQ pattern.
- **Gap:** no chassis material/welding-vs-machining detail for SwarmFarm itself; no commercial
  (non-research) harvesting end-effector manufacturing example found; no China-specific
  ag-robot-part evidence (flagged, not assumed).

## 5. Inspection/field robot (R026-R030)

- **Custom assemblies mapped:** protective enclosure (ROV pressure housing — richly evidenced),
  sensor/camera mount (drone gimbal — two strong case-study rows including a documented
  tolerance-tightening revision cycle).
- **Custom parts mapped:** pressure-housing tube/end cap, gimbal motor mount.
- **Material/process mapped:** aluminum 6061-T6/7075-T6 (shallow ROV) vs. titanium Grade 5
  (deep ROV), 5-axis CNC, O-ring-interface tight tolerance even on otherwise loose parts —
  one of the most technically detailed rows in the dataset (R029).
- **Lifecycle/RFQ pattern:** **best-documented revision-intensity example in the entire
  dataset** — R030's gimbal-motor-mount case study shows a field failure (image blur) traced to
  a 0.06mm flatness error, resolved by tightening the spec to ≤0.01mm, i.e. a concrete
  spec-revision cycle driven by a real failure mode.
- **China manufacturing-fit:** strong — WayKen (ROV housings) and CNCTAL/BJMK (titanium subsea
  housings, UAV gimbal parts) all explicitly market this exact niche, including a 100%
  dimensional-inspection export-QC claim (R030).
- **US friction / AU friction:** **not mapped for this category** — no US or AU-specific
  cost/lead-time friction evidence for ROV housings or drone gimbals was found this pass. This
  is a real, notable gap given the #8/#10 dataset also flagged AU as having no
  underwater-ROV/drone-inspection adoption figure at all.
- **Gap:** US/AU friction entirely open for this category; no named AU inspection-robot
  manufacturer or integrator found.

## 6. Service robot (R031-R035, plus two Diligent/Aethon rows appended later batch)

- **Custom assemblies mapped:** custom EOAT/gripper (Moxi's 2-finger gripper + 7DOF arm),
  chassis/frame (TUG, Starship-adjacent), protective enclosure (sheet-metal robot housing,
  general).
- **Custom parts mapped:** two-finger gripper, arm structure, mobile-base chassis, frame/body
  structure — all named at the assembly level for real, named US companies (Diligent
  Robotics/Moxi, Aethon/TUG), but **no manufacturing process, material, or tolerance detail was
  found for any of them** despite dedicated search this pass.
- **Lifecycle/RFQ pattern:** real revision-cycle evidence exists at the product level (Moxi →
  Moxi 2.0, shipping 2026 H1) but not at the custom-part level.
- **China manufacturing-fit:** one China ODM/custom-manufacturer found (Ningbo Reeman) for
  commercial cleaning robots, but this is whole-robot ODM, not a decomposed custom-part example.
- **US/AU friction:** not mapped for this category specifically.
- **Gap — flagged explicitly per the issue's rule:** this category still leans toward
  "adoption/product-level" evidence rather than fully decomposed custom-manufacturing-RFQ
  evidence. The named products (Moxi, TUG, Starship) are real and well-documented at the
  product level, but their chassis/gripper/enclosure manufacturing process, material, and
  tolerance are not disclosed in any source found this pass. This is the category where the
  gap between "adoption evidence" and "true RFQ-shape evidence" is most visible, and is called
  out here rather than allowed to read as complete.

## 7. Mining/autonomous haulage (R036-R039, plus battery-electric-trial row appended later batch)

- **Custom assemblies mapped:** retrofit kit (named, fleet-scale: 29 units at Brockman 4; 19
  Caterpillar-conversion units at Marandoo), sensor/camera mount (LiDAR/radar retrofit support
  structure, general autonomous-heavy-vehicle pattern applied to mining by direct relevance).
- **Custom parts mapped:** **not mapped at the individual-part level** — every mining source
  found this pass describes the retrofit kit or the battery-electric trial at the
  program/fleet level (how many trucks, which mine, how many hours tested), never itemizing the
  specific brackets, mounts, or enclosures inside the kit.
- **Material/process mapped:** not mapped for this category.
- **Lifecycle/RFQ pattern:** well-evidenced at the fleet/pilot level — AHS retrofit is
  production/fleet-scale (real named programs, real unit counts), while the BHP/Rio
  Tinto/Caterpillar battery-electric haul truck is explicitly pilot-stage ("Early Learner," 2
  trucks, US proving-ground validation before AU field trial).
- **China manufacturing-fit:** **not mapped.**
- **US/AU friction:** **not mapped** — this category's evidence is entirely about the mining
  companies' own fleet programs, not about a sourcing-friction pain point for the retrofit
  hardware itself.
- **Gap — flagged explicitly:** this is the category with the widest gap between "real,
  well-documented adoption/program evidence" (which is strong — Rio Tinto/BHP/Caterpillar are
  named, dated, with real unit counts) and "custom-manufacturing RFQ evidence" (which is
  essentially absent below the program level). Per the issue's rule, this category is **not
  treated as done** — it needs a follow-up pass specifically searching for the retrofit-kit
  bill-of-materials or a mining-equipment fabrication shop's marketing material, neither of
  which surfaced in this pass's search terms.

## 8. Exoskeleton/wearable robot (R040-R041, plus Ekso Bionics + Sarcos rows appended later)

- **Custom assemblies mapped:** joint housing assembly, load-bearing frame, custom fit
  bracket/task-specific attachment (Sarcos Guardian XO alpha units).
- **Custom parts mapped:** housing, stator mount, frame member, bolt-on extruded-aluminum
  attachment.
- **Material/process mapped:** AL6061-T6 (most common per WayKen), titanium alloys, CNC
  milling/turning/EDM/grinding for stress-concentration points; Ekso Bionics' flagship suit
  named as a 50lb aluminum-and-titanium build (real, named, long-running US product).
- **Lifecycle/RFQ pattern:** genuine lifecycle-stage → process-decision evidence — Sarcos
  explicitly traded full custom machining for simpler bolt-on extrusions at the "alpha" stage
  specifically to control cost/complexity (R062-equivalent row), a rare direct example of the
  issue's required "lifecycle stage → process choice" link.
- **China manufacturing-fit:** WayKen (China) has a dedicated exoskeleton case-study/blog
  presence, indicating real China capability depth in this niche, though the case study's full
  content (customer, volumes) was not extracted this pass.
- **US/AU friction:** not mapped for this category specifically.
- **Gap:** no AU exoskeleton evidence at all (consistent with the #8/#10 dataset's same
  finding); no numeric tolerance for any exoskeleton part; WayKen case study needs a follow-up
  deep-read.

## 9. Maker/startup-built custom robot systems (R042-R045)

- **This category is about workflow/infrastructure, not a decomposed BOM**, consistent with
  how the #8/#10 dataset also treated it — so "custom assembly/part" columns are frequently
  `n/a` for these rows by design, and that is not treated as a gap in itself.
- **RFQ-workflow evidence mapped:** CAD→RFQ best practices (STEP format, revision-grouping to
  avoid mixed-revision packages — a direct, named RFQ-quality failure mode), 1-3 design
  iterations before production approval treated as normal, 24-hour ECN turnkey quoting.
  **HEBI Robotics** (R045-equivalent) is the strongest single record: a real, named, independently-
  verifiable robotics company, a concrete six-figure lost-sales friction number, and an explicit
  multi-process (CNC + gear hobbing + MJF + injection molding) 14,500-part production order.
- **US friction:** well-evidenced — prototype quoting/iteration/coordination delays explicitly
  named as the dominant lead-time driver (not raw machining time).
- **China manufacturing-fit / AU friction:** **not mapped for this category specifically.**
- **Gap:** no AU-based startup/maker example found (consistent with the #8/#10 dataset's
  similarly-flagged gap: "no AU-based hardware/robotics accelerator comparable to HAX").

## Cross-cutting records (Đa loại robot / cross-category, R046-R065-equivalent range)

These 15 records are genuinely not tied to one robot type — they answer the issue's China
manufacturing-fit and US/AU sourcing-friction questions at the capability/labor-market level
(Shenzhen/Dongguan cluster depth and cost claims, China export-QC staged-inspection process,
material-certificate/traceability practice, a named AU CNC shop serving "industrial robot
systems," US CNC-machinist shortage statistics, US-China tariff figures, AU import-dependence
and robot-density figures, AU customs/TCO process, and general MRO/spare-part replacement
practice). They are the backbone evidence for columns 16-17 (China fit / US-AU friction) that
individual per-category rows often could not fill on their own — see each category section
above for where a category-specific China-fit or friction row is explicitly marked "not
mapped," meaning the reader should look here instead.

## Overall gaps for the human reviewer (most significant, in priority order)

1. **Mining/autonomous haulage has essentially no custom-part-level evidence** — the strongest
   program-level evidence in the dataset (real companies, real unit counts, real dates) but the
   weakest RFQ-shape evidence. Needs a dedicated follow-up pass.
2. **Service robot custom-part manufacturing detail (material/process/tolerance) is missing**
   even though the products themselves (Moxi, TUG) are real, named, and well-documented at the
   product level. This is the clearest case in the dataset of "adoption-level but not yet
   RFQ-level" per the issue's own definition of incomplete.
3. **No AU-specific evidence** for: humanoid, inspection/field robot, exoskeleton, cobot/EOAT,
   or mining custom-part sourcing friction. SwarmFarm (agriculture) is the one strong AU-domestic
   manufacturing anchor in the whole dataset; Robycs Technology (Sydney CNC shop serving
   "industrial robot systems") is the other. AU coverage overall is thin relative to US.
4. **China-fit evidence for cobot/EOAT and gripper components specifically was not found** —
   every EOAT vendor located this pass was US-based; this mirrors a similar negative finding in
   the #8/#10 dataset for cobot grippers/torque sensors and should not be assumed to mean China
   lacks this capability, only that this pass's searches did not surface it.
5. **Vendor-claim density is high.** The majority of manufacturing-process, material, and
   China-fit rows are sourced to the manufacturer/vendor's own marketing or technical-blog
   content, because that is where this kind of process/tolerance detail is actually published.
   These are consistently marked `low`/`medium` confidence and `Source type` = vendor, per the
   issue's instruction not to convert vendor claims into independent fact — but a human
   reviewer should weight them accordingly, especially the numeric cost/percentage claims
   (e.g. "30-60% lower labor cost in Guangdong").
6. **WebFetch was blocked for every domain attempted** in this session (fictiv.com,
   carrmachine.com specifically tested and blocked), so all evidence in this dataset comes from
   WebSearch's own retrieved-and-summarized page content rather than a full raw-page read. Where
   a source (e.g. the Fictiv robotic-arm-components guide, or the HEBI Robotics case study) looked
   like it likely contained more detail than what WebSearch surfaced, that is noted per-row as a
   "gap"/follow-up flag rather than filled in with unlisted detail.

## Sanity check against dataset size

65 records is smaller than the #8/#10 dataset (171 records), by design: that dataset covered a
broad subsystem/component/China-advantage/friction chain across many more component types
(perception, compute, power, communication, safety, thermal, etc.), while this dataset is
scoped narrowly to custom-manufacturing-relevant assemblies/parts only, per the issue's explicit
instruction not to research "broad robot teardown/BOM for its own sake." Within that narrower
scope, this pass prioritized (a) real, independently-checkable sources over volume, (b) at
least one assembly + one part + one material/process record per category, and (c) explicitly
naming every category/column combination where evidence was *not* found, rather than leaving
gaps implicit. Reaching greater depth — especially for Mining, Service robot, and Cobot/EOAT
China-fit — would require further dedicated search passes, flagged above rather than silently
presented as complete.
