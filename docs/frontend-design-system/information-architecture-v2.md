# Information architecture v2 — customer journey first

## The journey (not a sitemap)

1. **Arrive skeptical.** A hardware engineer lands on the homepage from a
   search result, a referral, or an RFQ email signature. They have seen
   generic manufacturing marketplaces before and assume this is another
   one. The homepage's only job in the first viewport is to disqualify that
   assumption — establish that this is an execution interface, not a lead
   generator.
2. **Test it against something specific.** They look for a real object —
   "can this system actually talk about a part like mine?" This is the
   part/workspace experience. It needs to read like a procurement
   engineer's own workspace, not a spec-sheet.
3. **Check the system, not the part.** If the part convinces them, they
   check whether the *system* around it holds up: how does a requirement
   get routed, who is accountable, how is quality proven, is the network
   real or implied. This is capability, application, quality, and
   company/network — the credibility layer.
4. **Commit files.** RFQ is the moment proprietary CAD changes hands. It
   has to feel like the start of an accountable relationship, not a lead
   form.
5. **Return as a repeat user.** Resources/engineering content exists for
   the second and third visit — after trust is established, not before.

## Site experience map

```
Entry
 └─ Homepage — company + category + system identity, ends in RFQ
     ├─ "Bring something specific" → Parts (workspace)
     │    └─ Robot Joint Housing (reference part workspace)
     ├─ "Check the system" → Capabilities (decision guides)
     │    └─ 5-Axis Machining
     ├─ "Check the system" → Applications (system maps)
     │    └─ Humanoid Robots
     ├─ "Check accountability" → Quality (evidence ledger)
     ├─ "Check the network" → Company
     │    └─ Manufacturing Network (network atlas)
     ├─ "Go deeper" → Resources / Engineering (knowledge index)
     └─ "Commit" → RFQ (console)
```

Every arrow above is a different *reason* to click, and the destination is
composed to answer that specific reason — not a uniform "detail page."

## Route table (compatible with existing Next.js app-router structure)

| Route | Composition | Journey moment |
|---|---|---|
| `/` | Sequence (5 chapters, console/paper alternation) | Disqualify "generic marketplace" assumption |
| `/parts/robot-joint-housing` | Workspace (persistent context rail + tabbed technical dossier) | "Can it talk about a part like mine?" |
| `/applications/humanoid-robots` | System map (decomposition diagram → part index → process narrative) | "Does it understand the system I'm building?" |
| `/capabilities/5-axis-machining` | Decision guide (when-to-use / when-not, access diagram, fit checklist) | "Do they actually know the process, or is this a keyword page?" |
| `/quality` | Evidence ledger (vertical record spine: revision → inspection → release) | "Can I trust them with acceptance?" |
| `/company`, `/company/manufacturing-network` | Network atlas (full-bleed route diagram, manifesto-style principles, accountability model) | "Is there a real network behind this, and who is responsible?" |
| `/engineering`, `/resources` | Knowledge index (editorial index, not a card grid) | Repeat-visit depth |
| `/rfq` | Console (persistent trust/process rail + single active step) | Commit proprietary files |

`/company/legal/*` remain simple document-register stub pages (unchanged
composition category — legal content should look like a document, not a
marketing page).

## What stays constant across every route (the DNA, not the composition)

- Console/paper color registers, `signal-500` as the only accent
- Space Grotesk for the one defining statement per page, mono for data
- Hairline borders + corner ticks, zero shadow/lift
- The adapter boundary: every page still resolves through
  `getFrontendPage()` / `FrontendPageModel` — the composition consumes that
  data differently per page kind, but the data contract (and its
  `source`/`confidence`/`last_verified`/`evidence` provenance) is untouched.

## What is intentionally different per page kind (this is the actual reset)

- **Homepage** is the only page allowed a `--type-flagship` opening
  statement and a chapter-based vertical rhythm.
- **Part workspace** is the only page with a *persistent two-pane layout*
  (sticky object rail + scrolling dossier) — it does not scroll as one
  column.
- **RFQ console** is the only page with a *persistent process rail next to
  a single active step* — never a linear stacked form.
- **Application system map** opens with a decomposition diagram, not a
  hero — the diagram *is* the hero.
- **Capability decision guide** opens with a binary "use this when / do not
  use this when" framing before any spec content — it reads as an
  engineering recommendation, not a listing.
- **Quality** is a vertical evidence ledger — a spine of checkpoints, not a
  spec table.
- **Company/Network** opens full-bleed with the route diagram before any
  copy, structured as a manifesto (numbered principles at display scale),
  not a mission-statement paragraph.

## Backend/data compatibility

`lib/frontend/types.ts` (`FrontendBlock`, `FrontendPageModel`,
`FactProvenance`) and `lib/frontend/adapter.ts`
(`getFrontendPage`/`normalizePage`) are unchanged in this pass — they are
exactly the "structured data / adapter boundary" contract PR #24 depends
on. What changes is which component reads that data and how it lays it
out. No page composition inspects backend/entity shape directly; every
composition reads only the `FrontendPageModel` view model, so the adapter
can be swapped for a real Sanity/Postgres-backed implementation later
without touching presentation.
