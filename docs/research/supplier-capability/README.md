# Supplier Capability Research — README

Issue: #5 "Research and structure real supplier capability data"
Captured: 2026-09-19
Researcher: Claude (Sonnet), desk research only

## Purpose

Replace mock supplier assumptions with sourced, structured supplier capability
data for the initial manufacturing wedge (custom mechanical parts for
robotics/automation — actuator housings, gripper jaws, sensor mounts, motor
mounts, EOAT plates, brackets, housings, jigs, inspection fixtures — see
`docs/product/PRODUCT.md`), before any automated supplier matching or
customer-facing supplier claims are built.

This is **research and seed data only**. No matching logic, no public
capability pages, no supplier-facing commitments. See "Human gate" at the
bottom.

## Scope

- **Geography**: United States and Australia (initial market scope per
  `docs/product/PRODUCT.md`).
- **Process focus**: CNC milling/turning and sheet-metal fabrication
  (laser cutting, punching, forming/bending, welding) — the processes that
  cover the initial wedge's part types.
- **Supplier type focus**: independent job shops and contract manufacturers
  that plausibly serve prototype / low-volume work, including a couple of
  larger digital-manufacturing networks (Xometry, Protolabs) that are
  frequently the first stop for exactly this kind of buyer, so they are
  included with an explicit note that they are networks/platforms rather
  than single physical shops.
- **13 real, currently-operating suppliers** were researched: 7 in the
  United States, 6 in Australia. No supplier name, website, or capability
  claim in this research was invented — every claim below traces to a real
  URL that was located and read during this session (see methodology note
  on tooling below).

## The declared vs. observed rule (restated up front)

Per `docs/architecture/OBJECT_MODEL.md` rule and `AGENTS.md` core rule 5,
supplier capability has two layers that must never be collapsed into one:

1. **`declared` capability** — the supplier says (in marketing copy, spec
   sheets, or certification pages) that it can do something.
2. **`observed` capability** — supported by our own quotes, production,
   QC, rework, delivery, or repeat-order history with that supplier.

**Every record in this research package is `declared`.** This is desk
research with zero transaction history. No `SupplierPerformance` records
and no `observed`-layer `SupplierCapability` records were created. Every
place the source data model has an "observed" slot is explicitly marked
`unknown — no transaction history yet` rather than left blank or inferred
from marketing language. `seed-supplier-capabilities.json` sets
`"layer": "declared"` on every single record — there are no exceptions.

## Confidence / source legend

Source types used (per `lib/types.ts` on the frontend-shell branch,
`origin/claude/issue-2-implementation-3g9kzq`, used here for field-naming
consistency only — no code from that branch was touched):

| `sourceType` | Meaning as used in this research |
|---|---|
| `supplier_marketing` | Claim comes from the supplier's own website copy (capability pages, blog posts, sales pages). The overwhelming majority of records in this package. |
| `documentation_verified` | Claim comes from a more formal/authoritative document the supplier publishes (a dimensioned tolerance spec sheet, a regulatory filing) rather than generic sales copy. Still self-published by the company — **not** independently cross-confirmed by a third party. |
| `ai_inferred` | Not used for any capability field in this package. Where a suitability judgment required interpretation (e.g. "plausible fit for robotics brackets" when no robotics case study exists), that judgment is written as prose in the "Suitability" section of the profile, never encoded as a capability fact. |
| `manual_entry` | Not used. |

Confidence levels:

| `confidence` | Meaning as used here |
|---|---|
| `low` | Single generic marketing claim, or a claim that could not be corroborated across more than one page on the supplier's own site. |
| `medium` | Specific, technical, internally consistent claim (e.g., a numeric tolerance published on a dedicated spec page), or corroborated across multiple pages/sources — but still self-reported by the company. |
| `high` | Reserved for facts sourced from an independent, authoritative document not authored by the supplier itself. **Not currently used for any capability/company-state fact in this package** — see "Corrections applied" below for why the one record that used to claim `high` (Fathom's facility count) was downgraded. |
| `verified` | **Not used anywhere in this package.** Per the issue's guardrails, nothing from desk research alone earns `verified` — that is reserved for something cross-confirmed against an independent registry (e.g., a certification body's own database), which this research did not attempt. Every certification claim below (ISO 9001, AS9100D, ITAR, etc.) is the supplier's own claim of holding it, not a registry lookup, and is therefore capped at `low`/`medium`.

## Corrections applied (2026-09-19, in response to automated review)

Two P1 findings from the Codex review on PR #7 were verified and fixed:

- **AUDIT-002 — Fathom Manufacturing's corporate status was stale and
  overstated.** The original profile described Fathom as currently
  NYSE-listed (ticker FATH) and treated its 10-K-sourced facility count as
  `high` confidence. In fact CORE Industrial Partners took Fathom private
  in a merger that closed **May 22, 2024**; FATH has not traded on any
  exchange since, and the only regulatory filing on file (a 10-K covering
  FY2022) predates that by roughly a year and a half. This was verified
  against three independent sources (the acquirer's own announcement, the
  deal law firm's press release, and trade press) and fixed in both
  `suppliers/fathom-manufacturing.md` and `seed-suppliers.json`: the NYSE
  claim was removed, the 10-K-sourced facts were downgraded from
  `high`/`documentation_verified` to `low`/`documentation_verified`
  pending re-verification from current (now non-SEC-reporting) sources,
  and the merger itself was added as three new cited evidence entries.
- **AUDIT-001 — the seed JSON was not actually importable as the object
  model it claimed to shape.** `seed-supplier-capabilities.json` and
  `seed-machine-evidence.json` used free-text `processId`/`materialIds`
  values (e.g. `cnc_milling_turning`) that don't match the app's canonical
  IDs (`proc-cnc-milling`, `proc-cnc-turning`, `proc-sheet-metal`,
  `mat-6061-t6`, etc.), were missing the `Traceable`-required
  `status`/`createdAt`/`updatedAt`/`owner` fields, and had evidence
  entries with no `id`. The prior "validation" (`python3 -m json.load`)
  only checked JSON syntax, not any of this. Fixed across all three seed
  files: the raw values are now explicitly named `processRaw`/
  `materialsRaw`, paired with new `canonicalProcessIds`/
  `canonicalMaterialIds` arrays populated only where a confident match to
  the app's current canonical ID set exists (17/17 capabilities resolve a
  canonical process; only 3/17 resolve a canonical material, because the
  app's seed material list is 3 materials wide and this research
  deliberately went far wider — that's an honest gap, not a bug); every
  record now carries the required Traceable fields; every evidence entry
  has an `id`. A new script, `validate-seed-data.mjs`, replaces the
  syntax-only check with a real one: it verifies every cross-reference
  resolves, every `layer` is `"declared"`, every required field is
  present, and reports canonical-ID coverage. Run it with
  `node docs/research/supplier-capability/validate-seed-data.mjs`; as of
  this fix it passes with 0 errors. **This JSON is still not a drop-in
  `SupplierCapability[]`** — `sizeEnvelopeMm`/`quantityRange` remain
  `null` wherever the underlying fact is genuinely unknown (unlike the
  app's type, where they're required), which is why a transformation/
  completion step, not a blind import, is still needed before this data
  could back the live app.

## Methodology note — tooling constraint

This session's `WebFetch` tool returned `EGRESS_BLOCKED` for every external
domain tested (including small single-shop sites and Wikipedia), which the
environment's proxy documentation identifies as an organization-level
egress policy decision, not a per-site technical failure. Direct page
fetching was therefore unavailable for the entirety of this research.

All findings instead come from the `WebSearch` tool, which does have its
own retrieval path and returns synthesized content plus the real source
URLs it drew from. Every URL cited in this package is a real, current page
that WebSearch surfaced and read; captured phrases are reproduced from
what WebSearch returned rather than from a raw manual fetch of the page.
This is flagged explicitly as a coverage-gap item below — it means (a)
content not surfaced by the phrasing of a given search query could have
been missed, and (b) a small number of quoted figures could not be
double-checked against the raw page HTML in this session. A human
reviewer with unrestricted browsing should spot-check the higher-stakes
figures (tolerance claims, certification claims) before they inform any
commercial decision.

## Executive summary

- 13 suppliers profiled: **7 US, 6 Australia**. See `suppliers/*.md` for
  full per-supplier records and `process-material-matrix.md` for a
  cross-cutting view.
- The US sample spans CA (Bay Area x2, Southern California x1), MN
  (national network HQ), MD (national network HQ), NH, and WI (public
  multi-facility company) — decent geographic and business-model spread
  (independent job shops, a sheet-metal specialist, and two large
  digital-manufacturing networks).
- The Australia sample is heavily concentrated in **Melbourne, Victoria**
  (5 of 6 suppliers); only one Sydney/NSW supplier was found, and no
  supplier headquartered in WA, QLD, SA, or the ACT was located in this
  research pass, despite an initial expectation (based on the name
  "Additive Engineering Australia") that it would be WA-based — it is in
  fact VIC-based. **Australia's public capability information is
  meaningfully thinner than the US sample**: fewer suppliers publish
  numeric tolerance claims, quantity ranges, or a specific machine list,
  and only one Australian supplier (DVR Engineering) publishes a detailed
  certification list beyond a bare "ISO 9001" mention.
- Exactly **one** supplier in the entire 13-company set (Xometry) has a
  publicly documented robotics/drone-manufacturing case study. Every other
  supplier's fit for the robotics/automation wedge is a structural
  inference (tight tolerances + prototype/low-volume language + relevant
  materials) rather than a stated fact — this is the single biggest gap
  relative to the issue's framing and is called out per-supplier.
- Zero `observed` capability records exist, by design. Zero
  `SupplierPerformance` records exist, by design.

## Coverage gaps (for human review)

1. **No certification is independently verified.** Every ISO 9001,
   AS9100D, ITAR, or IATF claim in this package is the supplier's own
   website saying it holds that credential. None were cross-checked
   against a certification body's registry (e.g., IAQG OASIS for AS9100,
   an accredited ISO 9001 certificate database). Before any supplier is
   surfaced to a customer as certified, that should be checked against the
   issuing registry, not just the supplier's own page.
2. **Robotics/automation-specific evidence is almost entirely absent.**
   Only Xometry has a named robotics/drone customer case study (Asylon,
   RobCo). The rest of the fit judgment in every other profile is inferred
   from tolerance/material/prototype-positioning language, not a
   robotics-specific claim. This should not be read as "these suppliers
   don't do robotics work" — only that public marketing rarely names the
   end industry at this level of specificity, and it is a real gap in what
   can be claimed with confidence.
3. **Australia is thin and geographically concentrated.** 5 of 6 AU
   suppliers are in Melbourne/VIC; no confirmed WA, QLD, SA, or ACT
   supplier. Numeric capability data (tolerance, quantity range, machine
   envelope) is published far less consistently by AU suppliers than by
   US suppliers in this sample — several AU profiles have multiple fields
   marked "unknown — not published."
4. **Machine envelope / max part size (`sizeEnvelopeMm`) is the weakest
   field across nearly the whole set.** Only Additive Engineering
   Australia (tolerance-oriented, not envelope) and ALMEC (laser bed size,
   sheet metal only) give a quantified physical machine spec; no supplier
   in the CNC milling/turning group publishes a general max-part-size
   figure. This is a hard blocker for any future automated size-based
   matching.
5. **Quantity range / MOQ is only explicit for about half the sample**
   (Xometry, 3D Prototyping: no MOQ; CNCProtos: 1–1,000+; Protolabs:
   25–10,000+ for molding, up to ~1,000,000 for CNC at scale — none of
   these numbers are prototype-floor-specific). The rest publish no
   quantity language at all.
6. **Lead-time claims are inconsistent or missing.** Only Protolabs and
   CNCProtos give concrete day-ranges; most other suppliers give none.
7. **Process coverage is uneven between CNC and sheet metal within a
   single supplier.** Sheet-metal specialists (Approved Sheet Metal,
   ALMEC) show no evidence of CNC milling/turning capability; several pure
   CNC shops (American Precision Tool, Vanderhulst, HD Machining) show no
   sheet-metal capability. A robotics part order needing both a machined
   bracket and a sheet-metal enclosure would likely need two suppliers
   from this set today, not one. See `process-material-matrix.md`.
8. **Network/platform suppliers blur the "one supplier = one facility"
   assumption.** Xometry and Protolabs (and, on the AM side, Formero and
   Additive Engineering Australia) describe network-wide or
   multi-facility capability rather than a single shop's actual machine
   list. The object model (`Supplier`, `SupplierCapability`) as currently
   defined does not have a field distinguishing a single-facility job shop
   from a distributed network — this research flags it as an open
   modeling question for the architecture reviewer (OpenAI) before
   matching logic is designed; see `facilityType` notes in
   `seed-suppliers.json`.
9. **Company name collision risk noted.** "HD Machining" (hdmachinings.com,
   Fremont, CA) surfaced alongside a similarly named but separate company,
   "HD Machining Solutions" (hdmachiningsolutions.com), in the same search
   results. Only facts attributable to hdmachinings.com are recorded here;
   this is flagged so a future verifier doesn't accidentally merge the two.
10. **Tooling constraint** — see Methodology note above: all research was
    done through `WebSearch`, not direct `WebFetch`, because `WebFetch` was
    blocked by this session's egress policy for every domain tested. A
    human reviewer with normal browsing access should spot-check the
    highest-stakes figures before they inform any commercial or matching
    decision.

## File index

- `README.md` — this file.
- `suppliers/*.md` — one profile per supplier (13 files).
- `process-material-matrix.md` — cross-cutting process × material ×
  supplier coverage table.
- `seed-suppliers.json` — 13 `Supplier`-shaped records.
- `seed-supplier-capabilities.json` — `SupplierCapability`-shaped records,
  `layer: "declared"` on every record, one or more per supplier per
  process line.
- `seed-machine-evidence.json` — `SupplierMachineEvidence`-shaped records,
  only where a supplier publishes specific equipment (model, axis count,
  quantity, or comparable detail) — most suppliers do not, and are
  omitted rather than padded.
- `validate-seed-data.mjs` — standalone Node script (no app/lib
  dependency) that checks reference integrity, required-field presence,
  and canonical process/material ID coverage across the three seed files
  above. Run with `node docs/research/supplier-capability/validate-seed-data.mjs`.

No `seed-supplier-performance.json` file exists. It should not be created
until real transaction history exists — creating an empty/placeholder
version of it risks being mistaken for "we checked and there's nothing,"
rather than "this has not started yet."

## Human gate

Per the issue's Human Gate requirement: **this is a research deliverable.**
It is a supplier graph plus explicit coverage gaps, submitted for human
review. No automated supplier-matching logic and no public
customer-facing supplier/capability pages should be generated from this
data until a human has reviewed it, per `AGENTS.md`'s required workflow
(`ISSUE → PLAN → BUILD → PR → TEST → AUDIT → FIX → VERIFY → HUMAN GATE →
MERGE`) and the issue's own guardrails.
