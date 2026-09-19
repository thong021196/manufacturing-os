# CNC Protos (division of ArpTech Pty Ltd)

- **Supplier ID (seed data)**: `sup-au-003`
- **Country**: Australia
- **HQ / Geography**: Melbourne, VIC. `cncprotos.com.au` is described as
  "powered by" ArpTech Pty Ltd, a privately owned Australian company;
  in business "20 years" / "since 2001" (self-reported, not
  cross-checked). [CNC Protos — About](https://www.cncprotos.com.au/about.html) [ArpTech — About](https://www.arptech.com.au/about.htm)
- **Facility type**: `single_facility`.
- **Captured**: 2026-09-19

## Process capabilities (declared)

CNC milling and turning of metal and plastic parts, 3-axis and 4-axis
capability explicitly stated (no 5-axis claim found — flagged as a
possible constraint for complex undercut geometry). Parent company
ArpTech also offers 3D printing (SLA/FDM/SLS), vacuum casting, and rapid
tooling as adjacent services. [CNC Protos — CNC Machining](https://www.cncprotos.com.au/) [ArpTech — CNC Machining](https://www.arptech.com.au/cnc.htm)

## Materials (declared)

Described generally as "a wide range of material selection, including
plastics and metals" — no specific alloy list captured in pages read for
this profile. **Thin / not itemized.**

## Axis count / machine types

**3-axis and 4-axis** CNC milling and turning explicitly stated; no
5-axis capability claimed. Specific machine models not published. [CNC Protos — About](https://www.cncprotos.com.au/about.html)

## Machine envelope / max part size

Not published in pages read for this profile. **Unknown.**

## Tolerance claims (declared)

Works to **DIN ISO 2768-m** standard. This is a general/coarse tolerance
class used as a design default (medium tolerance class under ISO 2768-1),
not a tight-tolerance claim — recorded as stated, with the caveat that it
should not be read as evidence of tight-tolerance capability the way a
specific ± mm/in figure would be. [ArpTech — CNC Machining](https://www.arptech.com.au/cnc.htm)

## Finish capabilities

Not itemized in pages read for this profile. **Unknown.**

## Threads / inserts / secondary operations

Not itemized in pages read for this profile. **Unknown.**

## QC / inspection capability (declared)

Described generally as "rigorous inspection protocols... at every stage
of production, from raw material selection to final dimensional checks,"
without naming specific equipment (e.g., CMM). [via ArpTech search summary] — recorded as thin/unspecific.

## Quantity / MOQ / prototype-low-volume fit (declared)

**"1 to 1,000+ parts without expensive mould tooling"**; explicit example
given of "a single proof-of-concept or a batch of 500 units." This is one
of the more specific quantity-range claims in the entire dataset. [CNC Protos — About](https://www.cncprotos.com.au/about.html)

## Lead-time claims (declared)

**"Typical lead times of 10–12 business days."** [CNC Protos — About](https://www.cncprotos.com.au/about.html)

## Certifications (declared, self-reported, not independently verified)

**None found.** Only a design-tolerance standard (DIN ISO 2768-m) is
referenced; no ISO 9001 or other quality-management certification claim
was located on the pages read for this profile.

## Source / evidence

- [CNC Protos — About](https://www.cncprotos.com.au/about.html) — supplier_marketing, captured 2026-09-19
- [ArpTech — CNC Machining](https://www.arptech.com.au/cnc.htm) — supplier_marketing, captured 2026-09-19
- [ArpTech — About](https://www.arptech.com.au/about.htm) — supplier_marketing, captured 2026-09-19
- [CNC Protos — homepage](https://www.cncprotos.com.au/) — supplier_marketing, captured 2026-09-19

## Unknown / missing fields

- Materials list: thin, not itemized by specific alloy.
- Machine envelope / max part size: unknown.
- Finish capability list: unknown.
- Threads/inserts/secondary ops: unknown.
- Certifications: none found.
- 5-axis capability: not claimed (only 3/4-axis stated).
- Robotics/automation-specific case study: none found.

## Suitability for prototype/low-volume robotics work

**Reasonable fit for simpler robotics geometries, with a stated
constraint.** The quantity range (1 to 1,000+) and lead time (10–12 days)
are among the most specific and directly usable numbers in the entire
Australian sample, which is valuable. The lack of any 5-axis claim is a
real constraint for parts needing complex multi-sided or undercut
geometry (e.g., some EOAT plates or gripper jaws), though likely fine for
simpler brackets, mounts, and housings machinable in 3/4-axis setups. No
certification was found, which should be weighed against suppliers like
Vanderhulst or American Precision Tool that do publish one.
