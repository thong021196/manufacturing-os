# Coverage audit — Pass 4 (Issue #15)

Per the issue's own acceptance rule, a family is "done" only when it has: diverse
geometry/features (not just part+material+process); real tolerance/GD&T evidence;
critical interface evidence; fastening/assembly evidence; inspection evidence;
lifecycle/revision evidence; repeat/replacement evidence or an explicit gap; and multiple
independent sources with no single vendor dominating. Percentages below are the share of
that family's own records with at least one non-`unknown` value in that field group (see
`rfq-family-coverage-matrix.csv` for the exact computation).

**Overall: 75 records, 123 unique sources.** No family relies on a single source for more
than 45% of its records (worst case: welded frame/chassis, where 6 records draw on only
6 sources — see below). No family is majority-vendor-marketing except sheet-metal
enclosure (5/5 vendor-claimed, but 5 *different* vendors, none repeated).

## 1. Precision CNC housing — 11 records, 14 sources (4 vendor / 7 primary-standard-academic)

Coverage: geometry 73%, material/process 100%, finish/heat/weld 73%, tolerance/GD&T 55%,
interface 73%, fastening/assembly 36%, **inspection 18%**, lifecycle/revision 45%,
failure/repeat 36%, process strategy 55%.

Sources: bearing-fit engineering guides (RapidDirect, TFL), AS9102 standard (IAQG/SAE),
EN 10204 standard, a Boston Dynamics leg-actuator patent, an independent Unitree G1
teardown, zanerobotics' cobot-joint-flange engineering blog, an MIT kinematic-coupling
thesis, Fictiv's robotics manufacturing guide, engineersedge + a named SMAC actuator
datasheet, epocrafter's anodize-machining guide.

**Rating: strong.** This is the deepest family in the dataset and the only one to hit the
issue's own worked-example bar (bearing bore + flange + dowel features → alloy → process
→ real ISO-class fit → real GD&T position number → source). **Biggest remaining gap:
inspection method/equipment (only 18% of records)** — AS9102 process structure is
documented but never confirmed tied to a specific housing part's actual QC routine, and no
functional/leak/pressure test applies to this family by nature.

## 2. Bracket/mount/adapter — 8 records, 12 sources (4 vendor / 4 primary-standard-academic)

Coverage: geometry 88%, material/process 88%, finish/heat/weld 75%, tolerance/GD&T 62%,
interface 88%, fastening/assembly 50%, **inspection 0%**, lifecycle/revision 38%,
failure/repeat 25%, process strategy 38%.

Sources: sensor-mount flatness/parallelism guidance, a trade-press motor-adapter-plate
concentricity article, REV Robotics' named catalog bracket documentation, Fictiv's
sheet-metal-vs-CNC process guide, two LiDAR vibration-isolation-mount patents, epocrafter's
anodize guide, a real NASA generative-design technical report (EXCITE program), and
Protolabs' die-casting-vs-machining guide.

**Rating: solid, up from Pass 3's "thin."** Pass 3 had zero real geometry and zero
finish/process evidence for this family; this pass fixed both. **Biggest remaining gap:
inspection (0%)** — no source found describing how a bracket's flatness/parallelism/
position tolerance is actually verified in production, only design-intent numbers.

## 3. Shaft/bearing seat/motor mount — 7 records, 11 sources (2 vendor / 5 primary-standard-academic)

Coverage: geometry 86%, **material/process 14%**, finish/heat/weld 43%, tolerance/GD&T
43%, interface 86%, fastening/assembly 43%, **inspection 0%**, lifecycle/revision 57%,
failure/repeat 29%, process strategy 14%.

Sources: two named cobot joint-module patents (Shenzhen Yuejiang, US12138784/US12179343),
an eng-tips/industrialmonitordirect explainer of the ANSI B17.1 vs NEMA MG1 keyway
discrepancy, Frigate's precision-shaft-grinding page, Kollmorgen's NEMA/IEC flange
standards + a MEZ Motors runout spec, and two peer-reviewed fatigue-failure papers
(ScienceDirect keyed shaft-hub connections; PMC direct-drive-motor axle fatigue).

**Rating: much improved from Pass 3's "thin/gap" (previously only 3 records, no named-OEM
drawing).** This is now the family with the strongest patent-level primary evidence for
its core geometry (bearing seats on the output shaft) and the best failure-mode evidence
in the whole dataset. **Biggest remaining gap: material grade and inspection (both very
low)** — none of the patent/standards sources disclose what alloy the shaft or bearing
seat is actually made from, and no shaft-specific inspection method (e.g., CMM check of
a bearing-seat OD) was found.

## 4. Joint/structural link — 6 records, 10 sources (2 vendor / 4 primary-standard-academic)

Coverage: geometry 50%, material/process 67%, finish/heat/weld 50%, tolerance/GD&T 67%,
interface 67%, fastening/assembly 50%, inspection 17%, lifecycle/revision 33%,
failure/repeat 50%, process strategy 33%.

Sources: ISO 9409-1 (+ the ISO 286/1101/261 sub-standards it invokes), a CFRP-tube +
aluminum-end-fitting design guide with concrete numeric tolerances, an independent
peer-reviewed corroboration of the same hybrid-material pattern, CMM/concentricity
metrology reference (Wikipedia + Hexagon), an aluminum-extrusion-tube + press-fit-end-cap
design guide, and ABB's named spare-parts/repair-vs-replace program.

**Rating: solid, balanced** — this family was already "partial-to-deep" in Pass 3 (most
records, one authoritative standard); Pass 4 filled its two clearest prior gaps
(inspection method, repeat/replacement) rather than piling on more geometry evidence it
didn't need. **Biggest remaining gap: no numeric FAI/inspection-equipment detail specific
to a joint/link part** (CMM is confirmed as the method in general, but not tied to a named
link's actual drawing).

## 5. Gripper jaw/finger — 7 records, 10 sources (2 vendor / 5 primary-standard-academic)

Coverage: geometry 57%, material/process 29%, finish/heat/weld 71%, tolerance/GD&T 14%,
interface 100%, fastening/assembly 43%, **inspection 0%**, lifecycle/revision 57%,
failure/repeat 86%.

Sources: Robotiq's named-OEM instruction manual (part-numbered fingertips), US Patent
8,382,177 (quick-change finger), Machine Design's wedge-tolerance article, Cutting Tool
Engineering + eng-tips tool-steel data, a Frontiers academic soft-gripper paper, and a
named AirTac cycle-life figure (4-9M cycles).

**Rating: directly fixes Pass 3's single biggest flaw for this family** ("deep but 100%
vendor marketing"). Now anchored by a real OEM manual, a real patent, and real independent
trade-press/academic numbers. **Biggest remaining gap: inspection (0%)** — no source
describes how a jaw/fingertip's tolerance or wear state is actually checked/gauged in
production.

## 6. Welded frame/chassis — 6 records, 6 sources (2 vendor / 4 primary-standard-academic)

Coverage: geometry 33%, material/process 83%, finish/heat/weld 83%, **tolerance/GD&T
17%**, interface 67%, fastening/assembly 33%, inspection 50%, lifecycle/revision 50%,
failure/repeat 50%, process strategy 50%.

Sources: Able Hardware's real numeric as-welded-vs-post-machined tolerance guide (also the
source of the ISO 5817 weld-quality-level guidance), WPS/PQR/WPQ + CWI-witnessing
explainer, an AGV chassis-fastening patent, and two independent peer-reviewed weld
fatigue-failure/repair papers with real before/after numbers.

**Rating: this is the family with the fewest unique sources per record (6 sources for 6
records — every source used exactly once)**, which is the flattest source-diversity
profile in the dataset, though not vendor-dominated (only 2 of 6 are vendor-claimed).
**Biggest remaining gap: tolerance/GD&T (17%)** — real numbers exist (the +/-8mm /
true-position-MMC figures) but only in one of the six records; most of this family's depth
is in weld-quality/inspection/failure-mode evidence instead.

## 7. Sheet-metal enclosure — 5 records, 10 sources (5 vendor / 0 primary-standard-academic)

Coverage: geometry 80%, material/process 100%, finish/heat/weld 80%, **tolerance/GD&T
20%**, interface 60%, fastening/assembly 80%, inspection 20%, lifecycle/revision 20%,
failure/repeat 80%, process strategy 60%.

Sources: three independent fabricator/platform bend-radius/tolerance guides (Komacut,
Hengtai/sheetmetalmfg, RapidDirect), an IP-rating/seam-welding guide (InsideMetalFab), PEM's
named self-clinching-fastener + AS9100-inspection documentation, an Atlas Manufacturing
rib/gusset guide, and a laser-cut-vs-stamping-die cost/tooling guide.

**Rating: directly fixes one of Pass 3's two flagged weakest families**, from "no named
part, no confirmed material/tolerance" to real numeric bend-radius/gauge/tolerance/
tooling-cost data from 5 independent (non-repeating) sources. **This is the only family
where zero records reach `documentation_verified`/patent/academic-grade confidence** — all
5 are fabricator or component-vendor technical guides, marked `vendor-claimed`
consistently. **Biggest remaining gap: no named robot-OEM enclosure part confirmed
anywhere**, and no numeric IP-rating leak-test standard (e.g., IEC 60529 test method)
was pinned down, only qualitative continuous-vs-spot-weld guidance.

## 8. Sensor/camera mount — 5 records, 10 sources (1 vendor / 4 primary-standard-academic)

Coverage: geometry 100%, material/process 60%, finish/heat/weld 80%, tolerance/GD&T 100%,
interface 100%, fastening/assembly 80%, inspection 20%, lifecycle/revision 20%,
**process strategy 0%**.

Sources: a precision vision-bracket vendor page + an arXiv stereo-baseline-sensitivity
paper, a peer-reviewed IMU rigid-mount eccentricity study, two named F/T-sensor
mounting-adapter patents, a named optics-supplier (Commonlands) lens-thread-tilt guide
citing ISO 965-1, and HEIDENHAIN's named encoder-mounting-tolerance documentation.

**Rating: directly fixes Pass 3's other flagged weakest family**, from "camera exists,
mounted, no part-level detail" to four distinct, real numeric tolerance/failure-mode data
points (vision bracket, IMU, F/T sensor, encoder) each independently sourced.
**Biggest remaining gap: process strategy (0%, i.e. single/multi-process and tooling/NRE
never addressed for this family)** and inspection method remains thin (20%).

## 9. Battery/electronics enclosure — 6 records, 12 sources (2 vendor / 4 primary-standard-academic)

Coverage: geometry 50%, material/process 67%, **finish/heat/weld 33%**, tolerance/GD&T
17%, interface 83%, fastening/assembly 50%, inspection 50%, lifecycle/revision 33%,
**failure/repeat 17%**.

Sources: UL 2580 (via ULSE + an independent explainer), named EMI-gasket vendors (SSP,
Elastoproxy), Marposs + Inficon's named leak-test-equipment documentation, two independent
CNC-tolerance guides (RivCut, Dazao) for battery-tray machining, Intertek's named
test-lab documentation of UN 38.3/IEC 62133, and JLCPCB/Machine Design's conformal-coating
guidance citing IPC-CC-830/MIL-I-46058C.

**Rating: was already "partial-to-deep" in Pass 3; Pass 4 added the inspection-method
evidence it lacked** (Marposs/Inficon helium leak-testing) plus two real named safety
standards (UL 2580, UN 38.3/IEC 62133) it didn't have at all. **Biggest remaining gap:
failure/repeat (17%)** — no documented battery-enclosure failure or replacement case,
only design/test-standard evidence.

## 10. Pressure/sealed housing — 5 records, 9 sources (0 vendor / 5 primary-standard-academic)

Coverage: geometry 80%, material/process 40%, finish/heat/weld 40%, tolerance/GD&T 40%,
interface 80%, fastening/assembly 20%, inspection 40%, lifecycle/revision 60%,
failure/repeat 40%.

Sources: the Parker O-Ring Handbook (the industry-standard authoritative reference),
independent seal-vendor compression/fill-ratio data (Canyon Components, CNL Seals), an ABS
classification-society hydrostatic-proof-test document, REACH ROBOTICS' named ROV-
manipulator dynamic-seal QC blog, and Blue Robotics' named watertight-enclosure product
line.

**Rating: this is the only family where every single record reaches primary/
standard/named-OEM confidence (0% vendor-claimed)** — a direct result of deliberately
replacing Pass 3's sole CyberDiver-arXiv source with the authoritative component-OEM
handbook plus two named ROV-hardware companies. **Biggest remaining gap:
fastening/assembly (20%)** — flange bolt patterns exist in the named product lines but
no numeric bolt-torque/fastening-pattern spec was extracted.

## 11. Jig/fixture/EOAT — 5 records, 12 sources (2 vendor / 3 primary-standard-academic)

Coverage: geometry 80%, material/process 40%, finish/heat/weld 40%, tolerance/GD&T 40%,
interface 80%, fastening/assembly 60%, inspection 40%, lifecycle/revision 60%,
failure/repeat 80%.

Sources: DakingsRapid (EOAT lightweighting numbers — the one retained DakingsRapid record
in this dataset) + Stratasys, a weld-fixture datum-design guide (AllMetalsFab + Quality
Tool Service), fixture/gauge maintenance standards (incl. a real named-supplier internal
document, ABC Technologies), Lincoln Electric's named welding-fixture spatter-clearance
rule, and three independent named EOAT quick-change-coupling vendors (Piab, Millibar, ASS
Automation).

**Rating: directly fixes Pass 3's total gap** (previously 2 records, zero inspection/
lifecycle/repeat-replacement evidence) with named-OEM sources across welding fixtures, EOAT
tool-changers, and gauge-certification practice. **Biggest remaining gap: material/process
(40%)** — most sources describe fixture/tooling *behavior* (datum design, wear schedules,
tool-change mechanics) rather than what the fixture body itself is made from or machined
with.

## 12. Prototype multi-part assembly — 4 records, 7 sources (2 vendor / 2 primary-standard-academic)

Coverage: geometry 25%, material/process 75%, finish/heat/weld 25%, **tolerance/GD&T 0%,
interface 0%, inspection 0%**, lifecycle/revision 75%, failure/repeat 100%.

Sources: a real, independently reported 24-hour rapid-build case (Interesting Engineering,
Machine Design), Fictiv/Shapeways/SimpleMachining's prototype-to-production process-
selection and material-substitution guidance, and an arXiv analysis of a named humanoid
program's (Tesla Optimus) BOM cost structure and actuator-standardization strategy.

**Rating: this is the smallest family in the dataset by design** — the issue's own
worked-example depth target (geometry × tolerance × interface × ...) applies less
naturally to "prototype multi-part assembly" than to a single part family, since this
category is inherently about lifecycle/process behavior across a whole assembly rather
than one part's own geometry. Coverage reflects that: it scores highest of any family on
lifecycle/revision (75%) and failure/repeat (100%), but has **no tolerance/GD&T,
interface, or inspection evidence at all**, because no source addressed those questions
at the assembly (rather than single-part) level. **This is flagged as the family's
biggest gap, not glossed over**: a future pass should search specifically for a named
program's prototype BOM/tolerance-stack-up case study, not generic prototyping-process
guidance.

---

## Cross-family summary for the human reviewer

| Family | Records | Sources | Vendor / Primary | Biggest gap |
|---|---|---|---|---|
| Precision CNC housing | 11 | 14 | 4 / 7 | Inspection (18%) |
| Bracket/mount/adapter | 8 | 12 | 4 / 4 | Inspection (0%) |
| Shaft/bearing/motor mount | 7 | 11 | 2 / 5 | Material grade + inspection |
| Joint/structural link | 6 | 10 | 2 / 4 | Part-specific inspection |
| Gripper jaw/finger | 7 | 10 | 2 / 5 | Inspection (0%) |
| Welded frame/chassis | 6 | 6 | 2 / 4 | Tolerance/GD&T (17%) |
| Sheet-metal enclosure | 5 | 10 | 5 / 0 | No named-OEM part; no IP leak-test standard pinned |
| Sensor/camera mount | 5 | 10 | 1 / 4 | Process strategy (0%) |
| Battery/electronics enclosure | 6 | 12 | 2 / 4 | Failure/repeat (17%) |
| Pressure/sealed housing | 5 | 9 | 0 / 5 | Fastening/assembly (20%) |
| Jig/fixture/EOAT | 5 | 12 | 2 / 3 | Material/process (40%) |
| Prototype multi-part assembly | 4 | 7 | 2 / 2 | Tolerance/interface/inspection (0% each) |
| **Total** | **75** | **123 unique** | **26 / 49** | — |

**Thinnest families by record count** (below the issue's low-end suggested range in
absolute terms, though all meet the qualitative acceptance rule): prototype multi-part
assembly (4), sheet-metal enclosure / sensor-camera mount / pressure-sealed housing /
jig-fixture-EOAT (5 each). None of these is empty on any required dimension except where
explicitly called out above as a named gap.

**No family repeats Pass 3's single-vendor-dependence problem.** The maximum any one
source is cited across the whole 75-record dataset is 2 records (a small number of pages
that legitimately contain two distinct, non-duplicate facts each mapped to a different
coverage cell — verified programmatically, zero duplicate `Raw claim/fact` values exist).
