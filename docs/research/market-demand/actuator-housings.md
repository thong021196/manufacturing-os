# Actuator Housings & Joint Housings

Covers: actuator housings (linear and rotary), joint housings (harmonic-drive / gearbox
housings), servo motor housings, gear-reducer cases. Clustered together because every source
found treats these as one precision-housing family sharing buyers, tolerance regime, and
supplier base.

See `README.md` for the source-type/confidence legend and the four-demand-layers framing.

## Market segments / buyer types

- Robotics/automation OEMs building industrial robot arms, collaborative robots (cobots), and
  mobile robot platforms who need custom housings around linear/rotary actuators and joint
  drives (`ai_inferred`, `medium` — inferred from the concentration of "robotics" and
  "semiconductor automation" as the named verticals across every actuator-housing supplier page
  found). Evidence: Zintilon's actuator-housings page is explicitly scoped to "Semiconductor
  Automation" (`supplier_marketing`, `medium`, captured 2026-09-19,
  <https://www.zintilon.com/industry/semi-conductor/actuator-housings/>); RivCut's actuator-
  housing pages are explicitly scoped to "Robotics & Automation" (`supplier_marketing`, `medium`,
  <https://www.rivcut.com/cnc-machining/robotics/actuator-housings/>).
- Humanoid-robotics developers, specifically for joint/harmonic-drive housings. A dedicated
  technical page on machining "Harmonic Drive Housings for Humanoid Joints" frames this as a
  distinct, currently underserved buyer segment (`supplier_marketing`, `medium`, captured
  2026-09-19, <https://www.ptsmake.com/cnc-machined-harmonic-drive-housings-for-humanoid-joints/>).
  This lines up with the broader 2026 humanoid-robot supply-chain narrative: industry coverage
  states scaling high-precision actuator/gearbox components remains a critical bottleneck for
  humanoid manufacturers, and cites Schaeffler announcing a new strain-wave-gearbox manufacturing
  process in August 2026 specifically to address this (`documentation_verified`, `medium`,
  captured 2026-09-19, <https://www.techtarget.com/ai/news/366650324/Humanoid-robot-boom-Boosts-cobot-supply>).
- Motion-control integrators buying linear-actuator tube/end-cap sections and ball-screw-bore
  housings as discrete purchased components rather than building a full robot
  (`supplier_marketing`, `low`, <https://www.xinqidamachining.com/product/cnc-linear-actuator-housing-custom-aluminum-high-precision-cnc-machined-for-robotic-motion-module/>).

## Search queries + intent (qualitative — no real volume data)

No keyword-volume tool was available (see `README.md`). Query patterns below are reasoned from
how suppliers title their own landing pages and product listings, which is a reasonable proxy
for what buyers actually type, but the *relative* interest ranking is `ai_inferred`/`low`, not
measured.

| Query pattern | Likely intent | Reasoning |
|---|---|---|
| "custom actuator housing CNC machining" | transactional | Near-exact match to multiple suppliers' page titles (`ai_inferred`, `low`). |
| "linear actuator housing custom" | transactional | Matches XINQIDA product title pattern. |
| "harmonic drive housing machining" | transactional / commercial | Matches PTSmake and LSRPF page titles; niche enough to signal a buyer already scoping a specific component, not a generic browser. |
| "actuator housing tolerance" / "actuator housing material 6061 vs 7075" | informational | Matches the technical-explainer framing found in the PTSmake/LSRPF pages (comparing 7075-T7351 vs alternatives). |
| "robot joint housing manufacturer" | commercial | Buyer comparing suppliers, matches RivCut's "Robotics & Automation" landing-page framing. |

## Recurring engineering problems

- **Maintaining constant clamping/preload force on harmonic-drive or bearing interfaces despite
  thermal input during machining.** A dedicated technical source states 5-axis toolpath
  strategies are used specifically to limit thermal input so the housing keeps constant clamping
  force on the harmonic drive (`supplier_marketing`, `medium`, captured 2026-09-19,
  <https://www.ptsmake.com/cnc-machined-harmonic-drive-housings-for-humanoid-joints/>).
- **Backlash/vibration sensitivity — "even a tiny flaw can cause vibration, backlash, or complete
  failure"** in harmonic-drive housings specifically, per the same source. This is treated as
  `supplier_marketing` (self-interested claim about precision needs) but is corroborated by
  independent engineering literature on tolerance stack-up in robotic components generally (see
  below).
- **Strength-to-weight tradeoff drives alloy choice.** 7075 aluminum is repeatedly described as
  commanding a material/machining cost premium over 6061 but chosen anyway for weight-sensitive,
  high-performance joints (`supplier_marketing`, `medium`, same source).
- **General tolerance-stack-up discipline.** Independent engineering commentary (not tied to any
  one vendor) states tolerances should be set by functional requirement, not machine capability,
  and that over-tight tolerances on every dimension increase machining time/inspection cost
  needlessly — a generic but recurring failure mode relevant to housings with many mating
  features (`documentation_verified`, `medium`, captured 2026-09-19, source aggregated via
  WebSearch from multiple CNC design-guide pages; see `README.md` limitation 3a on blended
  summaries).
- **Thermal expansion / bearing-life degradation from heat generated near actuators**, raised in
  general robotics mechanical-design literature as a driver of housing material and clearance
  choices (`ai_inferred`, `low` — general engineering commentary, not actuator-housing-specific
  primary source).

## Common materials

- Aluminum 6061 and 7075 (both T6 and T7351 tempers mentioned) dominate across every source —
  chosen for machinability, strength-to-weight, and (for 7075-T7351 specifically) creep
  resistance under sustained clamping loads (`supplier_marketing`, `medium`, multiple sources
  above).
- Steel/servo-housing sources mention hardened 4140 steel for higher-load housings alongside
  aluminum (`supplier_marketing`, `low`, aggregated via WebSearch — see limitation 3a).

## Common processes

- 3- and especially 5-axis CNC milling is the default process named across every source; 5-axis
  is specifically called out for joint/harmonic-drive housings to control thermal input and hit
  bore/interface tolerances in one setup (`supplier_marketing`, `medium`,
  <https://www.ptsmake.com/cnc-machined-harmonic-drive-housings-for-humanoid-joints/>,
  <https://www.lsrpf.com/blog/5-axis-cnc-machining-for-robotic-arm-joints-precision-solutions-for-high-load-high-precision>).
- CMM inspection on every order is claimed by at least one supplier as standard practice for
  this part family (`supplier_marketing`, `low`).
- Stated tolerance ranges across sources cluster around ±0.02 mm dimensional / ±0.01 mm hole
  position for general features, tightening toward ±0.0001" (~0.0025 mm) on critical bores for
  the highest-precision claims — treated as `supplier_marketing`/`low`-`medium` since these are
  each vendor's own stated capability, not independently audited, and some numbers were returned
  as a blended WebSearch summary across more than one supplier page (see `README.md` limitation
  3a).

## Typical quantity patterns

No actuator-housing-specific quantity data was found. By analogy to the general CNC
prototype/low-volume market context (see `cnc-sheet-metal-general.md`), single-digit-to-low-
hundreds unit runs are the plausible default for this part family, since actuator/joint housings
are typically iterated through several prototype revisions before any production commitment
(`ai_inferred`, `low`).

## Competitor / alternative solution surfaces

- Zintilon — "Custom Actuator Housings CNC Machining for Semiconductor Automation"
  (<https://www.zintilon.com/industry/semi-conductor/actuator-housings/>).
- RivCut — dedicated "CNC Machined Actuator Housings" pages, both a general Robotics & Automation
  version and multiple US-city-localized landing pages (Detroit, Dallas, Charlotte, Cedar Rapids,
  Austin), suggesting a local-SEO strategy targeting US regional buyers
  (<https://www.rivcut.com/cnc-machining/robotics/actuator-housings/>).
- XINQIDA — a China-based manufacturer with an English-language product listing specifically for
  "CNC Linear Actuator Housing... For Robotic Motion Module," indicating overseas competition is
  also targeting this exact keyword space (<https://www.xinqidamachining.com/product/cnc-linear-actuator-housing-custom-aluminum-high-precision-cnc-machined-for-robotic-motion-module/>).
- PTSmake and LSRPF — both run technical-explainer content marketing specifically about harmonic-
  drive/joint housings, i.e., content-led buyer acquisition rather than only a product listing
  (URLs above).
- General-purpose instant-quote marketplaces (Xometry, Protolabs Network/Hubs, RapidDirect,
  PartsBadger) also serve this part family as one SKU among many rather than a dedicated
  landing page — see `cnc-sheet-metal-general.md` for the full marketplace list.

## US vs Australia geography notes

- **US signal: comparatively strong.** RivCut's city-localized landing pages (Detroit, Dallas,
  Charlotte, Cedar Rapids, Austin) are direct evidence of US-targeted, US-hosted supply for this
  exact part type (`supplier_marketing`, `medium`).
- **Australia signal: none found at the part-type level.** No Australia-based supplier page
  specifically for actuator or joint housings was found in this research pass. Australia-level
  evidence exists only at the market/policy level (national robotics strategy, market-size
  forecasts — see `README.md` executive summary and `cnc-sheet-metal-general.md`), not broken
  out by this specific part type. **This is flagged as a gap, not silently filled with US data.**

## Sources referenced in this file

- <https://www.zintilon.com/industry/semi-conductor/actuator-housings/>
- <https://www.rivcut.com/cnc-machining/robotics/actuator-housings/> (and city-localized variants: Detroit, Dallas, Charlotte, Cedar Rapids, Austin)
- <https://www.xinqidamachining.com/product/cnc-linear-actuator-housing-custom-aluminum-high-precision-cnc-machined-for-robotic-motion-module/>
- <https://www.ptsmake.com/cnc-machined-harmonic-drive-housings-for-humanoid-joints/>
- <https://www.lsrpf.com/blog/5-axis-cnc-machining-for-robotic-arm-joints-precision-solutions-for-high-load-high-precision>
- <https://www.techtarget.com/ai/news/366650324/Humanoid-robot-boom-Boosts-cobot-supply>
