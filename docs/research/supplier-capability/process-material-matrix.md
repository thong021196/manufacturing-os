# Process × Material × Supplier Matrix

Cross-cutting summary of the 13 suppliers researched under
`docs/research/supplier-capability/suppliers/`. All cells reflect
**`declared` capability only** — nothing here is `observed`. "✓" means the
process/material was explicitly stated on a page read for that supplier's
profile; a blank means it was not found (which may mean the supplier
doesn't offer it, or simply doesn't publish it — see each profile's
"unknown / missing fields" section, and do not read a blank as a
confirmed "no").

## Process coverage

| Supplier | Country | CNC Milling | CNC Turning | Sheet Metal Fab | Laser Cutting | Welding | Assembly | Notes |
|---|---|---|---|---|---|---|---|---|
| Xometry | US | ✓ | ✓ | ✓ | — | — | — | Network; process availability is platform-wide, not one shop |
| Protolabs | US | ✓ | ✓ | ✓ (via network) | — | — | — | Hybrid own-factory + partner network |
| American Precision Tool | US | ✓ | ✓ (incl. Swiss) | — | — | — | — | Precision grinding also offered |
| Vanderhulst Associates | US | ✓ | ✓ (incl. live tooling) | — | — | — | ✓ | Dedicated prototyping/small-batch line |
| Approved Sheet Metal | US | — | — | ✓ | ✓ (implied) | — | — | Sheet-metal-only specialist |
| Fathom Manufacturing | US | ✓ (3/5-axis) | ✓ | ✓ | ✓ | — | — | 12 facilities; capability may vary by site |
| HD Machining | US | ✓ (3/4/5-axis) | ✓ | — | — | — | — | Named equipment: Haas 3-axis mills |
| Additive Engineering Australia | AU | ✓ (3/4/5-axis) | ✓ | — | — | — | — | Primary business is metal AM, not CNC |
| 3D Prototyping | AU | ✓ | (unclear) | ✓ | ✓ | — | — | Only AU supplier confirmed dual CNC + sheet metal |
| CNC Protos / ArpTech | AU | ✓ (3/4-axis) | ✓ (3/4-axis) | — | — | — | — | No 5-axis claim found |
| Formero | AU | ✓ | (unclear) | — | — | — | — | Primary business is AM + injection molding |
| DVR Engineering | AU | ✓ (3/4/5-axis) | ✓ (live tooling) | ✓ | ✓ | ✓ | ✓ | Broadest single-facility process range in AU sample; 25+ machining centres |
| ALMEC | AU | — | — | ✓ | ✓ (named: LVD3015 Phoenix 6kW) | ✓ | — | Sheet-metal/laser specialist only |

**Observation**: 4 of 7 US suppliers and 4 of 6 AU suppliers publish only
one side of CNC-vs-sheet-metal, not both. Suppliers confirmed to genuinely
offer **both** CNC machining and sheet-metal fabrication in-house are:
Xometry (network), Protolabs (hybrid network), Fathom Manufacturing (12
facilities, capability may not be co-located), 3D Prototyping, and DVR
Engineering. Of these, **DVR Engineering** is the only one that is both a
single physical facility and confirmed dual-process with named equipment
counts — the strongest "one-stop" candidate in the whole set for a
robotics order needing multiple operations.

## Material coverage (declared)

| Supplier | Aluminum | Stainless Steel | Titanium | Engineering Plastics (PEEK/Delrin/Nylon) | Exotic alloys (Inconel/Hastelloy/CoCr/MP35N) | Brass/Copper |
|---|---|---|---|---|---|---|
| Xometry | ✓ | ✓ | ✓ | ✓ (composites/plastics, general) | — (not itemized) | — (not itemized) |
| Protolabs | ✓ (general) | ✓ (general) | (not itemized) | ✓ (general) | — | — |
| American Precision Tool | ✓ (6061/7075) | ✓ (incl. 17-4) | ✓ | ✓ (PEEK, Delrin) | ✓ (Inconel, nickel) | — |
| Vanderhulst Associates | ✓ | ✓ | ✓ | ✓ (general) | ✓ (Inconel, MP35N) | — |
| Approved Sheet Metal | ✓ (6061-T6, 5052-H32) | ✓ | — | — | — | ✓ (brass) |
| Fathom Manufacturing | ✓ | ✓ | ✓ | (not itemized) | ✓ (Inconel, hardened steel) | — |
| HD Machining | ✓ | ✓ | ✓ | ✓ (general) | ✓ (Kovar, Invar, Hastelloy, molybdenum) | ✓ (copper) |
| Additive Engineering Australia | — (not itemized) | ✓ (17-4PH) | ✓ (Ti6Al4V, biocompatible) | ✓ (PA2200, SLS) | ✓ (Inconel 718, Hastelloy, CoCr) | — |
| 3D Prototyping | ✓ (general) | ✓ (general) | — (not itemized) | ✓ (general "engineering plastics") | — | ✓ (brass, sheet metal) |
| CNC Protos / ArpTech | ✓ (general, not itemized) | (unclear) | — | ✓ (general "plastics") | — | — |
| Formero | — (not itemized) | — | — | — | — | — |
| DVR Engineering | ✓ | ✓ | ✓ | ✓ (general "plastic") | — (bronze noted, not exotic superalloys) | ✓ (brass, bronze, copper) |
| ALMEC | ✓ | ✓ (mild + stainless) | ✓ | — | — | ✓ (brass, copper) |

**Observation**: Aluminum and stainless steel are near-universal across
the set (expected — the two default metals for robotics brackets/
housings). Titanium is claimed by roughly half the suppliers. Exotic
superalloys (Inconel, Hastelloy, MP35N, CoCr) — relevant mainly for
higher-spec actuator/EOAT components — are claimed by only 5 of 13
suppliers (American Precision Tool, Vanderhulst, Fathom, HD Machining,
Additive Engineering Australia), and 4 of those 5 are US-based; the
Australian sample has comparatively weak declared exotic-material depth
outside Additive Engineering Australia.

## Prototype / low-volume positioning (declared)

| Supplier | No stated MOQ | Explicit quantity range given | Explicit lead-time claim given |
|---|---|---|---|
| Xometry | ✓ | — | — (case-by-case, instant quote) |
| Protolabs | — | ✓ (25–10,000+ molding; up to ~1M CNC at scale) | ✓ ("as fast as 1 day" on eligible parts) |
| American Precision Tool | — | — | — |
| Vanderhulst Associates | — | — (named service line, no number) | — |
| Approved Sheet Metal | — | — | ✓ ("2–5 days" prototype) |
| Fathom Manufacturing | — | — | — |
| HD Machining | — | — | — |
| Additive Engineering Australia | — | — | — |
| 3D Prototyping | ✓ | — | — |
| CNC Protos / ArpTech | — | ✓ ("1 to 1,000+"; example of 500-unit batch) | ✓ ("10–12 business days") |
| Formero | — | — | — |
| DVR Engineering | — | — | — |
| ALMEC | — | — | — |

**Observation**: only 5 of 13 suppliers publish any concrete,
quantified prototype/low-volume commitment (no-MOQ statement, a quantity
range, or a lead time) — Xometry, Protolabs, Approved Sheet Metal, 3D
Prototyping, and CNC Protos/ArpTech. The other 8 rely on qualitative
language ("prototype to production," "single machined parts as well as
high volumes") without a checkable number. This is consistent with the
README's coverage-gaps finding that quantity/lead-time data is the
weakest structured field across the dataset.

## Robotics/automation-specific evidence

Only **Xometry** has a published, named robotics/automation customer
case study (Asylon autonomous drones; RobCo modular robot kits). Every
other supplier's robotics fit in this research is an inference from
general tolerance/material/prototype positioning — see each profile's
"Suitability" section for the specific reasoning, and treat this column
as the single largest evidentiary gap in the dataset relative to the
issue's stated wedge.
