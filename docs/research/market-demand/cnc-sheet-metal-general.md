# General Custom CNC / Sheet-Metal Parts & Cross-Cutting Competitor Landscape

This file covers the general "custom CNC machined and sheet-metal part" surface that every
part-type file above competes within, plus the macro demand-context evidence (robot install
base, national robotics policy, humanoid-robotics supply chain) that applies across the whole
wedge rather than to one part type.

See `README.md` for the source-type/confidence legend and the four-demand-layers framing.

## Market segments / buyer types

- Robotics/automation hardware teams needing multi-process (CNC + sheet metal + 3D printing)
  custom parts sourced through a single quoting relationship rather than per-part specialists —
  this is the core value proposition of every generalist marketplace named below
  (`supplier_marketing`, `medium`).
- Specifically-robotics-scoped buyers: Xometry runs a dedicated "Robotics Manufacturing" vertical
  page, and PartsBadger runs a dedicated "Automation and Robotics" industries page — both
  generalist marketplaces investing in robotics-specific landing pages is itself evidence the
  segment is judged commercially significant enough to warrant dedicated positioning
  (`supplier_marketing`, `medium`, captured 2026-09-19,
  <https://www.xometry.com/robotics/>, <https://parts-badger.com/industries/automation-and-robotics/>).
- Startups/hardware teams prioritizing quote turnaround and DFM feedback over lowest price —
  reflected in repeated marketing emphasis on "instant quote," "DFM feedback within 24 hours,"
  and fast prototype turnaround (1–7 days) across nearly every marketplace found
  (`supplier_marketing`, `medium`).

## Search queries + intent (qualitative — no real volume data)

| Query pattern | Likely intent | Reasoning |
|---|---|---|
| "instant CNC quote" / "upload CAD get quote" | transactional | Nearly universal marketplace page framing (`ai_inferred`, `low`). |
| "CNC machining service robotics" | commercial | Matches Xometry's and PartsBadger's dedicated robotics-vertical pages directly. |
| "CNC machining near me [city]" | transactional, local intent | Matches the widespread city-localized landing-page pattern seen across RivCut and Australian shops (Zeal 3D: Melbourne/Perth/Brisbane; Elite CNC: Sydney) (`ai_inferred`, `medium`, given how consistently this pattern recurs). |
| "Xometry vs Protolabs vs Fictiv" / "[marketplace] alternative" | commercial, comparison-stage | Implied by the sheer number of near-identical competing marketplaces found — a buyer comparing options is a very plausible real query pattern (`ai_inferred`, `low`, no direct evidence of the query itself, only of the market structure that would produce it). |
| "CNC machining Australia instant quote" | transactional, geography-qualified | Matches the existence of Xometry's dedicated `.au` storefront and several Australia-based providers (`documentation_verified`, `medium`, given Xometry's own decision to run a geography-specific domain is a real, citable business signal). |

## Recurring engineering problems

Aggregated across the wedge, three problems recur independently of part type:

1. **Weight vs. stiffness tradeoff.** Independent (non-vendor) engineering literature: "Weight
   Reduction: A Typical Issue in the Mechanical Design of Robotic Systems" — a peer-reviewed-
   adjacent paper indexed on ResearchGate, framing weight reduction as a defining, recurring
   robotics mechanical-design problem, not a one-off concern (`documentation_verified`, `medium`,
   captured 2026-09-19, <https://www.researchgate.net/publication/273169162_Weight_Reduction_A_Typical_Issue_in_the_Mechanical_Design_of_Robotic_Systems>).
2. **Tolerance stack-up / over-specification.** Repeated guidance across CNC design-guide content
   that tolerances should follow functional need, not maximum machine capability, because
   over-tight tolerancing raises cost/time without functional benefit — a cross-cutting theme
   also raised in the actuator-housing and joint-housing sources (`documentation_verified`,
   `medium`, aggregated via WebSearch across multiple design-guide pages; see limitation 3a).
3. **ECAD-MCAD fit/form/function coordination.** Altium's resource on "Fit, Form, and Function
   Challenges in Robotics with ECAD-MCAD Collaboration" frames a recurring problem specific to
   robotics hardware: mechanical housings/mounts/brackets must be co-designed with the
   electronics they contain, and poor coordination between the two disciplines is a named
   failure mode (`documentation_verified`, `medium`, captured 2026-09-19,
   <https://resources.altium.com/p/fit-form-function-challenges-robotics-ecad-mcad-collaboration>).

## Common materials (wedge-wide)

Aluminum 6061-T6 and 7075-T6/T7351 are, without exception, the two materials named across every
part-type file above. Stainless steel (304), carbon/alloy steel (including hardened 4140), and
engineering plastics (Delrin/acetal) appear as secondary materials for wear surfaces, higher-load
components, or cost-sensitive parts. Sheet-metal parts (enclosures, brackets) more often use
formed sheet aluminum or steel than solid-block stock (`supplier_marketing`, `medium`, aggregate
across all part-type files' sources).

## Common processes (wedge-wide)

3- and 5-axis CNC milling is the dominant process across the wedge; wire EDM appears specifically
for grip-surface/contour detail work; laser-cut + formed + welded sheet metal is the dominant
alternative process family for enclosures/brackets; metal and polymer 3D printing appear as a
faster/cheaper alternative specifically for EOAT and, per one 2026-dated source, sensor brackets
(`supplier_marketing`/`documentation_verified`, `medium`, aggregate across all part-type files).

## Typical quantity / prototype-vs-low-volume patterns

- Hubs/Protolabs Network's own stated range is "1–1,000 units" for CNC machining
  (`supplier_marketing`, `low` — this specific number came through a `WebSearch` summary of a
  domain [`hubs.com`] that `WebFetch` could not independently confirm; see `README.md`
  limitation).
- Precision Manufacturing Australia states handling "small batches to over 100K units," i.e. the
  same marketplace explicitly spans from prototype through mass production, meaning quantity
  range alone does not distinguish this segment from any other manufacturing buyer
  (`supplier_marketing`, `low`, captured 2026-09-19,
  <https://precisionmanufacturing.com.au/cnc-machining-services-for-prototypes-and-production-parts/>).
- Turnaround-time framing across nearly every source (1–7 day prototypes standard, up to
  6–8 weeks for complex/high-volume/specialty-alloy orders) supports a general pattern: this
  wedge's buyers skew toward fast-turn prototype and low-volume work, with production-volume
  capability existing but not being the marketed differentiator (`supplier_marketing`, `medium`,
  aggregated across multiple lead-time-focused articles; see limitation 3a).
- This is consistent with, and does not contradict, `docs/product/PRODUCT.md`'s MVP framing
  (CAD upload → RFQ → quote → order, not a mass-production commitment).

## Competitor / alternative solution surfaces (the full landscape)

**Global/US-headquartered instant-quote marketplaces** (multi-process: CNC + sheet metal, often
+ 3D printing):
- Xometry (<https://www.xometry.com/capabilities/cnc-machining-service/>,
  <https://www.xometry.com/robotics/>) — also operates a dedicated Australia/New Zealand
  storefront (<https://xometry.au/cnc-machining/>).
- Protolabs / Protolabs Network, formerly Hubs (<https://www.hubs.com/cnc-machining/>,
  <https://www.protolabs.com/services/cnc-machining/>).
- Fictiv (<https://www.fictiv.com/cnc-machining-services>).
- RapidDirect (<https://www.rapiddirect.com/services/cnc-machining/>).
- PCBWay (<https://www.pcbway.com/rapid-prototyping/cnc-machining/>).
- JLCCNC (<https://jlccnc.com/>).
- PartsBadger — with a dedicated "Automation and Robotics" vertical page
  (<https://parts-badger.com/industries/automation-and-robotics/>).
- Geomiq — UK/EU-oriented, sheet-metal-focused instant quote (<https://geomiq.com/sheet-metal/>).

**Robotics-specialist job shops (content-and-vertical-led, not generalist marketplaces):**
- RivCut, Zintilon — see per-part-type files above for their specific product-line pages.

**Australia-specific providers:**
- Xometry Australia & New Zealand (<https://xometry.au/cnc-machining/>).
- Zeal 3D Printing — Melbourne-based, also serving Perth and Brisbane, online instant quote
  (<https://www.zeal3dprinting.com.au/services/cnc-machining/>).
- Precision Manufacturing Australia — instant online quotes, ±0.01 mm tolerance claim, small
  batch to 100K+ units, 5-day minimum lead time claim
  (<https://precisionmanufacturing.com.au/cnc-machining-services-for-prototypes-and-production-parts/>).
- Berkeley Engineering — long-established (90+ years claimed), upload-drawing quote system
  (<https://www.berkeleyengineering.com.au/cnc-machining/>).
- Elite CNC — Sydney-based (<https://elitecnc.com.au/>).

**Alternative-solution-surface types (not fulfillment marketplaces):**
- ThomasNet — supplier directory/discovery surface for US machine shops and custom manufacturers
  (<https://www.thomasnet.com/>), including robotics-specific categories (Robotic Components
  Suppliers, Robot Accessories Manufacturers).
- Practical Machinist forum — organic peer-to-peer "who makes this" discovery surface (see
  `gripper-jaws-eoat.md`).
- Qviro — buyer-education/price-comparison content surface (see `gripper-jaws-eoat.md`).

## Macro demand context (applies wedge-wide, not part-specific)

These are industry-level signals that a market for robotics/automation exists and is growing —
they are **not** a measurement of demand for Manufacturing OS's specific part-type wedge, and
should not be read as such. Included because they are real, citable, dated context relevant to
sizing the opportunity directionally.

- **Global industrial robot installations**: the IFR's "World Robotics 2025" report is reported
  (via secondary coverage, since `ifr.org` itself was unreachable — see `README.md` limitation)
  as showing 542,000+ robots installed globally in 2024, more than double the figure from 10
  years prior, with installations forecast to grow ~6% to roughly 575,000 units in 2025.
  Regionally, Asia accounted for ~74% of 2024 installations, Europe ~16%, and the Americas ~9%;
  within the Americas, the US accounted for ~68% of installations, and separate coverage states
  the US market grew ~11% in 2025 with roughly 38,000 new units installed
  (`documentation_verified`, `medium` — real report, but relayed through secondary coverage we
  could not independently fetch; captured 2026-09-19,
  <https://www.therobotreport.com/ifr-industrial-robot-deployments-have-doubled-in-10-years/>,
  <https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years>).
- **US robot order growth**: a 2026-dated press release states robot orders grew 6.6% in 2025,
  driven by broader adoption across general industries (`documentation_verified`, `medium`,
  captured 2026-09-19, likely an Association for Advancing Automation (A3) release based on
  framing and topic, though the publishing organization was not independently confirmed in this
  pass — **flagged as needing verification**,
  <https://www.businesswire.com/news/home/20260204160172/en/Robot-Orders-Grow-6.6-in-2025-as-General-Industries-Drive-Broader-Automation-Adoption>).
- **Australia robotics adoption policy**: Australia's federal government formally released its
  first National Robotics Strategy (per multiple sources, dated 2024/early-2025 depending on
  source), building on the AU$15 billion National Reconstruction Fund which names robotics as a
  priority investment area. The strategy's own modeling states advanced robotics/automation
  adoption could add up to A$600 billion per year to Australia's GDP at full adoption, and that
  even a 1-percentage-point increase in robotics uptake could raise whole-of-economy productivity
  by 0.8% — these are the *government's own long-run modeled projections*, not measured outcomes,
  and should be read as aspirational policy framing, not near-term market size
  (`documentation_verified`, `high` for the strategy's existence/funding vehicle; `ai_inferred`/
  `low` for the GDP-impact figure's reliability as a demand forecast; captured 2026-09-19,
  <https://international.austrade.gov.au/en/news-and-analysis/news/australia-releases-first-national-robotics-strategy>,
  <https://www.industry.gov.au/publications/national-robotics-strategy/australias-robotics-opportunity>).
  The same coverage names mining, logistics, and manufacturing as Australia's current robotics
  strengths (`documentation_verified`, `medium`).
- **Australia robotics market-size forecast (third-party market research, not primary/official
  data)**: IMARC Group states Australia's robotics market reached ~USD 1.7 billion in 2025 with
  a forecast to ~USD 6.9 billion by 2034 (16.03% CAGR), and Australia's "robotics in
  manufacturing" sub-market at ~4.6 thousand units in 2025 growing to ~17.4 thousand units by
  2034 (15.44% CAGR) (`documentation_verified` for the fact of publication; `ai_inferred`/`low`
  for the numbers themselves, since IMARC's methodology could not be audited; captured
  2026-09-19, <https://www.imarcgroup.com/australia-robotics-market>,
  <https://www.imarcgroup.com/australia-robotics-in-manufacturing-market>).
- **Humanoid-robotics component supply chain (2026)**: multiple 2026-dated sources describe a
  humanoid-robot production boom straining precision-component supply (screws, bearings, high-
  performance actuators, strain-wave gearboxes specifically), with Schaeffler announcing a new
  strain-wave-gearbox manufacturing process in August 2026 aimed at this bottleneck
  (`documentation_verified`, `medium`, captured 2026-09-19,
  <https://www.techtarget.com/ai/news/366650324/Humanoid-robot-boom-Boosts-cobot-supply>). This
  is directly relevant to the actuator-housing/joint-housing cluster as a demand tailwind but is
  a market-research/press narrative, not a measured order-book figure — treat market-size figures
  quoted in this space (e.g., USD 5.41B 2026 → USD 50.27B 2035 humanoid market-size projections
  from various forecasting firms) as `ai_inferred`/`low`, since they are third-party forecasts we
  cannot audit.

## Sources referenced in this file

- <https://www.xometry.com/capabilities/cnc-machining-service/>
- <https://www.xometry.com/robotics/>
- <https://xometry.au/cnc-machining/>
- <https://www.hubs.com/cnc-machining/>
- <https://www.protolabs.com/services/cnc-machining/>
- <https://www.fictiv.com/cnc-machining-services>
- <https://www.rapiddirect.com/services/cnc-machining/>
- <https://www.pcbway.com/rapid-prototyping/cnc-machining/>
- <https://jlccnc.com/>
- <https://parts-badger.com/industries/automation-and-robotics/>
- <https://geomiq.com/sheet-metal/>
- <https://www.zeal3dprinting.com.au/services/cnc-machining/>
- <https://precisionmanufacturing.com.au/cnc-machining-services-for-prototypes-and-production-parts/>
- <https://www.berkeleyengineering.com.au/cnc-machining/>
- <https://elitecnc.com.au/>
- <https://www.thomasnet.com/> (and category pages linked in body)
- <https://www.researchgate.net/publication/273169162_Weight_Reduction_A_Typical_Issue_in_the_Mechanical_Design_of_Robotic_Systems>
- <https://resources.altium.com/p/fit-form-function-challenges-robotics-ecad-mcad-collaboration>
- <https://www.therobotreport.com/ifr-industrial-robot-deployments-have-doubled-in-10-years/>
- <https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years>
- <https://www.businesswire.com/news/home/20260204160172/en/Robot-Orders-Grow-6.6-in-2025-as-General-Industries-Drive-Broader-Automation-Adoption>
- <https://international.austrade.gov.au/en/news-and-analysis/news/australia-releases-first-national-robotics-strategy>
- <https://www.industry.gov.au/publications/national-robotics-strategy/australias-robotics-opportunity>
- <https://www.imarcgroup.com/australia-robotics-market>
- <https://www.imarcgroup.com/australia-robotics-in-manufacturing-market>
- <https://www.techtarget.com/ai/news/366650324/Humanoid-robot-boom-Boosts-cobot-supply>
