# Search-Intent Pilot — Market Summary

Issue: #20 — Pass 6, Search-intent map + 35–50 page pilot architecture
Method: live WebSearch (US-localized) across 20 seed objects + 8 application areas + 6 problem/process areas, 50 total candidate queries. See `query-candidates.csv` for every query and its observed SERP composition, `intent-clusters.csv` for the deduped intents, `pilot-pages.csv` for the proposed pages, and `cannibalization-map.csv` for merge/split decisions.

## Methodology note and honest limitation up front

The issue's research method suggests ~10–30 candidate queries *per sub* (which would be 340–1,020 queries across all seed subs). Given this session's tool budget, **50 real WebSearch queries were run** — roughly 2–3 per object/application/problem area, chosen to cover the most informative query dimensions (bare object, "manufacturer", and process/CNC-qualified framings) rather than exhaustively enumerating every dimension × material × lifecycle permutation. This is a deliberate trade-off: breadth-of-coverage across all seed subs, at reduced depth-per-sub, rather than deep coverage of a handful of subs. Every claim in these deliverables traces to one of these 50 actual searches (see `query_id` cross-references). Nothing about SERP composition, ranking domains, or intent is fabricated; "commercial_strength" and "SERP_fragmentation" are qualitative judgments from observed result types only — **no keyword-tool or Search-Console volume data was used or is claimed anywhere in this pass.**

The WebSearch tool used in this session is documented as US-localized ("Web search is only available in the US"). AU-specific findings are therefore weaker and are explicitly labeled UNKNOWN throughout — see the AU section below.

## Which physical objects show the clearest procurement/RFQ search intent

Strongest, cleanest evidence (fragmented SERP, specialist manufacturers visible, no giant-platform or off-topic contamination, real technical content available):

- **Gripper fingers/jaws** (OBJ08) — best evidence in the whole pass. A dedicated online CAD-to-part configurator (GripShape) exists purely for this object, plus Kurt Workholding, Stryver, Rohtek, zintilon. Direct proof of live commercial demand.
- **EOAT tooling plates & parts** (OBJ09) — mature, purely specialist B2B niche (EOAT Machining, EMI Corp, CRG, Millibar, ASS EOAT). No giant-platform or hobby-retail noise anywhere.
- **Robot shaft** (OBJ04) — fragmented, specialist-dominated, real technical depth (Swiss turning, runout/concentricity).
- **Robot base/pedestal** (OBJ10) — fragmented specialist fabricators plus one legitimate scaled competitor (Vention), real welding+machining technical depth.
- **ROV/pressure housing** (OBJ18) — cleanly specialist, titanium/pressure-vessel technical depth, zero giant-platform or off-topic noise.
- **Custom CNC-machining-qualified framings of joint housing, actuator housing, bracket, sensor/camera mount** (OBJ01, OBJ02, OBJ07, OBJ16) — all show fragmented, specialist-dominated SERPs *once the query includes "custom CNC machining"* (see contamination note below).

## Where broad queries are dominated by large platforms

- **Broad "custom manufacturing RFQ CAD quote China supplier robotics parts"** (Q050): unambiguous sweep by Alibaba (cited with 200,000+ suppliers), Xometry, Haizol (cited with 300,000+ users), MFG.com. This is the clearest giant-platform-dominance evidence in the pass — directly confirms the issue's own caution against broad category pages.
- **"Industrial robot custom parts machining manufacturer"** (Q040): dominated by scaled on-demand manufacturing aggregator platforms (Xometry, Fictiv, Hubs/Protolabs Network) that each run a dedicated `/robotics/` vertical page. These aren't Alibaba/Amazon-style marketplaces, but they occupy the same competitive role — big, well-funded, broad-catalog, hard to outrank on the head term.
- **"Custom robot enclosure shell manufacturer"** (Q026): one Alibaba product-detail page ranks directly in organic results — the only query in this pass where a marketplace *listing itself* (not just a directory/aggregator) appeared.
- **"AMR custom parts manufacturing CNC"** (Q039): collapsed entirely into generic multi-industry CNC-quoting platforms (eBay, Xometry, PCBWay, eMachineShop) with zero AMR-specific content at all — see "what should not become a page" below.

## Where specialist manufacturers rank (fragmentation confirmed)

For nearly every object once framed with "custom CNC machining" rather than a bare noun or "manufacturer," the SERP is dominated by a long tail of small-to-mid specialist CNC job shops, many China-based, several of which have already built dedicated content-marketing pages *per object* — e.g. zintilon.com runs separate pages for shafts, bearing housings, sensor housings, and custom grippers; RivCut runs separate pages (some templated per-city) for actuator housings, gripper components, robot-arm links, and defense-optics/sensor parts. **This is itself the strongest available evidence that an object-first page architecture is viable**: competitors have already independently converged on splitting content by physical object rather than by process × material × robot-type, which is exactly the architecture the issue asks us to validate.

## A recurring and important contamination pattern: bare object/manufacturer queries pull the wrong buyer

This was the single most consistent finding across the pass, observed independently for at least 4 different objects:

1. **"Manufacturer" queries for assembled components collapse toward the assembled-component seller, not the machining-service shop.** "Robot joint housing manufacturer," "robot actuator housing manufacturer," and "harmonic reducer housing manufacturer" all returned sellers of the *complete integrated component* (motor+gearbox+encoder joint modules, harmonic-drive gearboxes) rather than shops that would machine a housing to the buyer's own drawing. (Q002, Q005, Q007)
2. **Bare "bracket" and "motor mount" queries are captured by hobby/education/FRC-competition retail**, not industrial RFQ buyers at all. "Robot bracket" (Q017) and "robot motor mount manufacturer" (Q014) returned VEX Robotics, REV Robotics/goBILDA, RobotShop, SuperDroid, FingerTech — zero industrial CNC content in either search.
3. **Bare "chassis" + "welded frame" pulls in automotive aftermarket chassis builders** (hot-rod/race-car shops) as cross-industry noise (Q031).
4. **"Battery enclosure" collapses into full battery-PACK manufacturers** (cell + BMS + certification), a fundamentally different supplier vertical from mechanical-housing-only CNC/sheet-metal shops (Q028).

**Implication for the pilot:** every object page's target keyword phrasing and H1 must include the machining/custom-service qualifier ("custom CNC machining," "custom fabrication") and must never rely on the bare object noun or the bare "+ manufacturer" phrasing alone — those forms measurably pull a different, non-RFQ buyer.

## US vs AU differences

- **China-side supply signal for AU**: Chinese contract manufacturers do explicitly claim to ship to/serve Australia (Q048: Senze Precision, VMT, Xinqida, HLH Rapid all mention Australia among served regions). This is consistent with issue #18/#19's conclusion that supply-side existence is already established and not the constraint for this pass.
- **AU-side demand signal is genuinely thin and different in character from the US signal.** Searching "custom robot parts manufacturer Australia" (Q049) did **not** surface AU-based specialist CNC-for-robot-parts competitors comparable to the US/China cluster. It surfaced Australian **robot-arm integrators** (Automated Solutions Australia, The Robot Factory — companies that sell/install industrial robot arms, a different business than machining a customer's own part design) and **hobby/education retail** (Robot Gear Australia, Core Electronics, eBay Australia). One plausible analog was found — compass-anvil.com ("Robotic Parts & Components | Manufacturing Sourcing Services") — but it was not investigated further in this pass.
- **This is explicitly labeled UNKNOWN as to cause.** Two explanations are equally plausible from the evidence gathered and cannot be distinguished with the tools available in this session: (a) genuinely thinner AU-specific search volume/competitor density for this exact buyer intent, or (b) AU buyers searching the same generic technical terms as US buyers (without an "Australia" qualifier), which this session's US-localized WebSearch tool would not reliably differentiate from US results anyway. **Do not treat the AU findings in this pass as conclusive** — a follow-up pass using an AU-geolocated search tool or AU keyword-volume data source is recommended before AU-specific pages are prioritized or AU-only content is written.
- No AU-specific SERP differences were found for any *object* query (all object-level research in this pass used US-localized search only, per the query-candidates.csv `market` column — only Q048/Q049 explicitly targeted AU framing).

## What should NOT become a page (this pass's recommendation)

- **Bare "robot bracket" / "robot motor mount manufacturer"** as a page's primary target phrase — hobby/FRC-retail contaminated (see contamination pattern above). Build the object pages, but title/target them around "custom CNC machining," never the bare noun.
- **"AMR custom parts manufacturing"** as a literal phrase — zero AMR-specific SERP identity found (Q039); reframe as chassis-led (see OBJ14/APP03).
- **A standalone "robot parts inspection / CMM report" page** — Q046 showed no distinct buyer intent separate from generic CMM-equipment vendors and CMM-machine-tending automation content. Fold sample inspection-report content into each object page as a trust section instead.
- **The broad "custom manufacturing RFQ CAD quote China supplier robotics parts" phrase** as a primary SEO target — unambiguously Alibaba/Xometry/Haizol/MFG.com-dominated (Q050). A related informational page (PRB_E) is still proposed, but scoped to the how-to/qualification angle, not this broad commercial phrase.
- **Permutation pages** (object × city, object × material, object × process) — RivCut's own competitor pattern (templated near-identical pages for "gripper components," "robot arm links," and "actuator housings" repeated across many US cities: Milwaukee, Birmingham, Atlanta, Chicago, Sacramento, Des Moines, Dallas, Seattle) is flagged explicitly in this research as an example of the exact failure mode the issue warns against. It is documented as a cautionary competitor observation, **not** a pattern to copy, and no city-permutation pages are proposed here.
- **A separate LiDAR-mount page** — no distinct commercial content found apart from generic sensor/camera-mount content (Q034); merged into OBJ16.

## What remains uncertain / needs follow-up before publishing

- **OBJ13A (battery enclosure, mechanical scope)** — this exact narrow framing ("mechanical housing only, not cell/BMS") was not directly search-tested; its evidence is inferred from the adjacent electronics-enclosure query (Q029). Recommend a dedicated follow-up search pass before committing full content investment. Flagged `P2 (validate before build)` in `pilot-pages.csv`.
- **APP02 (cobot custom parts) and APP05 (inspection/field robot parts)** — both flagged experimental/low-confidence; the exact phrasings tested returned weak or contaminated results (Q038, Q041). A follow-up pass with more specific phrasing (e.g. "cobot tool flange adapter manufacturer," "pipe crawler robot parts manufacturer") is recommended before committing to these as standalone pages.
- **AU demand-side signal** — see AU section above; genuinely unresolved with this session's tooling.
- **Harmonic reducer/drive housing (OBJ03) and structural/arm-link parts (OBJ11)** — both launched as lower-priority/child pages due to thin standalone competitor differentiation; monitor before promoting to independent top-level pages.
- **No search-volume, click-through, or ranking-difficulty data of any kind was available in this session** (no Keyword Planner/Ahrefs/SEMrush/GSC access, consistent with the task's constraints). All "commercial_strength" and "SERP_fragmentation" judgments in `intent-clusters.csv` are qualitative, based only on observed SERP composition (result types and which domains appear), and should be treated as directional, not quantified, until real performance data exists post-publication.
- **WebFetch reliability**: this session relied entirely on WebSearch's own result snippets (titles/URLs/summary text) rather than full-page fetches, consistent with prior sessions in this repo noting WebFetch is unreliable/blocked for several domains (including alibaba.com). No full-page fetch was attempted or needed for this pass's conclusions.
