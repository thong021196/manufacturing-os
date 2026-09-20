# manufacturing-os
Manufacturing operating system for demand research, supplier capability, RFQ, quoting, production, QC, and learning loops.

This repo contains two things:

1. **The public product** (`/`, `/parts/...`, `/applications/...`,
   `/capabilities/...`, `/quality`, `/how-it-works`, `/company`,
   `/resources`, `/rfq`, ...) — the customer-facing site and RFQ intake.
   See `docs/frontend-design-system/` for the visual system and
   `docs/architecture/entity-publishing-system/` for the public content
   architecture (`lib/content/`).
2. **An internal ops dashboard** (`/ops`, `/discovery/...`,
   `/knowledge/...`, `/supply/...`, `/execution/...`, `/intelligence/...`)
   — the original Issue #2 build, on seeded mock data, modeling the
   private operational object graph (`lib/types.ts`). Not linked from the
   public site and excluded from `robots.txt`.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Copy `.env.example` to `.env.local` and
see it for what each variable does. RFQ submissions work locally out of
the box against a disk-backed dev/test fallback store — no external
account needed to try the flow end-to-end (`/rfq` → submit → real
reference id, persisted under `.data/rfq/`, gitignored).

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full production/custom-domain
setup (Vercel + Supabase), the exact external account steps still needed,
and how to verify a deployment.

## Structure

Public product:
- `lib/content/` — the public structured content layer: `types.ts` (Part /
  Application / ProcessCapability / Material / EngineeringProblem /
  ContentBlock / Evidence / PageRegistry), `repository/` (the current
  repository-backed data — swappable for a real Sanity project later
  behind the same `ContentAdapter` interface in `adapter.ts`), and
  `compose.ts` (resolves a Page Registry entry into the `FrontendPageModel`
  view model the design-system components render).
- `lib/rfq/` — the RFQ intake backend: validation, spam/rate-limit checks,
  and a swappable `RfqStore` (`store/local.ts` disk-backed dev/test
  fallback, `store/supabase.ts` production). `app/api/rfq/route.ts` is the
  server endpoint; `supabase/migrations/` has the real schema.
- `components/design-system/`, `styles/`, `tokens/` — the accepted visual
  system (see `docs/frontend-design-system/`).

Internal ops dashboard (unchanged from Issue #2):
- `lib/types.ts` — the private operational object model (see
  `docs/architecture/OBJECT_MODEL.md`). Note: its `PartInstance` type (a
  specific physical part tied to one RFQ/revision) is distinct from the
  public `Part` knowledge entity in `lib/content/types.ts` — see that
  file's UQ-1 comment for why.
- `lib/mock/data.ts` / `lib/data.ts` — mock fixtures and the data access
  layer for the ops dashboard.
- `components/ui/`, `components/layout/sidebar.tsx` — ops dashboard
  presentation primitives and shell.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
