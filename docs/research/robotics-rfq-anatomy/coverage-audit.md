# Coverage audit — robot RFQ anatomy (issue #13)

Per issue #13, section 7: a family is **not** considered "done" just because part + material +
process are known. Each of the 12 priority RFQ families is audited separately against nine
sub-dimensions: geometry/features; tolerance/GD&T; critical interfaces; finish/heat treatment;
fastening/assembly; inspection/FAI; lifecycle/revision; repeat/replacement; multi-process
behavior. A family with only part+material+process is marked **partial**, regardless of how
many records it has.

Legend: ✅ = at least one real (non-`unknown`), sourced data point · ⚠️ = only a generic/
cross-category or vendor-generalized data point (not OEM-specific) · ❌ = gap, no real source found.

## 1. Precision CNC housing (7 records: R001, R002, R003, R004, R041, R043, R044)

| Sub-dimension | Status | Note |
|---|---|---|
| Geometry/features | ✅ | Bearing bore + circular-spline seat + flange face (R001); tapered-tube joint housing (R003) |
| Tolerance/GD&T | ✅ | H7 housing bore / h6 shaft, real ISO fit numbers from Harmonic Drive catalog (R001) |
| Critical interfaces | ✅ | Circular-spline bore, output flange |
| Finish/heat treatment | ⚠️ | Hard-anodize spec found (R043) but generic, not tied to a housing part specifically |
| Fastening/assembly | ⚠️ | Only generic Helicoil spec (R039), not housing-specific |
| Inspection/FAI | ⚠️ | AS9102 standard cited generically (R041), not confirmed applied to any named housing part |
| Lifecycle/revision | ⚠️ | Only a generic "prototype-to-production" vendor claim (R036, adjacent family), nothing housing-specific |
| Repeat/replacement | ❌ | No source found |
| Multi-process behavior | ⚠️ | R002 confirms single-process (billet machining only, no casting) for one named OEM |

**Rating: partial.** Strong on geometry/tolerance thanks to one authoritative supplier-catalog
source (Harmonic Drive) and one independent OEM teardown (Unitree G1); weak-to-absent on
finish, fastening, inspection, lifecycle and repeat/replacement specific to this family.

## 2. Bracket/mount/adapter (4 records: R005, R006, R007, R008)

| Sub-dimension | Status |
|---|---|
| Geometry/features | ❌ no specific geometry found beyond "bracket around sensor" |
| Tolerance/GD&T | ✅ ±0.0005 in critical-feature claim (R005, vendor) |
| Critical interfaces | ✅ sensor mounting face, actuator mounting bracket |
| Finish/heat treatment | ❌ |
| Fastening/assembly | ❌ |
| Inspection/FAI | ✅ CMM-on-every-order claim (R005, vendor) |
| Lifecycle/revision | ❌ |
| Repeat/replacement | ❌ |
| Multi-process behavior | ❌ |

**Rating: partial**, trending toward thin. Agriculture-robot bracket evidence (R006) is
especially weak — only a generic fabricator capability page, no agriculture-robot-specific
geometry/material/process confirmed.

## 3. Welded frame/chassis (5 records: R009, R010, R011, R012, R042)

| Sub-dimension | Status |
|---|---|
| Geometry/features | ✅ laser-cut panel + weld, post-weld machining of joint interfaces |
| Tolerance/GD&T | ✅ real numeric squareness/true-position figures (R009, vendor-aggregated) |
| Critical interfaces | ✅ wheel-mount interface; torsional-stiffness case study |
| Finish/heat treatment | ✅ stress relief tied to fatigue prevention (R010) |
| Fastening/assembly | ❌ |
| Inspection/FAI | ❌ |
| Lifecycle/revision | ❌ |
| Repeat/replacement | ❌ |
| Multi-process behavior | ✅ cut→bend→weld→machine→finish sequence confirmed (R009) |
| Welding requirement | ✅ ISO 15614/WPS/PQR standard cited (R042) |

**Rating: partial.** This is the family with the single best documented **failure/rework
reason** in the whole dataset (R009's chassis-twist/sensor-misalignment design case study),
but inspection, lifecycle-stage and repeat/replacement remain unfound. **Mining/autonomous
haulage's welded-frame/chassis evidence (R011) is a near-total gap** — flagged separately below.

## 4. Sheet-metal enclosure (4 records: R013, R014, R015, R040)

**Rating: thin/gap.** Only generic vendor capability claims (R013), one weak inferential
record (R014), one explicit gap marker (R015, inspection/field robot), and one generic
fastening standard (R040). No named OEM enclosure, no confirmed material grade, no GD&T. This
is one of the two weakest-covered families in the dataset.

## 5. Gripper jaw/finger (2 records: R016, R017)

| Sub-dimension | Status |
|---|---|
| Geometry/features | ✅ wedge/parallel jaw faces, pin-pivot bores |
| Tolerance/GD&T | ✅ the richest tolerance+GD&T dataset in this entire research (±0.0005 in, 0.05 mm parallelism, wire-EDM ±0.001 in) |
| Critical interfaces | ✅ jaw-face grip contact, pin-pivot bore |
| Finish/heat treatment | ✅ 50-55 HRC hardening (A2/D2 tool steel) |
| Fastening/assembly | ❌ |
| Inspection/FAI | ❌ |
| Lifecycle/revision | ❌ |
| Repeat/replacement | ✅ interchangeable quick-change jaw sets confirmed as standard industry practice |
| Multi-process behavior | ✅ mill/turn + wire EDM + heat treat |

**Rating: deep** for a family with only 2 records — but every number comes from vendor
marketing (`supplier_marketing`), never independently verified against a named OEM. Flagged as
deep-but-unverified, not deep-and-confirmed.

## 6. Sensor/camera mount (2 records: R018, R019)

**Rating: thin/gap.** R018 confirms a camera exists and is mounted (academic paper) but gives
no mount-part material/process/tolerance. R019 is an explicit gap marker for the
inspection/field-robot (quadruped) sensor-payload-deck case. Weakest-covered family alongside
sheet-metal enclosure.

## 7. Battery/electronics enclosure (3 records: R020, R021, R022)

| Sub-dimension | Status |
|---|---|
| Geometry/features | ✅ battery pocket, PCB pocket, O-ring gland, connector cutouts |
| Tolerance/GD&T | ✅ cell-clearance ±0.1 mm, sealing-surface ±0.0005 in (vendor) |
| Critical interfaces | ✅ O-ring gland, EMI grounding pad |
| Finish/heat treatment | ✅ black anodize (bead-blasted) |
| Fastening/assembly | ✅ rubber-tipped set-screw battery clamping (R020, independent paper) |
| Inspection/FAI | ❌ |
| Lifecycle/revision | ⚠️ prototype stage only (R020) |
| Repeat/replacement | ❌ |
| Multi-process behavior | ✅ machining + anodize (R022) |

**Rating: partial-to-deep.** Best family for a real, independently-sourced, named-system part
(R020's CyberDiver 6061-T6 housing, arXiv paper) combined with vendor tolerance detail.

## 8. Joint/link (8 records: R023–R028, R039, R045)

| Sub-dimension | Status |
|---|---|
| Geometry/features | ✅ bearing bore + gearbox interface + motor mount (matches issue's own worked example almost exactly, R023) |
| Tolerance/GD&T | ✅ richest joint-specific GD&T set found (concentricity 0.0002 in, perpendicularity 0.0004 in, Ra 0.8) — vendor-claimed |
| Critical interfaces | ✅✅ **ISO 9409-1 robot-flange standard** (R026) — the single most authoritative source in the whole dataset |
| Finish/heat treatment | ⚠️ generic hard-anodize (R043), not joint-specific |
| Fastening/assembly | ✅ Helicoil (R039), threadlocker/retaining compound (R045) — both real OEM component-supplier specs |
| Inspection/FAI | ❌ no joint-specific inspection method confirmed |
| Lifecycle/revision | ⚠️ only the generic prototype-support vendor claim |
| Repeat/replacement | ❌ |
| Multi-process behavior | ✅ 5-axis continuous milling to hold multiple mating features in one setup (R023, vendor) |

**Rating: partial-to-deep** — the family with the most records and the single strongest
independent standard (ISO 9409-1), but still missing inspection method and
repeat/replacement evidence. Quadruped/inspection-robot joint evidence (R024, R025) stays at
whole-platform material level only (carbon fiber + aluminum), never broken down to individual
joint parts — flagged as a real limitation, not treated as "done."

## 9. Shaft/bearing seat/motor mount (3 records: R029, R030, R031)

**Rating: thin/gap.** R029 (humanoid) reuses the Harmonic Drive h6/H7 fit-class evidence
correctly, but R030 (cobot) is an explicit gap marker and R031 (exoskeleton) is a generic
vendor claim only. No named-OEM shaft/motor-mount drawing confirmed anywhere.

## 10. Pressure housing/sealed enclosure (3 records: R032, R033, R046)

| Sub-dimension | Status |
|---|---|
| Geometry/features | ✅ end-cap/tube housing |
| Tolerance/GD&T | ✅ ±0.025 mm / Ra 0.8 μm O-ring interface |
| Critical interfaces | ✅ O-ring face |
| Finish/heat treatment | ❌ |
| Fastening/assembly | ⚠️ generic |
| Inspection/FAI | ⚠️ generic leak-test-equipment vendor claim (R046), not confirmed applied to a named robot |
| Lifecycle/revision | ✅ prototype (open-source ROV build) |
| Failure/rework reason | ✅✅ real, documented seal failure requiring O-ring resourcing (R032) — one of only two genuine failure-mode accounts in the whole dataset |
| Repeat/replacement | ❌ |
| Multi-process behavior | ⚠️ single-process only, not confirmed multi-process |

**Rating: partial**, anchored by one strong academic source (R032) plus one independent
named-system source (R033, same CyberDiver system as R020).

## 11. Jig/fixture/EOAT structure (2 records: R034, R035)

**Rating: partial.** R034 gives real, credible flatness-tolerance numbers from
material-supplier (not sales-copy) documentation. R035 confirms the EOAT-fixture category
exists via a real US patent but gives zero manufacturing-spec detail. No inspection, lifecycle,
or repeat/replacement evidence found for this family at all.

## 12. Prototype multi-part assembly (5 records: R036, R037, R038, R047, R048)

**Rating: partial.** Strongest evidence is at the whole-platform level (R038, cross-referencing
the Unitree G1 teardown) rather than this family's own RFQ-specific fields. R047/R048 are weak
vendor-claim records for the service-robot and an unnamed humanoid program respectively;
R048's "5 prototypes in 9 days, 15% weight reduction, joint stability increased" is a real, if
unnamed-program, revision-intensity data point.

---

## Robot-type coverage summary (issue #13, section 1)

| Robot type | Records | Depth |
|---|---|---|
| Humanoid/general-purpose | 13 | **Deepest.** Only category with an independent (non-vendor) named-OEM teardown (Unitree G1) and the strongest joint/housing tolerance detail, albeit largely vendor-sourced. |
| Cobot/industrial arm/machine tending | 9 | Solid on standards (ISO 9409-1 flange, UR product-page facts) and gripper-jaw tolerance; weak on named-OEM housing/shaft detail. |
| AMR/warehouse/logistics | 7 | Solid on chassis/sheet-metal/enclosure generic tolerances and one real design-failure case study; no named-OEM part confirmed. |
| Maker/startup-built custom robot systems | 6 | **Best independent, named-system sourcing** of any category — two real arXiv papers (CyberDiver) and one build-log teardown (Mini-Cheetah clone) with real materials/tolerance. |
| Inspection/field robot | 5 | Whole-platform material facts only (ANYmal, Vision 60); zero part-level joint/sensor-mount detail — largest gap for a category with this many records. |
| Service robot | 3 | Thin. Only generic bracket/enclosure vendor claims and one unnamed hospitality-robot supplier case study; no manufacturing-spec detail at all. |
| Agriculture robot | 2 | Thin. Only generic metal-fabricator capability pages; **no agriculture-robot-specific part, material, or tolerance found anywhere in this research.** |
| Exoskeleton/wearable robot | 2 | Real named-product materials (Lockheed Martin Onyx, via a university source) but zero tolerance/process/interface detail specific to Onyx or any other named exoskeleton. |
| Mining/autonomous haulage | 1 | **Weakest category by far.** System-level deployment facts only (Komatsu, Sandvik AutoMine); zero component-level RFQ-anatomy evidence found. Recorded honestly as a gap rather than inferred from adjacent categories, per the issue's explicit instruction. |

## Most significant gaps for human review

1. **Mining/autonomous haulage** has essentially no component-level manufacturing evidence —
   worth flagging to a human reviewer whether this category should even be pursued the same
   way as the other eight, since these are OEM-built heavy vehicles rarely sourced via
   outside custom-CNC/fab RFQ channels.
2. **Sheet-metal enclosure** and **sensor/camera mount** are the two thinnest of the 12
   priority families — no named-OEM part confirmed for either, across any robot type.
3. **Inspection method and equipment** (issue fields #24–25) are the weakest-populated
   columns overall in `inspection-requirements.csv` (10 of 48 records) — CMM, bore-gauge, and
   leak/pressure-test evidence exists only as generic vendor/equipment-supplier capability
   claims, never confirmed tied to a specific robot part's actual QC process.
4. **Repeat/replacement pattern** (field #31) is populated in only a handful of records
   (gripper-jaw quick-change systems being the clearest); wear-driven repeat-RFQ behavior for
   robot parts generally remains unconfirmed by any real source found.
5. Almost all of the richest tolerance/GD&T numbers in this dataset — the ones that most
   closely match the issue's own worked example (bearing-bore concentricity, hard-anodize,
   H6/H7 fits, Ra 0.8 sealing surfaces) — trace back to **one vendor's marketing pages**
   (DakingsRapid). They are internally consistent and plausible, and are kept throughout at
   `supplier_marketing` confidence, never promoted to fact — but a human reviewer should treat
   them as directionally useful, not verified engineering truth, until corroborated
   independently.
