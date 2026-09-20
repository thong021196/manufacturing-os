# Search-Intent Pilot — Site Architecture (34 pages: 19 validated, 13 validate-first, 2 deferred)

Issue #20, Pass 6, plus the Human Gate fix pass on PR #21 (deepened P0/P1 query evidence, `build_status` field, tolerance-sourcing cleanup — see `market-summary.md`'s "Final summary" section). This is a **proposed** site map for a 35-page pilot (34 pages proposed; see "Why not exactly 35–50" below), grounded in the evidence in `query-candidates.csv` (115 queries total), `intent-clusters.csv`, `pilot-pages.csv`, and `cannibalization-map.csv`. **Nothing here is published or deployed.** This document explains why each page exists and how it relates to its parent/children.

**Two different counts matter here and should not be conflated**: the **34-page candidate architecture** (the full proposed site map below) and the **19-page validated/build-ready set** (`build_status = validated` in `pilot-pages.csv`). The other 15 candidate pages are either `validate_first` (13 — real evidence exists but needs a further validation pass before full content investment) or `defer` (2 — APP02, APP05, explicitly experimental/UNKNOWN per the owner's review). See the "Build-status breakdown" section below for the full list.

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

**The fix pass re-confirmed this decision**: the deepened P0/P1 query pass (65 additional queries) found no new evidence that would justify adding pages toward the 35–50 floor, and it confirmed (rather than weakened) several of the original exclusion decisions — e.g. the LiDAR-mount merge was independently reconfirmed at Q109, and the cobot exclusion was refined (not overturned) by Q069/Q079. The page count stays at 34.

### Build-status breakdown (fix-pass addition)

Every page in `pilot-pages.csv` now carries a `build_status` field: `validated` (evidence supports building now), `validate_first` (real evidence exists, but a further validation pass is recommended before full content investment), or `defer` (owner-flagged experimental/UNKNOWN, not to be built this pilot). This is a separate axis from `priority` (P0–P3) — a P1 page can be `validate_first` (e.g. OBJ14) just as a P2 page can be `validate_first` (most of them are).

| build_status | Count | Pages |
|---|---:|---|
| `validated` | 19 | CAT01, OBJ01, OBJ02, OBJ04, OBJ05, OBJ07, OBJ08, OBJ09, OBJ10, OBJ12, OBJ13B, OBJ16, OBJ18, APP01, APP04, APP06, PRB_A, PRB_D, PRB_E |
| `validate_first` | 13 | OBJ03, OBJ06, OBJ11, OBJ13A, OBJ14, OBJ19, OBJ20, APP03, APP07, APP08, APP09, PRB_B, PRB_C |
| `defer` | 2 | APP02, APP05 |
| **Total** | **34** | |

**19 of 34 (56%) candidate pages are validated/build-ready today.** The remaining 15 are legitimate parts of the candidate architecture (none were padded in or deleted to hit a number) but need either a further validation pass (13 pages — mostly P2 objects with thin standalone original evidence, plus OBJ14 which the deepened pass showed is more fragile than first assessed) or stay explicitly deferred (APP02, APP05, per the owner's direct instruction). See `pilot-pages.csv`'s `build_status` column for the one-line rationale behind each page's status, and `market-summary.md`'s "Final summary" section for the full accounting.

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
- No app/frontend changes were made in this fix pass, and no merge occurred; the fix pass is scoped entirely to `docs/research/search-intent-pilot/` per the owner's review comment.
