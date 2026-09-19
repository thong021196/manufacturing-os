# Additive Engineering Australia

- **Supplier ID (seed data)**: `sup-au-001`
- **Country**: Australia
- **HQ / Geography**: Factory 1/42 McArthurs Rd, Altona North, VIC 3025.
  (Initial assumption during research scoping was that this company was
  Perth/WA-based based on the name "Additive Engineering Australia" —
  that assumption was wrong; confirmed VIC address is recorded here.) [Additive Engineering Australia — Contact Us](https://additiveengineering.com.au/contact-us/)
- **Facility type**: `single_facility`.
- **Captured**: 2026-09-19

## Important framing note

This company's primary declared business is **metal additive
manufacturing (3D printing)**, not CNC/sheet-metal job-shop work — CNC
machining is offered as a secondary/complementary capability. It is
included in this research because CNC machining is explicitly listed
among its services, but its core positioning is AM-first, which should
weight its suitability rating relative to CNC-first suppliers in this
set.

## Process capabilities (declared)

Metal additive manufacturing (primary). CNC milling — 3-axis, 4-axis, and
5-axis "indexed machining processes" — and CNC turning, described as
delivering machining "to high precision for machined tools, prototypes
and low volume production." [Additive Engineering Australia — CNC Machining](https://additiveengineering.com.au/3d-printing-services/cnc-machining/)

## Materials (declared)

Biocompatible titanium (Ti6Al4V), stainless steel 17-4PH, CoCr alloy,
Inconel Nickel 718, Hastelloy, and PA2200 (SLS nylon, additive process).
[Additive Engineering Australia — homepage](https://additiveengineering.com.au/)

## Axis count / machine types

3-axis, 4-axis, 5-axis CNC milling stated; specific machine
models/brands not published in pages read for this profile. **Partially
captured.**

## Machine envelope / max part size

Not published in pages read for this profile. **Unknown.**

## Tolerance claims (declared)

CNC: **±0.5 mm for metals, ±0.2 mm for plastics.** Separately, "dimensional
accuracies for grinding machines are at 0.05 microns" — this figure is
almost certainly describing a specific finishing/grinding operation (not
general CNC milling/turning tolerance) and should not be read as the
company's general machining tolerance; flagged explicitly to avoid
misinterpretation. [Additive Engineering Australia — CNC Machining](https://additiveengineering.com.au/3d-printing-services/cnc-machining/)

## Finish capabilities

Not itemized beyond the grinding reference above. **Unknown / not
captured in detail.**

## Threads / inserts / secondary operations

Not itemized in pages read for this profile. **Unknown.**

## QC / inspection capability (declared)

Manufacturing "modelled to meet AS9100 standards" and "client-audited to
meet ISO13485 standards for medical devices." **Important distinction**:
"modelled to meet" is not the same as formally certified to AS9100, and
"client-audited" means a specific customer performed the audit, not an
accredited third-party certification body — both are recorded here as
weaker than a formal certification claim. [Additive Engineering Australia — homepage](https://additiveengineering.com.au/)

## Quantity / MOQ / prototype-low-volume fit (declared)

Positioned for "prototypes and low volume production" but no specific
numeric quantity range or MOQ published. [Additive Engineering Australia — CNC Machining](https://additiveengineering.com.au/3d-printing-services/cnc-machining/)

## Lead-time claims

Not published in pages read for this profile. **Unknown.**

## Certifications (declared, self-reported, not independently verified)

**ISO 9001:2015 certified** (stated as an actual certification, distinct
from the "modelled to meet AS9100" / "client-audited ISO13485" language
above, which are explicitly weaker claims). [Additive Engineering Australia — homepage](https://additiveengineering.com.au/)

## Industries served (declared)

Medical, Aviation, Space, Defence, Maritime, Resources. [Additive Engineering Australia — homepage](https://additiveengineering.com.au/) No
robotics/automation industry mention found.

## Source / evidence

- [Additive Engineering Australia — homepage](https://additiveengineering.com.au/) — supplier_marketing, captured 2026-09-19
- [Additive Engineering Australia — CNC Machining](https://additiveengineering.com.au/3d-printing-services/cnc-machining/) — supplier_marketing, captured 2026-09-19
- [Additive Engineering Australia — Contact Us](https://additiveengineering.com.au/contact-us/) — supplier_marketing, captured 2026-09-19

## Unknown / missing fields

- Machine envelope / max part size: unknown.
- Finish capability list: unknown (beyond one grinding-tolerance
  reference of uncertain applicability).
- Threads/inserts/secondary ops: unknown.
- Quantity range / MOQ / lead time: unknown.
- Robotics/automation-specific case study: none found.
- Whether AS9100/ISO13485-adjacent claims reflect any real audit trail:
  unknown — explicitly weaker language used by the supplier itself
  ("modelled to meet," "client-audited").

## Suitability for prototype/low-volume robotics work

**Secondary/adjacent fit, not a core fit.** As a CNC option specifically,
capability is real but under-documented (2mm-class tolerance claims are
loose relative to typical robotics mechanical-part requirements, and
machine envelope/lead time are unpublished). Its actual strength — metal
additive manufacturing — is out of scope for the CNC/sheet-metal-focused
wedge as currently defined, though it could be relevant later for
AM-specific robotics components (e.g., lightweight brackets, low-volume
tooling) if that scope expands.
