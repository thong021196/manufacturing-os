# Content pipeline — draft → approve → auto-publish

How new public pages get onto the site without the owner writing code or
redeploying, and without anything going live that the owner has not approved.

```
scheduled Claude routine          owner (during a visit)          the running site
────────────────────────          ──────────────────────          ────────────────
drafts 1–3 pages as code   ──PR──▶ reviews, edits or closes  ──merge──▶ deploy (automatic)
publishStatus: "scheduled"         merging = approval                  page 404s until publishAt,
publishAt: a future date                                               then goes live by itself
label: content                                                         (≤ ~5 min + 1 request)
```

## 1. Where pages live

- One TypeScript file per page in `lib/content/repository/guides/`
  (e.g. `robot-mounting-bracket.ts`) exporting a `GuidePage`:
  a `PageRegistryEntry` plus its `ContentBlock`s. Add it to the
  `guidePages` array in `lib/content/repository/guides/index.ts`.
- `pageKind: "guide"`, rendered by `app/robot-parts/[[...slug]]/page.tsx`
  with the existing `KnowledgeIndex` reading layout (hero, "what to get
  right", sequence, file checklist, FAQ, next steps, CTA) — the accepted
  visual design, no new components.
- Paths live under `/robot-parts` (the pilot's URL scheme), no trailing
  slash: `/robot-parts/robot-mounting-bracket`. A new prefix needs a route
  file + `GUIDE_PREFIXES` + the `proxy.ts` matcher (see
  `lib/content/guide-route.tsx`).
- Every block carries `provenance` pointing at an `Evidence` record in
  `lib/content/repository/evidence.ts` (add new ones there, with a real
  `url` where one exists).

## 2. Publish states (the only rules)

`lib/content/publishing.ts` is the single source of truth:

| `publishStatus` | public? |
|---|---|
| `draft` | no — 404, not linked, not in sitemap |
| `scheduled` + `publishAt` in the future | no |
| `scheduled` + `publishAt` ≤ now | **yes** |
| `published` | **yes** |
| `unpublished` | no (kept in the repo for history) |

plus the owner's **Pause** switch in `/admin/content`, which hides a live
page immediately (see §6). `publishAt` must be ISO 8601 **with an offset**
(`2026-10-06T13:00:00Z`); anything else fails CI (`npm test` runs
`validateRegistry`) and would never go live.

Public pages re-render in the background at most every 300 s
(`export const revalidate = 300`), so a scheduled page appears within about
five minutes of `publishAt` (the first request after that window triggers the
re-render; the next one gets the new page). Nav/footer links, "next steps"
links and the sitemap follow the same rule, so a page is never linked before
it is live. Verified in the PR #26 smoke test: a page scheduled for 14:20:00Z
returned 404 until the window elapsed, then 200 and appeared in the sitemap,
with no redeploy.

## 3. The drafting routine (scheduled Claude)

Suggested schedule: **weekly, Wednesday**, so the PR is waiting at the
owner's Thursday visit (see `weekly-operating-rhythm.md`). Suggested
routine prompt (fresh session each run):

> Repo thong021196/manufacturing-os. Read AGENTS.md and
> docs/ops/content-pipeline.md. Pick the next 1–3 candidates from the queue in
> §4 that have no page in lib/content/repository/guides/ yet and no open PR
> labelled `content`. For each, read its row in
> docs/research/search-intent-pilot/pilot-pages.csv (on `main` if merged,
> otherwise `git show origin/claude/issue-20-search-intent-pilot:docs/research/search-intent-pilot/pilot-pages.csv`)
> and the in-repo research it cites. Draft one GuidePage file per candidate
> following §1 and the evidence rules in §5, with `publishStatus: "scheduled"`
> and `publishAt` set to the following Tuesday and Friday 13:00Z (one page
> per slot). Run `npx next typegen && npx tsc --noEmit && npm run lint && npm test && npm run build`.
> Open ONE PR from a new branch `content/<date>` to `main`, label `content`,
> body = RESULT artifact listing each page, its publishAt, the evidence
> records it cites, and every statement you could NOT source (left out).
> Do not merge. Do not touch anything outside lib/content/repository/.

If a candidate lacks enough evidence for a useful page, the routine says so
in the PR and does **not** pad it — a short page with honest gaps beats an
invented one.

## 4. Candidate queue (from the search-intent pilot)

Source: `docs/research/search-intent-pilot/pilot-pages.csv` on branch
`claude/issue-20-search-intent-pilot` (PR #21, not yet merged). Only rows
with `build_status = validated` (19 of 34) are candidates; `validate_first`
and `defer` rows are **not** drafted until a research pass upgrades them.
Order: P0 first, then P1; within a priority, the pilot's order.

| # | page_id | Proposed path | Type | Pri | Note |
|---|---|---|---|---|---|
| 1 | OBJ07 | `/robot-parts/robot-mounting-bracket` | object | P0 | |
| 2 | OBJ08 | `/robot-parts/gripper-fingers-jaws` | object | P0 | strongest evidence in the pilot |
| 3 | OBJ09 | `/robot-parts/eoat-tooling-plate` | object | P0 | parent is APP08 (validate_first) — link to CAT01 until then |
| 4 | OBJ02 | `/robot-parts/robot-actuator-housing` | object | P0 | |
| 5 | OBJ04 | `/robot-parts/robot-shaft` | object | P0 | one phrasing exception noted in the CSV |
| 6 | OBJ10 | `/robot-parts/robot-base-pedestal` | object | P0 | keyword-ambiguity exception noted in the CSV |
| 7 | OBJ13B | `/robot-parts/electronics-enclosure-machining` | object | P0 | |
| 8 | PRB_A | `/robot-parts/capabilities/prototype-to-production-machining` | problem-process | P0 | needs internal process description — owner input |
| 9 | CAT01 | `/robot-parts` | category hub | P0 | publish once ≥ 4 children are live; navigation + trust only |
| 10 | OBJ05 | `/robot-parts/robot-bearing-housing` | object | P1 | |
| 11 | OBJ12 | `/robot-parts/robot-enclosure-shell` | object | P1 | |
| 12 | OBJ16 | `/robot-parts/sensor-camera-lidar-mount` | object | P1 | LiDAR mount merged here |
| 13 | OBJ18 | `/robot-parts/rov-pressure-housing` | object | P1 | |
| 14 | PRB_D | `/robot-parts/capabilities/sheet-metal-fabrication-welding` | problem-process | P1 | |
| 15 | PRB_E | `/robot-parts/guides/how-to-source-china-cnc-manufacturer` | problem-process | P1 | informational, not a commercial head term |
| 16 | APP04 | `/robot-parts/applications/industrial-robot-parts` | application hub | P1 | hub for navigation, not head-term ranking |
| 17 | APP06 | `/robot-parts/applications/underwater-rov-robot-parts` | application hub | P1 | after OBJ18 |

**Held for an owner decision (overlap with live pages — do not draft):**

| page_id | Proposed path | Overlaps live page | Decision needed |
|---|---|---|---|
| OBJ01 | `/robot-parts/robot-joint-housing` | `/parts/robot-joint-housing` | keep the existing page, or move it (unpublish old + permanent redirect) — two pages for one intent would compete |
| APP01 | `/robot-parts/applications/humanoid-robot-parts` | `/applications/humanoid-robots` | same |

Paths drop the CSV's trailing slash (registry rule).

## 5. Evidence rules for drafted pages (same as the rest of the repo)

From `AGENTS.md` rule 7 and the pilot's own Human Gate fixes:

- **No invented numbers.** No tolerances, surface-finish values, lead
  times, prices, MOQs, capacities, machine counts, certifications, customer
  names or outcomes unless an `Evidence` record with a real source backs
  them. The pilot explicitly marks figures like bearing-bore concentricity
  and grip-surface tolerances "drawing-specific / source required before
  publication" — write "per your drawing" instead of a number.
- **Process knowledge is fine, claims about us are not.** General
  manufacturing facts (why 5-axis reduces setups, what anodizing does) may
  cite a `documentation_verified` evidence record with a URL. Anything about
  Manufacturing OS's own network, suppliers, or track record must match what
  is already published (issue #25 business model) — nothing new.
- **Provenance on every block**: `source`, `confidence`, `lastVerified`,
  `evidenceId`. Use `confidence: "low"` or `"medium"` unless verified.
- **Competitor evidence ≠ buyer demand**: the pilot's SERP observations
  justify that a page should exist; they are not facts to print on it.
- CTA is always the existing RFQ intake (`/rfq`) — no marketplace,
  supplier-portal or instant-quote language.

## 6. Approval, changes and emergencies

- **Approve**: merge the `content` PR (GitHub web or app, a couple of
  minutes per page). The deploy workflow ships it; nothing is public until
  `publishAt`.
- **Change the date / wording**: edit in the PR before merging (GitHub's
  web editor is fine), or ask for a revision in a PR comment.
- **Reject**: close the PR with a one-line reason (the routine reads closed
  PRs and won't re-propose without new evidence).
- **Take something down after it's live**:
  - fast: `/admin/content` → **Pause** (optional reason). The page 404s,
    leaves the sitemap and nav/"next steps" links within seconds. Stored in
    the `content_overrides` table; survives deploys. **Resume** undoes it.
    `/` and `/rfq` can't be paused. Hand-written links inside bespoke pages
    (home/company copy) are not rewritten — they will point at a 404 while
    paused.
  - permanent: a PR setting `publishStatus: "unpublished"` (then Resume the
    pause, if any).
- The admin cannot edit page text or dates on purpose: every public word
  stays reviewable in git history.
