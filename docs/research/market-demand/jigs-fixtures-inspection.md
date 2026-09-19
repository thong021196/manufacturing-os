# Jigs, Fixtures & Inspection Fixtures

Covers: machining fixtures, welding fixtures, assembly/check fixtures, CMM/inspection fixtures,
turnkey tooling systems.

See `README.md` for the source-type/confidence legend and the four-demand-layers framing.

## Market segments / buyer types

- Manufacturers needing custom check/welding/turnkey fixtures across multiple industries —
  Mahuta Tool explicitly names "check fixtures, welding fixtures, turnkey fixtures, and jig
  services" as its product line (`supplier_marketing`, `medium`, captured 2026-09-19,
  <https://www.mahutatool.com/Tooling/JigFixtureMachining>).
- Cross-industry buyers specifically in automotive, medical, and mining, per MD Design &
  Automation's stated client industries (`supplier_marketing`, `medium`,
  <https://www.mddesignwi.com/jigs-and-fixturemanufacturing.html>) — notably mining is also a
  named strength of Australian robotics/automation adoption (see `cnc-sheet-metal-general.md`),
  a plausible but unconfirmed cross-market link.
  (`ai_inferred`, `low` — this specific US/AU industry-overlap connection is our own
  inference, not stated by any source.)
- Buyers needing full turnkey tooling design-through-build, not just fabrication to a drawing —
  KTM Solutions explicitly describes designing and implementing "cobot inspection and assembly
  cells tailored to specific manufacturing requirements," directly linking fixture-building to
  cobot/robotics integration work (`supplier_marketing`, `medium`,
  <https://www.ktmsolutions.com/manufacturing-fixturing-tooling>).
- High-precision/regulated-industry buyers (automotive, aerospace, heavy equipment, military,
  alternative energy) needing 5-axis CNC and metrology-verified custom tooling, per PJF Inc.
  (`supplier_marketing`, `medium`, <https://www.pjfinc.com/>).

## Search queries + intent (qualitative — no real volume data)

| Query pattern | Likely intent | Reasoning |
|---|---|---|
| "custom inspection fixture quote" / "check fixture manufacturer" | transactional | Matches multiple suppliers' page titles directly (`ai_inferred`, `low`). |
| "welding fixture design" | commercial/transactional | Matches Mahuta Tool's named service line. |
| "cobot inspection cell fixture" | commercial | Matches KTM Solutions' explicit cobot-fixture framing — a robotics-specific fixture query rather than generic tooling (`ai_inferred`, `medium`, given how specific/niche the phrase is). |
| "jig and fixture design company near me" | commercial | Implied by ThomasNet's directory-style listing pattern for "Jigs & Fixture Design & Fabrication Suppliers," which is itself evidence of location-based buyer search behavior (`documentation_verified`, `medium`, captured 2026-09-19, <https://www.thomasnet.com/suppliers/usa/jigs-fixture-design-fabrication-41560509>). |

## Recurring engineering problems

- **Design-through-build-through-metrology as one coupled problem**, not a simple
  machine-to-drawing job: several sources explicitly frame their value proposition as owning
  "design, build and inspection... done in-house" (`supplier_marketing`, `medium`, PJF Inc.), and
  KTM Solutions frames fixture work as inseparable from the cell/process it serves (cobot
  inspection/assembly cells).
- **Tight tolerance combined with fast turnaround as a stated differentiator**: one source states
  ±0.005 mm achievable with a 3-week delivery window for custom CNC/welding/inspection fixtures
  (`supplier_marketing`, `low`, aggregated via WebSearch — see `README.md` limitation 3a on
  blended source attribution).
- **Fixtures as infrastructure for a robot cell, not a standalone product** — the explicit
  cobot-inspection-cell framing (KTM Solutions) suggests jig/fixture demand in the robotics
  segment is often triggered by a robot-cell deployment, not purchased independently
  (`ai_inferred`, `medium` — inferred from that one source's framing, not independently
  corroborated).

## Common materials

- No jig/fixture-specific material breakdown was found in this pass (sources focused on process
  and precision claims, not material lists). By analogy with the rest of the wedge (aluminum
  6061/7075 for machined structural components, steel for higher-load/wear tooling elements),
  a similar material mix is plausible but **not directly evidenced** for this cluster
  (`ai_inferred`, `low`). **Flagged as a gap** — a dedicated follow-up search on fixture-plate
  and tooling-pin materials would sharpen this.

## Common processes

- CNC machining (including 5-axis per PJF Inc.), jig grinding, and CNC grinding are named
  specifically for this category (`supplier_marketing`, `medium`,
  <https://www.mddesignwi.com/jigs-and-fixturemanufacturing.html>).
- CMM/metrology verification as a standard companion process, not an optional add-on, per
  multiple sources (`supplier_marketing`, `medium`).

## Typical quantity patterns

Jigs and fixtures are inherently low-volume/one-off by nature (a fixture typically serves one
production line or one inspection station), which is qualitatively different from the other
wedge part types, where "low volume" describes an early-stage part that may later scale. No
source contradicted this; several implicitly support it via "turnkey," "custom," and
per-project framing rather than any unit-count language (`ai_inferred`, `medium` — this is a
structural inference about the part category itself, not from a specific cited number).

## Competitor / alternative solution surfaces

- Mahuta Tool Corporation, MD Design & Automation, KTM Solutions, CAVTool, Precision Jig and
  Fixture Inc. (PJF Inc.), Yicen Precision — all US-based dedicated jig/fixture specialists found
  in this pass.
- ThomasNet — functions as a supplier-directory/alternative-solution-surface for this category
  specifically (buyers browsing/comparing many regional fixture shops in one place), distinct
  from the instant-quote-marketplace model seen elsewhere in the wedge.
- General-purpose CNC marketplaces (Xometry etc.) also machine fixture plates and tooling
  components as generic parts, though no source found them marketing "fixtures" as a named,
  dedicated category the way the jig/fixture specialists above do — suggesting this sub-segment
  is comparatively underserved by the generic instant-quote marketplaces and better served by
  specialists (`ai_inferred`, `medium`).

## US vs Australia geography notes

- **US signal: strong.** All named jig/fixture specialists above are US-based.
- **Australia signal: none found at the part-type level.** No Australia-based jig/fixture
  specialist was identified in this pass, despite Australia's documented strength in mining
  (a named heavy user of custom tooling/fixtures in the US data above) — this is a plausible but
  **unconfirmed** cross-market opportunity, not evidence of actual AU demand. **Flagged as a
  gap** worth a dedicated AU-focused follow-up search.

## Sources referenced in this file

- <https://www.mahutatool.com/Tooling/JigFixtureMachining>
- <https://www.mddesignwi.com/jigs-and-fixturemanufacturing.html>
- <https://www.ktmsolutions.com/manufacturing-fixturing-tooling>
- <https://mhfixture.com/en/custom-machining-fixtures>
- <https://www.cavtool.com/fixtures/>
- <https://customparts-mfg.com/capabilities/jigs-fixtures/>
- <https://www.thomasnet.com/suppliers/usa/jigs-fixture-design-fabrication-41560509>
- <https://www.pjfinc.com/>
- <https://yicenprecision.com/service/custom-jig-fixture-design-services/>
