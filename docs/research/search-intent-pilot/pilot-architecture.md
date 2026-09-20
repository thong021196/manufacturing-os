# Search-Intent Pilot — Site Architecture (34 pages)

Issue #20, Pass 6. This is a **proposed** site map for a 35-page pilot (34 pages proposed; see "Why not exactly 35–50" below), grounded in the evidence in `query-candidates.csv`, `intent-clusters.csv`, `pilot-pages.csv`, and `cannibalization-map.csv`. **Nothing here is published or deployed.** This document explains why each page exists and how it relates to its parent/children.

Architecture principle (per the issue): **physical RFQ object → technical problem → manufacturing route → quote**, not `process × material × robot type × country`. All object pages below are titled and scoped around a physical part; process/capability pages are cross-cutting and link back into the object pages rather than duplicating their content; application pages are buyer-persona hubs that link out to the relevant object pages.

## Page-type breakdown

| Type | Count | Target range (issue) |
|---|---:|---|
| Category (hub) | 1 | (architectural, not counted in the issue's ranges) |
| Object | 19 | ~20–25 |
| Application | 9 | ~8–15 |
| Problem/process | 5 | ~5–10 |
| **Total** | **34** | 35–50 |

### Why not exactly 35–50, and why object count is at the low end

Three seed objects that were originally planned as standalone pages were **merged** into other pages once the evidence came back:
- Motor mount was *kept* standalone (OBJ06) but flagged low-priority/thin.
- **LiDAR mount** was merged into the sensor/camera mount page (no distinct SERP evidence — see cannibalization-map row 1).
- **Humanoid leg/knee parts** was folded into the humanoid application page rather than given its own object URL (competitors themselves don't split it out).

Two candidate application pages (cobot, inspection/field robot) and two candidate problem pages (standalone CMM/inspection, broad China-RFQ) were evaluated and **not** given full independent pages because the evidence didn't support them (weak/contaminated SERP, or giant-platform dominance). Per the issue's own quality bar — "A page is valid only if it has... evidence that the intent exists in live search" — the total came in at 34 rather than padded to the 35–50 floor. This is a deliberate, evidence-disciplined choice, not an oversight; see `market-summary.md` for the specific reasoning per excluded candidate.

## Site map

```
/robot-parts/                                          [CAT01] Hub — Custom Robot Parts Manufacturing
│
├── OBJECT PAGES (children of hub unless noted)
│   ├── /robot-joint-housing/                           [OBJ01] P0
│   │     └── /harmonic-reducer-housing/                [OBJ03] P2 — child of OBJ01 + OBJ02 (thin standalone evidence)
│   ├── /robot-actuator-housing/                        [OBJ02] P0
│   ├── /robot-shaft/                                   [OBJ04] P0
│   ├── /robot-bearing-housing/                         [OBJ05] P1 — cross-links OBJ01/OBJ02 (bearing seats often integrated)
│   ├── /robot-motor-mount/                              [OBJ06] P2 — thin; watch for merge into OBJ07
│   ├── /robot-mounting-bracket/                        [OBJ07] P0
│   ├── /gripper-fingers-jaws/                          [OBJ08] P0 — child of APP08
│   ├── /eoat-tooling-plate/                             [OBJ09] P0 — child of APP08
│   ├── /robot-base-pedestal/                            [OBJ10] P0
│   ├── /robot-arm-structural-links/                    [OBJ11] P2 — hub-style, child of APP04
│   ├── /robot-enclosure-shell/                          [OBJ12] P1
│   ├── /battery-enclosure-machining/                    [OBJ13A] P2 — VALIDATE EVIDENCE BEFORE BUILD; child of APP03
│   ├── /electronics-enclosure-machining/                [OBJ13B] P0
│   ├── /robot-chassis-fabrication/                      [OBJ14] P1 — child of APP03
│   ├── /sensor-camera-lidar-mount/                      [OBJ16] P1 — merged sensor+camera+LiDAR
│   ├── /rov-pressure-housing/                           [OBJ18] P1 — child of APP06
│   ├── /robot-cell-jig-fixture/                         [OBJ19] P2 — child of APP08, narrowly scoped
│   └── /prototype-multi-part-assembly/                  [OBJ20] P2 — child of PRB_A
│
├── APPLICATION PAGES  (/robot-parts/applications/...)
│   ├── humanoid-robot-parts/                            [APP01] P0 → children: OBJ01, OBJ02, OBJ03, OBJ04, OBJ05
│   ├── cobot-custom-parts/                               [APP02] P3-experimental → child of APP04
│   ├── amr-mobile-robot-parts/                           [APP03] P1 → children: OBJ14, OBJ12, OBJ13A, OBJ13B
│   ├── industrial-robot-parts/                           [APP04] P1 → children: OBJ01,02,04,05,06,07,11 (site hub for the broad, giant-platform-contested term — see notes)
│   ├── inspection-robot-parts/                           [APP05] P3-experimental → child of APP04
│   ├── underwater-rov-robot-parts/                       [APP06] P1 → child: OBJ18
│   ├── exoskeleton-parts/                                [APP07] P2
│   ├── eoat-automation-tooling/                          [APP08] P2 → children: OBJ08, OBJ09, OBJ19
│   └── startup-rd-robot-parts/                           [APP09] P2 → child of PRB_A (persona hub, not a new technical object)
│
├── CAPABILITY / PROBLEM PAGES  (/robot-parts/capabilities/... and /robot-parts/guides/...)
│   ├── prototype-to-production-machining/               [PRB_A] P0 → children: OBJ20, APP09
│   ├── 5-axis-machining-robot-parts/                     [PRB_B] P2 → links: OBJ01, OBJ02, OBJ07
│   ├── tight-tolerance-robot-machining/                  [PRB_C] P2 → links: OBJ01, OBJ05
│   ├── sheet-metal-fabrication-welding/                  [PRB_D] P1 → links: OBJ10, OBJ12, OBJ14
│   └── guides/how-to-source-china-cnc-manufacturer/      [PRB_E] P1 — informational, not a commercial head-term target
```

## Why each page exists (grouped explanation)

### Hub
- **CAT01 (`/robot-parts/`)** exists for navigation and trust-building (explaining the RFQ→China-supplier routing model), not to rank on the broad commercial head term itself — that term is confirmed giant-platform-dominated (Q050). It is the parent of every other page.

### Object pages — the primary acquisition layer
Each object page exists because at least one real, live search query returned a fragmented SERP with visible specialist manufacturers and no (or minimal) giant-platform/off-topic contamination **once framed with a "custom CNC machining" / "custom fabrication" qualifier** — see `intent-clusters.csv` for the specific evidence and confidence level behind each one. Three pages (OBJ03, OBJ06, OBJ11) are explicitly flagged lower-priority/thin and positioned as children of stronger pages rather than independent top-level nav items, because the evidence for them was real but weaker than the rest of the set. OBJ13A carries an explicit "validate before build" flag because its narrow framing was not directly search-tested.

### Application pages — buyer-persona hubs
These exist where a buyer's *type* (humanoid company, AMR company, ROV company, exoskeleton company, industrial integrator) needs one page that hubs across several object pages, matching how competitors themselves organize dedicated `/robotics/` or `/humanoid/` vertical pages. Two (APP02, APP05) are marked experimental because their exact search phrasing returned weak/contaminated evidence — they exist in the site map as placeholders/sections within their parent (APP04) rather than fully independent, promotable only if a follow-up search pass finds distinct evidence. APP04 (industrial robot parts) is a necessary hub even though its broad term is platform-dominated, because it is where a large share of buyers will naturally land and needs to exist for navigation and internal linking, not for head-term ranking.

### Problem/process pages — cross-cutting capability content
These exist where the SAME specialist competitor set repeatedly appeared across *multiple different object searches* (confirming a genuinely shared, cross-cutting capability rather than object-specific content) — most clearly for prototype/low-volume manufacturing (PRB_A, evidenced by near-identical competitor sets in Q037 and Q047) and sheet-metal fabrication/welding (PRB_D, evidenced by the same specialist set appearing in both the base/pedestal and enclosure searches, Q023/Q027). PRB_B and PRB_C exist on thinner, more generic evidence and are explicitly flagged to require robot-specific technical substance written into the page itself, since the SERP doesn't already provide a differentiated cluster for them. PRB_E is a deliberately informational (not commercial-head-term) page, since the commercial framing of "China CNC RFQ" is giant-platform-dominated.

## Explicit non-goals for this pilot (per Human Gate)

- No pages are published or deployed.
- No production website structure is changed.
- This document and the CSVs are a **proposal** for the human owner to review; the next action is human review and prioritization (see PR description), not implementation.
