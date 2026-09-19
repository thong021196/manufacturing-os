# Xometry

- **Supplier ID (seed data)**: `sup-us-001`
- **Country**: United States
- **HQ / Geography**: Gaithersburg, Maryland — but operates as a **digital
  manufacturing network**, not a single facility. States it connects
  buyers with "10,000+ manufacturers across the US, Europe, and Asia"
  through its "Manufacturing Partner Network." [Xometry — How It Works](https://www.xometry.com/how-xometry-works/)
- **Facility type**: `distributed_network` (platform/broker, order
  fulfilled by a vetted third-party shop selected by Xometry, not by
  Xometry's own single factory floor).
- **Captured**: 2026-09-19

## Process capabilities (declared)

CNC milling, CNC turning (incl. Swiss), sheet metal fabrication, 3D
printing, injection molding, and other processes — "more than 70
materials across over 20 processes." [Xometry — Robotics](https://www.xometry.com/robotics/)

## Materials (declared)

Stainless steel, aluminum alloys, titanium, composites, plastics, and
others (70+ materials network-wide, not fully enumerated in the pages
read). [Xometry — Aerospace CNC Machining](https://www.xometry.com/capabilities/cnc-machining-service/aerospace/)

## Axis count / machine types

Not published at the network level — by design, Xometry does not
disclose which specific partner shop or machine will run a given job
before it is quoted. **Unknown / not applicable to a network model.**

## Machine envelope / max part size

Not published. **Unknown.**

## Tolerance claims (declared)

"Standard tight tolerances between +/-0.001″ – 0.005″, or to the exact
specifications of your project," with GD&T callouts supported. [Xometry — Precision CNC Machining](https://www.xometry.com/capabilities/cnc-machining-service/precision-cnc-machining/)

## Finish capabilities

Not itemized in pages read for this profile beyond general process pages;
Xometry's site lists finishing as a configurable option at quote time.
**Not captured in detail — treat as thin.**

## Threads / inserts / secondary operations

Not specifically itemized in pages read. **Unknown / not captured.**

## QC / inspection capability (declared)

Operates an "ITAR Registered" Quality Assurance Lab; states ISO 9001:2015,
ISO 13485, IATF 16949:2016, and AS9100D certified quality management
system, ITAR registration, ISO 2768 compliance, and CMMC Level 2. [Xometry — Quality Lab](https://www.xometry.com/quality-lab/) [Xometry — Manufacturing Standards](https://www.xometry.com/manufacturing-standards/)

**Important caveat**: these certifications describe Xometry's own
platform-level quality program / QA lab. Because fulfillment happens
through a third-party partner network, the specific shop that runs any
individual job may or may not itself hold every one of these
credentials — this is not independently confirmed either way in this
research pass.

## Quantity / MOQ / prototype-low-volume fit (declared)

**No minimum order quantity.** [Xometry — Robotics](https://www.xometry.com/robotics/) Xometry's own marketing
explicitly targets both single prototypes and production runs through the
same instant-quote flow.

## Lead-time claims

Not quantified with a specific day-range in the pages read for this
profile; Xometry's instant-quote system returns a case-by-case lead time
at quote time rather than a single advertised figure. **Not captured as a
specific number — unknown.**

## Certifications (declared, self-reported, not independently verified)

ISO 9001:2015, ISO 13485, IATF 16949:2016, AS9100D, ITAR registration,
ISO 2768 compliance, CMMC Level 2. [Xometry — Manufacturing Standards](https://www.xometry.com/manufacturing-standards/)

## Source / evidence

- [Xometry — Robotics](https://www.xometry.com/robotics/) — supplier_marketing, captured 2026-09-19
- [Xometry — How It Works](https://www.xometry.com/how-xometry-works/) — supplier_marketing, captured 2026-09-19
- [Xometry — Precision CNC Machining](https://www.xometry.com/capabilities/cnc-machining-service/precision-cnc-machining/) — supplier_marketing, captured 2026-09-19
- [Xometry — Manufacturing Standards](https://www.xometry.com/manufacturing-standards/) — supplier_marketing, captured 2026-09-19
- [Xometry — Quality Lab](https://www.xometry.com/quality-lab/) — supplier_marketing, captured 2026-09-19
- [Xometry — Asylon case study](https://www.xometry.com/resources/case-studies/case-study-asylon-autonomous-drones/) — supplier_marketing, captured 2026-09-19

## Robotics/automation case evidence (rare in this dataset)

Xometry is the **only** supplier in this 13-company research set with a
named, published robotics/automation customer case study:

- **Asylon Robotics** — Xometry manufactured a "weather-proof, stable
  sheet metal shell" for Asylon's autonomous drone docking station, plus
  ongoing prototyping/production parts as the startup scaled. [Xometry — Asylon case study](https://www.xometry.com/resources/case-studies/case-study-asylon-autonomous-drones/)
- **RobCo** (Germany) — used Xometry's CNC machining and 3D printing to
  accelerate production of modular robot kits. [Xometry — Robotics](https://www.xometry.com/robotics/)

## Unknown / missing fields

- Axis count / specific machine types: unknown (network model).
- Machine envelope / max part size: unknown.
- Finish capability list: not captured in detail.
- Threads/inserts/secondary ops list: unknown.
- Lead-time as a specific number: unknown (quote-dependent).
- Whether the specific partner shop used for a given order holds the
  platform-level certifications: unknown.

## Suitability for prototype/low-volume robotics work

**Plausible strong fit, with a structural caveat.** No MOQ, broad
material/process range, and — uniquely in this dataset — an actual
robotics/drone customer story make Xometry a credible option for
prototype and low-volume robotics parts. The caveat is architectural, not
capability-related: Xometry is a network, so "declared capability" here
describes the platform's stated envelope, not one physical shop's actual
machine list. If Manufacturing OS ever routes work through Xometry, the
`Supplier` object should be flagged as a network/broker (see
`facilityType` in `seed-suppliers.json`) so downstream matching logic
doesn't treat it the same way as a single job shop.
