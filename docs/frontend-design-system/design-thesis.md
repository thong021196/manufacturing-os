# Design thesis — frontend concept reset

## Who this is for
A hardware engineer or procurement lead at a robotics, motion-control, or
industrial-equipment company who has a CAD file, a drawing, or an unsolved
manufacturing problem, and is deciding whether to trust an unfamiliar
interface with it. They already know what a good engineering tool feels
like — they use PLM systems, ERP consoles, CAD, and MES software every day.
They are not persuaded by marketing copy; they are persuaded by a system
that behaves like it understands the problem.

## What it must make them feel within seconds
**"This system already understands manufacturing — I can hand it something
hard."** Not "this is a nice-looking website." Not "this is a page
generated from a database." The feeling is closer to opening a serious
piece of engineering software for the first time: dense information handled
with total control, nothing decorative, everything load-bearing.

## The framing
Manufacturing OS is designed as **a global manufacturing intelligence and
execution interface for custom hardware** — the operating layer that sits
between "I have an idea/CAD/drawing/BOM" and "I have an inspected,
accountable, delivered part." The public site is the front door of that
operating layer, not a brochure describing a company that owns one.

Every page is written and composed from that future-state truth: a
requirement enters the system, gets structured and understood, is routed
through an intelligent manufacturing network, is engineered, produced,
inspected, revisioned, and delivered with evidence — inside one interface
one party is accountable for. The site's job is to make that lifecycle
legible and trustworthy before a single file is uploaded.

## What this deliberately is NOT doing
- **Not restyling the previous composition.** The previous two passes kept
  the same "hero → meta grid → capability strip → card grid → CTA band"
  shape and changed color/type/spacing. That shape is gone. There is no
  shared `PublicTechnicalPage` template stamped across part, application,
  capability, quality, and resource routes with only copy swapped — each
  page type now has its own composition logic.
- **Not an SEO content renderer.** Pages are not built by looping a generic
  block array through one layout. The block/adapter data model is kept as a
  content source, but each page type decides its own structure, emphasis,
  and rhythm from that data — the data does not dictate the layout.
- **Not a SaaS dashboard wearing navy.** No rounded card grids, no
  drop-shadow "lift on hover," no badge clutter, no glassmorphism, no
  dashboard chrome pretending to be a marketing site.
  Design is not from "current backend entities outward"; the current entity
  shape is never the reason a page looks the way it does.
- **Not a documentation site.** Technical density is expressed through
  composition and typographic hierarchy, not through walls of definition
  lists.
- **Not fabricated trust.** No invented certifications, headcounts, supplier
  counts, or customer logos. Trust is built through process transparency,
  evidence discipline, and the quality of the interaction — the same
  discipline the underlying architecture already enforces
  (`source` / `confidence` / `last_verified` / `evidence` on every fact).

## The bar
If someone can look at the new homepage and the new part page and describe
them as "the same template with different words," the reset has failed.
The homepage is a **sequence** (an opening statement, a live-feeling process
model, a network view, an evidence layer, a closing conversion moment). The
part page is a **workspace** (a persistent object/context rail next to a
navigable technical dossier). The RFQ page is a **console** (a
persistent trust/process rail next to an active, minimal intake flow).
These are three different shapes, built once, then extended.
