# Fathom Manufacturing (Fathom Digital Manufacturing Corporation, NYSE: FATH)

- **Supplier ID (seed data)**: `sup-us-006`
- **Country**: United States
- **HQ / Geography**: 1050 Walnut Ridge Drive, Hartland, WI 53029.
  Publicly traded on NYSE under ticker **FATH**. Operates **12
  manufacturing facilities** totaling "nearly 450,000 square feet of
  manufacturing capacity" across the US, per its own 10-K SEC filing —
  the single strongest-sourced fact in this entire research package,
  since it comes from a regulatory filing rather than marketing copy. [Fathom 10-K (SEC EDGAR)](https://www.sec.gov/Archives/edgar/data/1836176/000095017023012198/fath-20221231.htm)
  Named facility locations referenced in site content include Denver, CO
  (sheet metal) and Austin, TX (tight-tolerance CNC), among others. [Fathom — Denver, CO Location](https://fathommfg.com/locations/denver-co/) [Fathom — Austin, TX Location](https://fathommfg.com/locations/austin-tx/)
- **Facility type**: `distributed_network` — but unlike Xometry/Protolabs,
  Fathom owns all 12 facilities directly (not a third-party broker
  network); it is a single company operating multiple plants.
- **Captured**: 2026-09-19

## Process capabilities (declared)

CNC machining — 3-axis and 5-axis milling and turning. Sheet metal
fabrication (laser cutting, forming). Also additive manufacturing and
injection molding across the wider company (not itemized fully here
since out of scope for CNC/sheet-metal focus). [Fathom — CNC Machining](https://fathommfg.com/capabilities/cnc-machining/) [Fathom — Denver, CO Location](https://fathommfg.com/locations/denver-co/)

## Materials (declared)

- CNC: titanium, Inconel, hardened steel, plus standard metals/plastics
  (full list not itemized in pages read). [Fathom — CNC Machining](https://fathommfg.com/capabilities/cnc-machining/)
- Sheet metal: aluminum, stainless steel, steel alloys. [Fathom — Denver, CO Location](https://fathommfg.com/locations/denver-co/)

## Axis count / machine types

CNC: "3 & 5-axis milling and turning" explicitly stated. [Fathom — CNC Machining](https://fathommfg.com/capabilities/cnc-machining/) No
specific machine models/counts published in pages read for this profile.

## Machine envelope / max part size

Not published in pages read for this profile. **Unknown.**

## Tolerance claims (declared)

- CNC machining: **±0.001″ to 0.005″.** [Fathom — CNC Machining](https://fathommfg.com/capabilities/cnc-machining/)
- Sheet metal (laser cutting): **±0.005″**, with tighter tolerances
  possible depending on the project; laser cutting handles 0.010″ to
  0.50″ material thickness across aluminum, steel, and stainless. [Fathom — Denver, CO Location](https://fathommfg.com/locations/denver-co/)

## Finish capabilities

Not itemized in pages read for this profile beyond general surface
finishing implied by sheet-metal fabrication scope. **Unknown / not
captured in detail.**

## Threads / inserts / secondary operations

Not specifically itemized in pages read for this profile. **Unknown.**

## QC / inspection capability (declared)

Certified to APQP and PPAP at the Denver facility specifically —
automotive/aerospace-grade production part approval processes. [Fathom — Denver, CO Location](https://fathommfg.com/locations/denver-co/)

## Quantity / MOQ / prototype-low-volume fit (declared)

Not published with a specific numeric range in pages read for this
profile; general positioning is "condense your product development
cycle" (prototype-to-production continuity implied, not quantified). [Fathom — Condense Your Product Development Cycle](https://fathommfg.com/condense-your-product-development-cycle)

## Lead-time claims

Not published in pages read for this profile. **Unknown.**

## Certifications (declared, self-reported except where noted)

ISO 9001:2015, AS9100 Rev D, ITAR registration, NIST 800-171 compliance,
ISO 13485:2016 (varies by facility — the Denver facility specifically is
stated as "ISO 9001:2015 compliant and ITAR registered, and certified in
APQP and PPAP"). [Fathom — Denver, CO Location](https://fathommfg.com/locations/denver-co/) [Fathom — Aerospace & Defense](https://fathommfg.com/industries/aerospace-defense/)
Public-company status and SEC filing existence (`documentation_verified`
/ `high`) do **not** by themselves verify any individual quality
certification — those remain `supplier_marketing` / `low`–`medium`.

## Source / evidence

- [Fathom 10-K, SEC EDGAR (facility count, HQ address, public company status)](https://www.sec.gov/Archives/edgar/data/1836176/000095017023012198/fath-20221231.htm) — documentation_verified, high confidence, captured 2026-09-19
- [Fathom — CNC Machining](https://fathommfg.com/capabilities/cnc-machining/) — supplier_marketing, captured 2026-09-19
- [Fathom — Denver, CO Location (sheet metal)](https://fathommfg.com/locations/denver-co/) — supplier_marketing, captured 2026-09-19
- [Fathom — Austin, TX Location (CNC)](https://fathommfg.com/locations/austin-tx/) — supplier_marketing, captured 2026-09-19
- [Fathom — Aerospace & Defense](https://fathommfg.com/industries/aerospace-defense/) — supplier_marketing, captured 2026-09-19
- [Fathom — Condense Your Product Development Cycle](https://fathommfg.com/condense-your-product-development-cycle) — supplier_marketing, captured 2026-09-19

## Unknown / missing fields

- Machine envelope / max part size: unknown.
- Finish capability list: unknown.
- Threads/inserts/secondary ops: unknown.
- Quantity range / MOQ / lead time: unknown, not published with specific
  numbers.
- Which of the 12 facilities would actually fulfill a given robotics
  part order (process/material capability likely varies by site):
  unknown from desk research — would need per-facility confirmation.
- Robotics/automation-specific case study: none found in pages read
  (aerospace & defense industry page found; no robotics-specific page).

## Suitability for prototype/low-volume robotics work

**Plausible fit, with above-average confidence in the company's basic
facts** (public-company transparency via SEC filings is unusual and
valuable in this dataset — most job shops offer no independently
verifiable facts at all). Multi-process (CNC + sheet metal + AM + molding)
under one corporate umbrella is attractive for a robotics customer who
needs both machined and sheet-metal parts. The tradeoff is that "Fathom"
as a `Supplier` record actually spans 12 distinct facilities with
possibly different equipment and quality certifications per site — any
future matching logic should model Fathom at the facility level, not as
one undifferentiated capability record, once specific facility data is
gathered.
