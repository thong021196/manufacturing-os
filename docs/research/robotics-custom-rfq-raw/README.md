# Robotics custom-manufacturing RFQ raw research (issue #11)

Raw, unranked research answering one question, per each of the nine robot categories in
scope: **what custom-manufacturing RFQs does each robot category generate?**

This is a distinct, narrower re-framing of the broader robot→subsystem→component chain
already captured in `docs/research/robotics-supply-chain-raw/` (issues #8/#10, PR #9, not
merged). That folder is **not modified** by this work. This folder's schema is RFQ-shaped
(assembly → part → material → process → tolerance → lifecycle stage → revision intensity →
repeat/replacement → single/multi-process → China manufacturing fit → US/AU sourcing
friction), not a general BOM/teardown schema, per the issue's business-model framing: the
company is a custom-manufacturing RFQ broker (US/AU customer → CAD/BOM/RFQ → China supplier
network → quote/QC/consolidation/logistics → customer), not a parts reseller/marketplace.

## Files

- `custom-rfq-master.csv` — the full 25-column, 65-record raw dataset. Source of truth.
- `robot-categories.csv` — per-category rollup (record count, countries, use cases, buyer types).
- `custom-assemblies.csv` — every custom-manufactured assembly record, filtered from the master.
- `custom-parts.csv` — every custom-manufactured part record, filtered from the master.
- `materials-processes.csv` — material + manufacturing-process pairs, filtered from the master.
- `china-manufacturing-fit.csv` — every China manufacturing-capability signal, filtered from the master.
- `us-au-frictions.csv` — every US/AU sourcing-friction signal, filtered from the master.
- `sources.csv` — every unique source URL used, with type, publication date (where known), and
  which record IDs cite it.
- `coverage-audit.md` — per-category audit of what is mapped vs. still a gap, per the issue's
  coverage rule.

All seven filtered CSVs are mechanically derived from `custom-rfq-master.csv` (same record
IDs, so you can always cross-reference back to the master row). They exist to make it easier
to scan one dimension (e.g. "every China-fit signal") without paging through all 25 columns.

## Methodology and honesty notes

- **65 records** across the 9 named robot categories plus a `Đa loại robot (cross-category)`
  tag used for records that are genuinely cross-cutting manufacturing-capability or friction
  signals (e.g. the Shenzhen/Dongguan prototyping-cluster capability, the US CNC-machinist
  shortage, Australian import-dependence figures) rather than tied to one specific robot type.
  This tag is used deliberately, not as a dumping ground — most records are tied to a specific
  category.
- Real sources only. Every substantive claim carries a real, found URL. Where `WebFetch` was
  blocked by this session's egress policy (it was, for every domain tried: fictiv.com,
  carrmachine.com — the same limitation the #4/#5/#8/#10 research agents in this repo hit),
  the claim is sourced to `WebSearch`'s own retrieved summary of that page rather than a raw
  page fetch. This is noted per-row implicitly by the fact that no row claims content beyond
  what WebSearch's result snippet supported.
- Vendor/supplier claims (the majority of manufacturing-process and China-fit rows, since
  CNC/fabrication shops are the ones publishing this kind of detail online) are marked
  `Source type` = "Manufacturer/vendor site" and kept at `low` or `medium` confidence, never
  silently promoted to independent fact. Cost/percentage claims from vendor marketing copy
  (e.g. "30-60% lower labor cost") are kept as vendor claims, not converted to fact.
  One EU-market row is explicitly marked "sponsored content."
  One row (Starship Technologies) is explicitly marked `inference` because the material/process
  detail attached to it comes from general industry practice, not a source confirming
  Starship's own supplier choice — flagged rather than asserted as Starship-specific fact.
- No tolerance/price/volume numbers are invented. Where a source gave a specific number
  (tolerance class, flatness spec, percentage, headcount), it is quoted as given, with its
  source. Where none was available, the field is `unknown`.
- Contradictory or unverified claims are kept as separate records, not reconciled or
  silently picked (per the issue's raw-data rule) — e.g. the two different China-tariff
  figures in the US-friction rows are both retained.
- No Alibaba, supplier SKU/listing, or shop/MOQ research was performed, per the issue's scope
  lock. No sub-market was chosen and no opportunity scoring was performed.
- Today's date (2026-09-19) is used as "Ngày thu thập" for every row; a handful of rows also
  carry a distinct source publication date where the source gave one (e.g. the BHP press
  release, dated 2025-12).

## Google Sheet

The issue asked for one new Google Sheet, one tab, Vietnamese headers. To stay well under this
session's per-upload content-size ceiling (per the issue's own tooling note), the 65-row dataset
was published as three separate Sheets, each a single tab with the identical 25-column
Vietnamese header row, split by row range (not by category) so record IDs stay contiguous and
easy to cross-reference back to `custom-rfq-master.csv`:

- **Phần 1** (R001-R022): https://docs.google.com/spreadsheets/d/16tYnvshbJ9pTopxPrgMFftibhSNrSErcGaBNUrxTa8Y/edit
- **Phần 2** (R023-R044): https://docs.google.com/spreadsheets/d/1SD8Xf1h6YNg3Hor30CKxoST_az2qAJfKIJUHe5ciqy8/edit
- **Phần 3** (R045-R065): https://docs.google.com/spreadsheets/d/1mbmDugE5HhVFi8VLWToYgzME6BD3eyUktGbXq8CGXGM/edit

Each was uploaded as CSV and verified (via `get_file_metadata`/`download_file_content`) to have
converted correctly to a native Google Sheet with no row loss before moving to the next chunk.

## Scope reminder (per issue, not re-litigated here)

Target market: US + Australia. Supply-backend context: China manufacturing capability. No
sub-market chosen. No Alibaba/SKU/shop-ranking research. No catalog/off-the-shelf-parts
research effort (LiDAR units, battery cells, controllers, servos, connectors are named only
where needed to explain the custom part/interface around them). No opportunity scoring. This
is raw data awaiting human review per the repo's Human Gate — see `AGENTS.md`.
