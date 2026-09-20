# Deployment guide

This app has two deployment surfaces:

1. **GitHub Pages static preview** (`/frontend-preview/`) — marketing pages
   only, no RFQ backend. Already wired (`.github/workflows/frontend-preview.yml`),
   deploys automatically on push to `frontend/design-system` or
   `feature/mvp-launch`.
2. **Production (Vercel, or any Node-capable host)** — the full app,
   including the real RFQ API (`app/api/rfq`, `app/api/health`), which needs
   server execution and therefore cannot run on GitHub Pages' static
   hosting. This is the target for the real domain.

## Why Vercel (or an equivalent Node runtime), not GitHub Pages, for production

GitHub Pages only serves static files. `app/api/rfq/route.ts` handles a
dynamic `POST` with file uploads — Next.js Route Handlers that rely on the
request body are explicitly unsupported under `output: "export"` (see
`node_modules/next/dist/docs/01-app/02-guides/static-exports.md`,
"Unsupported Features"). Forcing the RFQ backend into static-only hosting
would mean faking submission success client-side, which issue #25
explicitly forbids ("Do not fake successful persistence"). So: marketing
pages stay available as a static preview for convenience, but the real
site — the one a domain should point at — needs a Node-capable host.
Vercel is the natural choice here because a Vercel team (`thong1996`)
already exists for this account; any other Node/Next-compatible host
(Render, Railway, Fly.io, a self-managed Node server) would work equally
well against the same `next build` output and the same env var contract
below — nothing in this app is Vercel-specific except `vercel.json` and
`.github/workflows/deploy-production.yml`.

## What this repo has already prepared

- `vercel.json` — build/install commands, baseline security headers.
- `.github/workflows/deploy-production.yml` — deploys to Vercel production
  on every push to `main`, but only runs once the three secrets below
  exist; until then it no-ops with a clear warning instead of failing.
- `.github/workflows/ci.yml` — typecheck/lint/build on every PR and push to
  `main`.
- `supabase/migrations/0001_rfq_intake.sql` — full schema, RLS, and private
  storage bucket for the RFQ backend.
- `.env.example` — every environment variable this app reads, documented.

## What the owner still needs to do (external account steps)

These are the two blockers this implementation pass could not complete
itself — see AGENTS.md ("Human owner: approves... billing... irreversible
decisions") and issue #25's own instruction to stop at a true external
credential/account blocker rather than provision live paid resources
autonomously.

### 1. Create the Supabase project

1. In the Supabase dashboard, create a new project under the existing
   `thongnguyen` organization (free tier is enough to start).
2. Once created, get the project URL and **service role** key from
   *Project Settings → API*.
3. Apply the migration: `supabase link --project-ref <ref>` then
   `supabase db push`, or paste `supabase/migrations/0001_rfq_intake.sql`
   into the SQL editor and run it once.
4. Confirm the `rfq-files` bucket exists and is **not** public (the
   migration creates it as private; double-check in
   *Storage → rfq-files → Configuration*).

### 2. Resolve the Vercel account and create the project

1. The `thong1996` Vercel team's billing/suspension status needs to be
   confirmed clear by the owner (it was reported suspended in an earlier
   pass of this project's history) before a live deploy will succeed.
2. Create a new Vercel project from this GitHub repo (`thong021196/manufacturing-os`),
   pointing at the `main` branch, framework preset "Next.js".
3. In the new project's settings, get `VERCEL_TOKEN` (account → Settings →
   Tokens), `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` (Project Settings →
   General, or `.vercel/project.json` after running `vercel link` locally).
4. Add all three as **repository secrets** in GitHub
   (`Settings → Secrets and variables → Actions`) — `deploy-production.yml`
   picks them up automatically on the next push to `main`.
5. In the Vercel project's environment variables, set every variable from
   `.env.example` that has a value in this guide's checklist below.

### 3. Point the custom domain

Once the Vercel project exists and has deployed successfully at least
once:

1. Vercel dashboard → Project → Settings → Domains → add the domain.
2. Vercel gives you either an `A`/`ALIAS` record (root domain) or a
   `CNAME` (subdomain) to add at the DNS registrar. Add it.
3. Vercel automatically issues and renews the HTTPS certificate once DNS
   resolves — no manual certificate work needed.
4. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` domain in the
   Vercel project's environment variables and redeploy, so canonical URLs,
   Open Graph tags, and `sitemap.xml`/`robots.txt` point at the real
   domain instead of the placeholder.

No GitHub Pages `basePath`/subpath assumptions leak into this build —
`next.config.ts` only applies the `/frontend-preview` `basePath` when
`GITHUB_PAGES=true`, which only the static-preview workflow sets. A
Vercel/production build serves from the domain root.

## Environment variable checklist for the production Vercel project

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Final `https://` production domain. |
| `SUPABASE_URL` | Yes (for real persistence) | From the Supabase project's API settings. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for real persistence) | Server-only secret — set in Vercel's server env, never `NEXT_PUBLIC_`. |
| `RFQ_BACKEND` | No | Leave unset; auto-resolves to `supabase` once the two vars above are set. |
| `RFQ_MAX_FILE_MB` / `RFQ_MAX_FILES` / `RFQ_MAX_TOTAL_MB` | No | Defaults are 100 / 10 / 300; tune if needed. |

See `.env.example` for the full, commented list.

## Verifying a deployment

1. `GET /api/health` should return `{"status":"ok", "rfqBackend":"supabase", ...}`.
   If `rfqBackend` reads `"local"` in production, the Supabase env vars are
   missing or misnamed — fix before considering RFQ submission "live."
2. Submit a real test RFQ through `/rfq` and confirm a row appears in the
   Supabase `rfq_submissions` table and a file appears in the `rfq-files`
   bucket.
3. `GET /sitemap.xml` and `/robots.txt` should reflect the real domain
   (from `NEXT_PUBLIC_SITE_URL`), not the placeholder.
4. Spot-check `/`, `/parts/robot-joint-housing`, `/how-it-works`, `/rfq`,
   and a 404 route on both desktop and mobile widths.

## Local development

```bash
npm install
npm run dev
```

RFQ submissions locally use the disk-backed fallback (`lib/rfq/store/local.ts`,
writes under `.data/rfq/`, gitignored) unless `SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` are set in `.env.local`.
