# manufacturing-os
Manufacturing operating system for demand research, supplier capability, RFQ, quoting, production, QC, and learning loops.

## Frontend shell (v1)

This repo currently contains the first complete frontend system view, built with Next.js (App Router) and TypeScript, running entirely on seeded mock data. It exists to make the full business/system architecture navigable before real market and supplier data is introduced — see `docs/product/FRONTEND_SPEC.md` and `docs/architecture/` for the specification this implements.

### Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Structure

- `lib/types.ts` — the core object model (see `docs/architecture/OBJECT_MODEL.md`).
- `lib/mock/data.ts` — hand-linked mock fixtures demonstrating the full `Market → Opportunity → Component → Supplier → CAD Package → RFQ → Supplier Quote → Customer Quote → Order → Production → QC → Outcome` flow.
- `lib/data.ts` — the data access layer. All pages read through here, never through `lib/mock/data.ts` directly, so mock fixtures can later be replaced by Sanity (public knowledge) and Postgres/Supabase (private operational data) without a UI rewrite.
- `components/ui/` — shared presentation primitives (tables, badges, provenance/evidence display, related-object links).
- `components/layout/` — the navigation shell (sidebar, responsive drawer, topbar).
- `app/` — one route per primary navigation area from `docs/product/FRONTEND_SPEC.md`, with detail routes for objects that need to expose related-object navigation.

### Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
