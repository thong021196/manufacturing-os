# Approved Sheet Metal (ASM)

- **Supplier ID (seed data)**: `sup-us-005`
- **Country**: United States
- **HQ / Geography**: Hudson, New Hampshire. [Approved Sheet Metal — ISO 9001:2015 Certification](https://www.approvedsheetmetal.com/blog/approved-sheet-metal-achieves-iso-90012015)
- **Facility type**: `single_facility`.
- **Captured**: 2026-09-19

## Process capabilities (declared)

Sheet metal fabrication: laser cutting, forming/bending (bend-to-edge
tolerance is explicitly documented, implying press-brake forming), and
general precision sheet-metal fabrication for prototype and low-volume
production. No CNC milling/turning capability found — this is a
**sheet-metal-only** specialist. [Approved Sheet Metal — Prototype Sheet Metal](https://www.approvedsheetmetal.com/prototype-sheet-metal) [Approved Sheet Metal — Low Volume Production Sheet Metal](https://www.approvedsheetmetal.com/low-volume-production-sheet-metal)

## Materials (declared)

Stainless steel, aluminum (specifically 6061-T6 and 5052-H32), brass.
[Approved Sheet Metal — Aerospace Sheet Metal Fabrication](https://www.approvedsheetmetal.com/blog/aerospace-sheet-metal-fabrication)

## Axis count / machine types

Not applicable in the same sense as CNC milling/turning (sheet-metal
process); specific laser/press-brake equipment models not published in
pages read for this profile. **Unknown.**

## Machine envelope / max part size

Not published in pages read for this profile. **Unknown.**

## Tolerance claims (declared)

Published in a formal engineering document ("EF-001 Recommended Default
Sheet Metal Tolerances Rev A"), which is more specific/technical than
typical marketing copy, though still self-published:
- Features on the same flat surface: typically **±0.005 in.**
- Bend-to-edge dimensions: typically **±0.010 in.**
[Approved Sheet Metal — EF-001 Tolerance Spec (PDF)](https://www.approvedsheetmetal.com/wp-content/uploads/2023/09/Approved-Sheet-Metal-EF-001_Recommended-Default-Sheet-Metal-Tolerances_Rev-A.pdf) — recorded as
`documentation_verified` / `medium` confidence rather than
`supplier_marketing` / `low`, since it is a dimensioned technical spec
sheet rather than sales copy, while still not independently
cross-confirmed by a third party.

## Finish capabilities

Not itemized in pages read for this profile beyond general aerospace
finishing context. **Unknown / not captured in detail.**

## Threads / inserts / secondary operations

Not itemized in pages read for this profile. **Unknown.**

## QC / inspection capability (declared)

AS9102 capability is referenced (First Article Inspection standard used
in aerospace), implying formal FAI inspection capability, though not
elaborated with specific metrology equipment. [Approved Sheet Metal — Custom Sheet Metal Certifications](https://www.approvedsheetmetal.com/blog/certifications-custom-precision-sheet-metal-part-buyers)

## Quantity / MOQ / prototype-low-volume fit (declared)

Explicitly positions itself as "an American job shop manufacturer of
custom precision **prototype and low volume production** sheet metal
fabricated parts," with "Prototype Sheet Metal Parts in 2–5 Days." No
specific numeric MOQ or quantity range published. [Approved Sheet Metal — Prototype Sheet Metal](https://www.approvedsheetmetal.com/prototype-sheet-metal)

## Lead-time claims (declared)

**"2–5 Days"** for prototype sheet metal parts. [Approved Sheet Metal — Prototype Sheet Metal](https://www.approvedsheetmetal.com/prototype-sheet-metal)

## Certifications (declared, self-reported, not independently verified)

ISO 9001:2015 (achieved January 2024), ITAR registered, AS9102 capable.
[Approved Sheet Metal — ISO 9001:2015 Certification](https://www.approvedsheetmetal.com/blog/approved-sheet-metal-achieves-iso-90012015)

## Source / evidence

- [Approved Sheet Metal — Prototype Sheet Metal](https://www.approvedsheetmetal.com/prototype-sheet-metal) — supplier_marketing, captured 2026-09-19
- [Approved Sheet Metal — Low Volume Production Sheet Metal](https://www.approvedsheetmetal.com/low-volume-production-sheet-metal) — supplier_marketing, captured 2026-09-19
- [Approved Sheet Metal — ISO 9001:2015 Certification announcement](https://www.approvedsheetmetal.com/blog/approved-sheet-metal-achieves-iso-90012015) — supplier_marketing, captured 2026-09-19
- [Approved Sheet Metal — Custom Sheet Metal Certifications](https://www.approvedsheetmetal.com/blog/certifications-custom-precision-sheet-metal-part-buyers) — supplier_marketing, captured 2026-09-19
- [Approved Sheet Metal — Aerospace Sheet Metal Fabrication](https://www.approvedsheetmetal.com/blog/aerospace-sheet-metal-fabrication) — supplier_marketing, captured 2026-09-19
- [Approved Sheet Metal — EF-001 Recommended Default Sheet Metal Tolerances (PDF)](https://www.approvedsheetmetal.com/wp-content/uploads/2023/09/Approved-Sheet-Metal-EF-001_Recommended-Default-Sheet-Metal-Tolerances_Rev-A.pdf) — documentation_verified, captured 2026-09-19

## Unknown / missing fields

- CNC milling/turning capability: **not offered** (sheet-metal-only shop —
  relevant for the wedge's brackets/enclosures, not for machined
  housings/mounts requiring milling).
- Equipment models / machine envelope: unknown.
- Finish capability list: unknown.
- Quantity range / MOQ number: unknown.
- Robotics/automation-specific case study: none found (aerospace is the
  emphasized industry).

## Suitability for prototype/low-volume robotics work

**Good fit for the sheet-metal slice of the wedge specifically**
(brackets, enclosures, EOAT mounting plates cut/formed from sheet stock),
**not a fit on its own for milled/turned parts** (actuator housings,
gripper jaws requiring 3D machined geometry) since it does not offer CNC
milling/turning. Explicit prototype positioning, a published lead time
(2–5 days), and a documented tolerance spec sheet make it one of the
better-documented suppliers in this set for its process niche.
