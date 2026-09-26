# Deployment guide

**Primary production target: AWS.** This was changed from Vercel+Supabase
per the owner's review comment on PR #26 (comment id 5750338323,
2026-09-20): "use an AWS-first stack and remove Vercel/Supabase as
required production dependencies." Vercel/Supabase are kept working as a
documented legacy/alternative path further down this file, but nothing in
production launch requires the owner to create a Supabase project or
resolve Vercel billing anymore.

> **Launching?** The exact, copy-pasteable bootstrap (tools, Terraform
> apply, GitHub variables, admin credentials, first deploy, the owner's DNS
> steps, key revocation, rough cost) is
> **[docs/ops/LAUNCH-RUNBOOK.md](./docs/ops/LAUNCH-RUNBOOK.md)**. Running
> it week to week: [docs/ops/weekly-operating-rhythm.md](./docs/ops/weekly-operating-rhythm.md).
> Publishing new pages: [docs/ops/content-pipeline.md](./docs/ops/content-pipeline.md).
> This file keeps the architecture reasoning.

This app has three deployment surfaces:

1. **GitHub Pages static preview** (`/frontend-preview/`) — marketing
   pages only, no RFQ backend. Unchanged by this pass
   (`.github/workflows/frontend-preview.yml`), deploys automatically on
   push to `frontend/design-system` or `feature/mvp-launch`.
2. **Production (AWS — primary)** — the full app, including the real RFQ
   API (`app/api/rfq`, `app/api/health`), running on AWS end to end. This
   is the target for the real domain.
3. **Production (Vercel + Supabase — legacy/alternative)** — kept working,
   see [§ Legacy path](#legacy-path-supabase--vercel) below.

---

## AWS architecture (primary)

```
Route 53 (optional)  ──alias──▶  ALB (public subnets, HTTPS via ACM)
                                     │
                                     ▼
                          ECS Fargate service (private subnets)
                             1 task, manufacturing-os-app image
                             from ECR
                                │              │
                    reads/writes│              │reads secret
                                ▼              ▼
                   S3: manufacturing-os-   Secrets Manager:
                   rfq-files-<acct-id>     manufacturing-os/
                   (private, encrypted,    rfq-db-app-credentials
                   Block Public Access)
                                │
                                ▼
                   RDS Postgres (private subnets, single-AZ,
                   db.t4g.micro) — manufacturing-os-db
```

All of this lives inside a **dedicated `manufacturing-os` VPC**
(`10.42.0.0/16` by default) with its own subnets, security groups, NAT
gateway, IAM roles, S3 buckets, Secrets Manager entries, ECR repo, and
CloudWatch log group — see [§ Isolation model](#isolation-model).

### Why ECS Fargate, not Amplify Hosting or Lambda/OpenNext

The task required picking **one** well-justified AWS runtime target for
the Next.js server, not the most sophisticated option. Three were
evaluated:

| Option | Verdict |
|---|---|
| **AWS Amplify Hosting** (SSR compute) | Simplest to operate (git-push deploys, managed HTTPS/custom domain) — but its Next.js SSR compute runs on a Lambda-based backend with a hard synchronous request/response payload ceiling (single-digit MB). This app's RFQ route accepts multipart file uploads up to `RFQ_MAX_FILE_MB` (100 MB) / `RFQ_MAX_TOTAL_MB` (300 MB) directly in the request body (`app/api/rfq/route.ts`) — that upload flow would break outright on Amplify's compute layer without a significant rearchitecture (browser-direct presigned-URL uploads bypassing the Next server). Rejected for this reason alone. |
| **Lambda + OpenNext / Next's AWS adapter** | Same Lambda payload-size ceiling as Amplify (it's the same underlying compute primitive), plus more moving parts to configure correctly (build adapter, cold starts, streaming responses) without being able to test any of it live in this pass (no AWS credentials in this session — see Constraints). Rejected for the same payload-size reason, and because it's *more* complex to stand up than Fargate here, not less. |
| **ECS Fargate + ALB** (chosen) | Runs a normal, long-lived Node process (the `next build` `output: "standalone"` server, see `next.config.ts` / `Dockerfile`) behind an ALB with **no Lambda-style payload ceiling** — the existing multipart upload flow works completely unchanged. More infrastructure to define than Amplify (VPC, ALB, ECS service/task definition — see `infra/terraform/`), but it is standard, well-documented Terraform, and it is the option that doesn't force an application rearchitecture to fit the runtime. |

CloudFront in front of the ALB was considered and **deliberately left
out** at MVP scale — ACM + ALB alone gets HTTPS and a custom domain,
which is the actual requirement; CloudFront adds edge caching/invalidation
management this traffic level doesn't need yet. Add it later if
CDN-level caching for the public marketing pages becomes worth the extra
piece.

### What was deliberately left out at MVP scale

(Full reasoning is inline as comments in the relevant `.tf` files —
summarized here.)

- **Multi-AZ RDS** (`var.db_multi_az = false`) — doubles RDS cost for HA a
  single-Fargate-task app doesn't have anywhere else yet.
- **Autoscaling** (ECS service, RDS storage) — fixed `desired_count = 1`,
  no Application Auto Scaling target. Add a target-tracking policy once
  real traffic shows a need.
- **A NAT Gateway per AZ** — one shared NAT Gateway by default
  (`var.single_nat_gateway = true`), trading a small HA gap (outbound
  internet from the *other* AZ's private subnet is briefly unavailable if
  that NAT's AZ has an outage) for materially lower cost. A single Fargate
  task already has no cross-AZ HA story to protect.
- **CloudFront, WAF, Fargate Spot, Container Insights, RDS Performance
  Insights, VPC Flow Logs** — each would be a reasonable *next* step, not
  an MVP-launch requirement. (Terraform remote state is no longer optional:
  `versions.tf` uses an S3 backend with S3-native locking, bucket created
  by the runbook, because the first apply runs in an ephemeral agent
  session.)

### Rough cost

See the (explicitly rough) table in
[docs/ops/LAUNCH-RUNBOOK.md § Rough monthly cost](./docs/ops/LAUNCH-RUNBOOK.md#rough-monthly-cost):
roughly US$95–120/month at MVP scale, dominated by the NAT Gateway, ALB,
Fargate task, RDS instance and public IPv4 addresses. Not a quote.

---

## Isolation model

Per the owner's explicit requirement ("Keep Manufacturing OS fully
isolated from every other project already using AWS"):

- **Prefer a dedicated AWS account.** That decision is the owner's to make
  (account creation/billing is an owner-side action — see AGENTS.md:
  "Human owner: approves... billing... irreversible decisions"). Nothing
  in this Terraform config assumes a specific account; point it at
  whichever account/credentials the owner chooses.
- **If a dedicated account isn't set up, this config still enforces hard
  isolation at the resource level:**
  - A **dedicated VPC** (`manufacturing-os-vpc`, own CIDR block, own
    subnets/route tables/NAT/IGW) — never the account's default VPC,
    never attached to any other VPC (no peering/Transit Gateway to
    anything else).
  - Every resource name is prefixed `manufacturing-os-` (enforced by a
    Terraform variable validation rule on `var.name_prefix` — see
    `infra/terraform/variables.tf`): `manufacturing-os-vpc`,
    `manufacturing-os-db`, `manufacturing-os-rfq-files-<account-id>`,
    `manufacturing-os-app` (ECR + ECS task family),
    `manufacturing-os-cluster`, `manufacturing-os-app-service`,
    `manufacturing-os-alb`, `manufacturing-os-ecs-execution-role`,
    `manufacturing-os-ecs-task-role`, `manufacturing-os-alb-sg` /
    `-ecs-service-sg` / `-rds-sg`, `manufacturing-os/rfq-db-app-credentials`
    / `-master-credentials` (Secrets Manager), `/ecs/manufacturing-os-app`
    (CloudWatch log group).
  - Every resource is tagged `Project = "manufacturing-os"` (plus
    `Environment`, `ManagedBy = "terraform"`) via the provider's
    `default_tags` block (`infra/terraform/versions.tf`) — so cost
    allocation, resource inventory, and IAM tag-based policies can all
    unambiguously scope to this project even inside a shared account.
  - **No resource in `infra/terraform/` references anything outside this
    configuration's own state** — no data source looks up another
    project's VPC/SG/bucket/role by name, no IAM policy grants access to
    a resource this config didn't create. IAM policies
    (`infra/terraform/iam.tf`) are scoped by ARN to exactly this project's
    S3 bucket and Secrets Manager entries.
  - Security groups only reference each other by ID within this VPC
    (ALB SG → ECS SG → RDS SG) — never a CIDR/SG from another project.
  - The RDS instance and ECS tasks live in **private subnets** with no
    public IP/route; the only public surface is the ALB.

---

## What this repo has already prepared

- `infra/terraform/` — the full Terraform configuration (VPC, RDS, S3,
  IAM, security groups, Secrets Manager, ECR, ECS Fargate service, ALB,
  optional Route 53/ACM). See `infra/terraform/terraform.tfvars.example`.
- `infra/sql/0001_rfq_intake_rds.sql`, `0002_admin_workflow_rds.sql` —
  plain-Postgres schema for RDS (same table shape as the Supabase
  migrations, adapted: no Supabase Storage/RLS-specific bits, grants for a
  least-privilege `manufacturing_os_app` database role). Applied by
  `scripts/migrate.mjs` (tracks `schema_migrations`, idempotent) as a
  one-off ECS task on every deploy.
- `infra/terraform/github_oidc.tf` — GitHub OIDC provider + a deploy role
  that only `main` of this repo can assume (ECR push, register task
  definitions, run the migration task, update the one service).
- `infra/terraform/ses.tf` — optional SES domain identity (DKIM records in
  the outputs) for same-day new-RFQ alerts to the owner.
- `Dockerfile` / `.dockerignore` — multi-stage build producing the image
  the ECS task runs, from Next.js's `output: "standalone"` trace
  (`next.config.ts`).
- `lib/rfq/store/aws.ts` — the `RfqStore` implementation for RDS + S3 (see
  [§ RfqStore: AWS backend](#rfqstore-aws-backend) below).
- `.github/workflows/deploy-production-aws.yml` — on every push to
  `main`: build + push the image (tagged by commit SHA), register task
  definitions, run DB migrations as a one-off ECS task, roll the service
  (circuit breaker auto-rollback), smoke-check `/api/health` for the new
  version. No-ops with a warning until the `AWS_DEPLOY_ROLE_ARN` repository
  variable exists.
- `.github/workflows/ci.yml` — typecheck/lint/unit tests/build; migrations
  applied twice against a throwaway Postgres 16 plus the AWS store's SQL
  run as the app role; `terraform fmt -check` + `validate`.
- `.env.example` — every environment variable this app reads, across all
  three backends, documented.
- Kept from the prior pass, now the legacy/alternative path:
  `supabase/migrations/` (0001 + 0002), `vercel.json`,
  `.github/workflows/deploy-production.yml` (manual dispatch only — no
  longer deploys on push, so production data can't split across two
  backends).

## RfqStore: AWS backend

`lib/rfq/store/aws.ts` implements the same `RfqStore` interface
(`lib/rfq/store/interface.ts`) as the existing `local.ts` and
`supabase.ts` — the API route (`app/api/rfq/route.ts`) is unchanged and
has no idea which backend is active.

- **Database**: a `pg` connection pool against `DATABASE_URL` (RDS
  Postgres), connecting as the least-privilege `manufacturing_os_app`
  role (`infra/sql/0001…`/`0002…` grant it `SELECT`/`INSERT`/`UPDATE` on
  the RFQ tables, `SELECT`/`INSERT` only on the append-only notes and
  status-history tables, nothing else — the RDS master user is a separate
  credential only the one-off migration task receives, never the running
  app). `createSubmission` runs inside a transaction so a
  failed file upload can't leave an orphaned submission row.
- **Files**: uploaded via `@aws-sdk/client-s3`'s `PutObjectCommand`
  straight to the `manufacturing-os-rfq-files-<account-id>` bucket, with
  `ServerSideEncryption: "AES256"` and no ACL (the bucket has ACLs
  disabled entirely via `BucketOwnerEnforced` object ownership — see
  `infra/terraform/s3.tf`). Reads go through a **short-lived presigned
  GET URL** (`@aws-sdk/s3-request-presigner`, 5-minute expiry) — the same
  signed-URL pattern `SupabaseRfqStore` already used, never a public/CDN
  path.
- **Privacy enforced at the infrastructure level, not just app code**:
  Block Public Access is on for all four settings on the bucket, the RDS
  instance is `publicly_accessible = false` in a private subnet, and its
  security group only accepts inbound 5432 from the ECS task's security
  group — there is no network path to either from outside the VPC, let
  alone the public internet.
- **Credentials**: the running ECS task assumes an IAM role
  (`manufacturing-os-ecs-task-role`) scoped to exactly `PutObject`/
  `GetObject`/`ListBucket` on this one bucket (plus `ses:SendEmail` on the
  two alert identities when alerts are enabled) — no static AWS access keys
  are ever set as an app env var. `DATABASE_URL` is injected by ECS from
  Secrets Manager at container start (`infra/terraform/ecs.tf`'s
  `secrets` block, resolved via the execution role) — it is never a
  plaintext value in the task definition, a GitHub Actions log, or the
  container image.

Selected via `RFQ_BACKEND=aws` (or auto-detected when `DATABASE_URL` +
`AWS_S3_RFQ_BUCKET` are both set — see `lib/rfq/config.ts`).

## Content layer: no AWS dependency needed

(Scheduling/publishing on top of it — `publishStatus`, `publishAt`, the
owner's pause switch — is described in
[docs/ops/content-pipeline.md](./docs/ops/content-pipeline.md); the only
AWS-side piece is the small `content_overrides` table used by Pause.)


`ContentAdapter` (`lib/content/adapter.ts`) stays exactly as it was —
repository-backed (TypeScript data files compiled into the build), no AWS
wiring added. Reasoning: per AGENTS.md rule 3 ("Public knowledge belongs
in Sanity; private operational data belongs in Postgres/Supabase"), the
content layer's eventual home is Sanity (a real swap-in behind this same
`ContentAdapter` interface, already noted in that file's comments), not a
generic AWS data store — building an interim AWS-backed content store
would be throwaway work on the way to that real target, and content isn't
customer-private data that needs the RFQ backend's isolation guarantees.
If/when Sanity is adopted, only `SanityContentAdapter` needs to be added;
nothing else in this pass needed to change to keep that path open.

---

## Deploy steps (AWS)

Moved to **[docs/ops/LAUNCH-RUNBOOK.md](./docs/ops/LAUNCH-RUNBOOK.md)**,
which replaces the earlier manual steps here (manual `psql` migration,
`:latest` image + `--force-new-deployment`, hand-made OIDC role). Summary:

1. A session with temporary AWS keys installs Terraform + the AWS provider
   from `releases.hashicorp.com` (no registry access needed), creates the
   S3 state bucket, and runs `terraform apply` (service starts at 0 tasks).
2. The `terraform output github_actions_variables` values become GitHub
   repository variables (only `AWS_DEPLOY_ROLE_ARN` is required).
3. Admin credentials are generated (scrypt hash + session secret + TOTP),
   stored in the `manufacturing-os/admin` secret, and handed to the owner
   through a one-time secret.
4. The deploy workflow is triggered: image build → migrations (one-off ECS
   task) → rollout → `/api/health` reports the commit.
5. OWNER: ACM validation + site CNAMEs, SES DKIM CNAMEs, SES verification
   click; agent re-applies with `external_dns_validated = true` for HTTPS.
6. The bootstrap access key is deleted. From then on only the main-branch
   OIDC role deploys.

**The admin (`/admin`) only works over HTTPS** — its session cookie is
`Secure` with the `__Host-` prefix — so it becomes usable at step 5.

---

## Teardown / isolation verification

Because every resource lives in a dedicated VPC and is named/tagged
distinctly (see [§ Isolation model](#isolation-model)):

```bash
cd infra/terraform
terraform destroy
```

removes **only** manufacturing-os's own resources — it cannot touch
another project's VPC, database, bucket, role, or security group, because
nothing in this configuration ever references one. To double-check before
a real destroy in a shared account, `terraform state list` shows exactly
the resources this config manages (all prefixed `manufacturing-os-` per
the naming rule), or filter the account's Resource Groups /
Tag Editor by `Project = manufacturing-os` to see every resource this
project created, anywhere, independent of Terraform state.

Note: `aws_db_instance.main` takes a final snapshot on destroy
(`final_snapshot_identifier`) rather than being deleted with no backup —
delete that snapshot manually afterward once you're sure it's not needed,
since `terraform destroy` does not remove it.

---

## Local development

```bash
npm install
npm run dev
```

RFQ submissions locally use the disk-backed fallback
(`lib/rfq/store/local.ts`, writes under `.data/rfq/`, gitignored) unless
`DATABASE_URL` + `AWS_S3_RFQ_BUCKET` (AWS) or `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` (legacy) are set in `.env.local`. See
`.env.example` for every variable.

**Owner admin locally** (`http://localhost:3000/admin`): add to
`.env.local`

```bash
ADMIN_USERNAME=owner
ADMIN_PASSWORD_HASH=<output of: npm run admin:hash-password>
ADMIN_SESSION_SECRET=<output of: openssl rand -base64 48>
# optional 2FA: ADMIN_TOTP_SECRET=<output of: npm run admin:totp-secret>
```

The session cookie is `Secure`; browsers treat `http://localhost` as a
secure context, so this works locally, but on any other plain-HTTP host the
admin deliberately cannot log in. `CONTENT_SMOKE_FIXTURES=true` (build and
start) adds four `/robot-parts/smoke-fixture-*` pages for exercising the
content calendar (`lib/content/repository/guides/smoke-fixtures.ts`); never
set it in production. `npm run migrate` applies `infra/sql/` to
`MIGRATION_DATABASE_URL` (a local Postgres; `AWS_DB_SSL=off`).

To build and run the production Docker image locally against the local
fallback store:

```bash
docker build -t manufacturing-os-app .
docker run -p 3000:3000 -e RFQ_BACKEND=local manufacturing-os-app
```

---

## Legacy path: Supabase + Vercel

Kept working, fully documented, **no longer the primary/required
production path** per the owner's explicit instruction to "remove/disable
any requirement that the owner must create Supabase or verify Vercel
billing for production launch." Use this instead of AWS only if there's a
specific reason to (e.g. comparing platforms, or a temporary staging
deploy) — it needs no infrastructure of its own beyond the two external
accounts below.

### 1. Create the Supabase project

1. In the Supabase dashboard, create a new project (free tier is enough
   to start).
2. Once created, get the project URL and **service role** key from
   *Project Settings → API*.
3. Apply the migration: `supabase link --project-ref <ref>` then
   `supabase db push`, or paste
   `supabase/migrations/0001_rfq_intake.sql` into the SQL editor and run
   it once.
4. Confirm the `rfq-files` bucket exists and is **not** public (the
   migration creates it as private; double-check in
   *Storage → rfq-files → Configuration*).

### 2. Resolve the Vercel account and create the project

1. Create a Vercel project from this GitHub repo
   (`thong021196/manufacturing-os`), pointing at the `main` branch,
   framework preset "Next.js".
2. In the new project's settings, get `VERCEL_TOKEN` (account → Settings
   → Tokens), `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` (Project Settings
   → General, or `.vercel/project.json` after `vercel link` locally).
3. Add all three as **repository secrets** in GitHub
   (`Settings → Secrets and variables → Actions`) —
   `deploy-production.yml` picks them up automatically on the next push
   to `main`.
4. In the Vercel project's environment variables, set
   `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   (server-only, never `NEXT_PUBLIC_`), and optionally
   `RFQ_MAX_FILE_MB` / `RFQ_MAX_FILES` / `RFQ_MAX_TOTAL_MB`. Leave
   `RFQ_BACKEND` unset — it auto-resolves to `supabase` once the two
   Supabase vars are set (`lib/rfq/config.ts`'s `rfqBackend()` checks
   `aws` env vars first, then `supabase`, so make sure `DATABASE_URL` /
   `AWS_S3_RFQ_BUCKET` are NOT also set on this Vercel project, or it
   will try to use the AWS backend instead).

### 3. Point the custom domain

1. Vercel dashboard → Project → Settings → Domains → add the domain.
2. Add the `A`/`ALIAS` or `CNAME` record Vercel gives you at your DNS
   registrar.
3. Vercel automatically issues and renews the HTTPS certificate.
4. Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.

### Verifying a Supabase/Vercel deployment

Same checks as the AWS path's [§ Verify](#6-verify) — `GET /api/health`
should read `"rfqBackend":"supabase"` here instead of `"aws"`.
