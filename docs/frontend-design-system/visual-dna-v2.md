# Visual & interaction DNA v2 — full reset

This replaces `design-dna.md`, `color-tokens.md`, `typography.md`,
`spacing-density.md`, `technical-visual-language.md`, `component-principles.md`,
and `interaction-states.md` as the source of truth for the public frontend.
Those v1 documents described a system that was still, in the owner's words,
"the old system with a new palette." This document is written in explicit
contrast to it.

## What actually changes vs. v1, and why

| v1 (rejected) | v2 (this reset) | Why |
|---|---|---|
| One `.public-app` shell: white body, thin navy header, same footer everywhere | Two-surface system: a near-black **console** register for chrome, hero moments, and evidence/trust surfaces, and a cool-paper **document** register for reading/technical content — alternated deliberately per page | A single flat white body with a navy bar is a SaaS-marketing-site pattern. Alternating registers gives the product a rhythm and a reason to be dark/light in specific places, not a "dark mode toggle" — it signals control, not decoration. |
| Every non-home route rendered by one `PublicTechnicalPage` (hero + generic block stack) | No shared page template. Home = sequence, Part = workspace (persistent split pane), RFQ = console (persistent rail + active step), Application = system map, Capability = decision guide, Quality = evidence ledger, Company/Network = network atlas | This was the literal mechanism producing "same shell, different copy." Removed entirely — each composition file owns its own layout logic. |
| Grid stacks of equal-weight rounded cards (`entity-card`, `home-system-card`, `company-pillar`) | Asymmetric column spans, index tables, and vertical ledgers; cards only where a true 1:1 comparison of equal items is the actual content (e.g. capability index) | Uniform card grids are the fastest way to look like a component-library demo. Real hierarchy is expressed by different-sized, differently-shaped blocks. |
| `border-radius` on panels, drop shadows on hover (`translateY(-2px)`), pill badges everywhere | Zero radius on structural surfaces, hairline 1px borders, corner "tick" marks (L-shaped corner accents borrowed from drawing/print marks) as the recurring signature instead of shadow/lift, small 2px radius reserved for buttons only | Shadows + lift + rounded corners = generic SaaS card language the owner named directly as an anti-pattern. Tick marks reference technical drawings/print registration marks — legible as "precision," not decorative. |
| System font stack for headings, `font-mono` referencing IBM Plex Mono without ever loading it | `Space Grotesk` (display/headline), `IBM Plex Mono` (technical labels, data, coordinates), `Inter` (body) — all loaded via `next/font/google`, actually shipped | A typeface that is only named in CSS but never loaded silently falls back to system UI fonts — part of why the previous pass still "read as the old system." |
| Homepage = eyebrow + H2 + 3-up grid, repeated 7 times down the page | Homepage = five **chapters**, each with its own internal composition (opening statement, live process model, capability index, network atlas excerpt, evidence strip, closing console) alternating console/paper registers | Directly targets the acceptance test: nothing on the new homepage should be describable as "another instance of the same section." |
| Motion: `translateY(-1px)` on buttons, transform on card hover only | Scroll-reveal opacity/8px translate on section entry (180ms ease-out), hover = border/color transition only (no transform, no shadow) | Calm, authoritative movement; nothing bounces or lifts. |

## Color system (token values)

Two registers, one accent, restrained status colors. All values live in
`tokens/color.css`.

```
--ink-950: #05070B   console background (near-black navy)
--ink-900: #0A0F18   console raised surface
--ink-800: #121A29   console border / secondary surface
--ink-700: #1B2740   console hairline on dark
--ink-600: #29385C   console muted border, strong on dark
--ink-400: #6A7DA0   console secondary text
--ink-200: #A9B7CF   console tertiary text / mono labels on dark

--paper-0:  #F6F7F5   document background (cool, not pure white)
--paper-50: #EFF1ED   document raised surface
--graphite-900: #10141A  document primary text
--graphite-600: #454C56  document secondary text
--graphite-400: #767E88  document tertiary text / mono labels on light
--graphite-200: #D8DBD9  document hairline border
--graphite-100: #E7E9E6  document subtle border

--signal-500: #2F5CC7   primary action / brand blue (used as the ONE accent — links, CTAs, active states)
--signal-300: #7FA0E8   accent on dark surfaces
--signal-050: #E7ECFA   accent tint on light surfaces

--evidence-500: #1F8F6B  verified / success (desaturated green)
--evidence-050: #DEEFE7
--caution-500: #B4842C   attention (desaturated amber)
--caution-050: #F3E9D6
--risk-500: #B14A3F      risk / danger (desaturated brick red)
--risk-050: #F4E0DD
```

Deep navy/ink is the dominant surface, not an accent stripe — it is the
console register itself, not "a navy header on a white site." `signal-500`
is the only saturated color in the system and is reserved for action:
primary CTAs, active nav/step states, links, and the one accent line used
in diagrams. Everything else is ink, paper, or graphite.

## Typography

```
--font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", monospace;
--font-body: "Inter", ui-sans-serif, system-ui, sans-serif;

--type-flagship: clamp(3.4rem, 6.4vw + 1rem, 8.2rem)   /* one-per-page, homepage opening + closing statements only */
--type-display:  clamp(2.6rem, 4.2vw + 1rem, 5.2rem)    /* page-defining statement, one per page */
--type-h2:       clamp(1.6rem, 1.6vw + 1rem, 2.4rem)
--type-h3:       1.25rem
--type-body-lg:  1.05rem
--type-body:     0.95rem
--type-small:    0.82rem
--type-mono-lg:  0.8rem   /* data values, index labels */
--type-mono-sm:  0.68rem  /* coordinates, tags, breadcrumbs */
--leading-flagship: 0.94
--leading-tight: 1.05
--leading-copy: 1.6
```

`Space Grotesk` is used only for the single defining statement on a page
(one flagship or display-scale line) — it is not used as a general heading
font throughout, which keeps it from becoming decorative. Everything else
under it uses `Inter`. Mono is reserved for anything that is genuinely
data: labels, coordinates, revision codes, statuses, step indices.

## Grid & spacing

```
--layout-max: 96rem            /* wider stage than v1's 88/92rem — a flagship canvas */
--layout-rail: 22rem           /* persistent side-rail width used on workspace/console pages */
--layout-gutter: clamp(1.25rem, 3.2vw, 3.5rem)
--space-chapter: clamp(5rem, 10vw, 9rem)   /* vertical rhythm between homepage chapters */
--space-section: clamp(3.5rem, 7vw, 6rem)
```

A visible 12-column grid with 1px hairline column guides is used behind
hero/opening moments on dark surfaces (not as permanent chrome, as a
technical-drawing motif tied to specific compositions).

## Component shape language

- **No shadows, no lift-on-hover, no border-radius on structural
  panels.** Hairline (1px) borders define every surface boundary.
- **Corner ticks** (4 small L-shaped marks at the corners of a panel or
  visual) are the recurring signature device — used on hero visuals, the
  RFQ dropzone, and key data panels. They replace the card-shadow language
  entirely.
- **Buttons** keep a small 2px radius (the one place a soft corner is
  allowed, for tap/click affordance) — solid `signal-500` for primary,
  hairline outline for secondary, text-link with underline-on-hover for
  tertiary.
- **Index numerals** (`01`, `02`…) in mono are used as a wayfinding device
  across chapters/steps/rails instead of icon-led cards.
- **Status** is a single hairline-outlined mono tag, never a filled pill
  badge cluster.

## Motion & interaction

- Section entry: opacity 0→1 + translateY(8px→0), 220ms ease-out,
  triggered once via `IntersectionObserver`, respecting
  `prefers-reduced-motion`.
- Hover: color/border-color transition only, 120ms, no transform.
- Active nav / active RFQ step: solid `signal-500` underline/left-border,
  not a filled pill.
- Sticky rails (part workspace, RFQ console) hold position via `position:
  sticky`, not JS scroll-locking.

## What this DNA explicitly avoids repeating

No 3-up icon-card grids as a default section shape. No `eyebrow + H2 +
description` header repeated verbatim at the top of every section. No
identical hero silhouette (headline/meta/CTA left, dark technical square
right) reused across page kinds — the "technical square with concentric
rings" device from v1 is retired; each composition gets its own visual
device (see `information-architecture-v2.md` for what replaces it per page
type).
