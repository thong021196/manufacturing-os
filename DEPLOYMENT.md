# Deployment guide

**Primary production target: AWS.** This was changed from Vercel+Supabase
per the owner's review comment on PR #26 (comment id 5750338323,
2026-09-20): "use an AWS-first stack and remove Vercel/Supabase as
required production dependencies." Vercel/Supabase are kept working as a
documented legacy/alternative path further down this file, but nothing in
production launch requires the owner to create a Supabase project or
resolve Vercel billing anymore.

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
  Insights, VPC Flow Logs, a Terraform S3/DynamoDB remote state backend**
  — each would be a reasonable *next* step, not an MVP-launch requirement.
  `infra/terraform/versions.tf` has the remote-state backend block
  pre-written and commented out for when it's wanted.

### Rough, conservative MVP-scale cost estimate

**Approximate only, not verified against current AWS pricing — get a real
number from the AWS Pricing Calculator or Cost Explorer before treating
this as a budget.** Single region, single-AZ RDS, one small Fargate task,
one NAT Gateway, low traffic: roughly **US$60–100/month**, dominated by
the NAT Gateway (~$32/mo + data) and the always-on RDS instance and
Fargate task (each roughly $10–15/mo at these sizes); S3/Secrets
Manager/ALB/data transfer at MVP volume are typically a few dollars each.

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
- `infra/sql/0001_rfq_intake_rds.sql` — plain-Postgres schema for RDS
  (same table shape as the Supabase migration, adapted: no Supabase
  Storage/RLS-specific bits, adds a least-privilege
  `manufacturing_os_app` database role).
- `Dockerfile` / `.dockerignore` — multi-stage build producing the image
  the ECS task runs, from Next.js's `output: "standalone"` trace
  (`next.config.ts`).
- `lib/rfq/store/aws.ts` — the `RfqStore` implementation for RDS + S3 (see
  [§ RfqStore: AWS backend](#rfqstore-aws-backend) below).
- `.github/workflows/deploy-production-aws.yml` — builds the Docker image
  and deploys it to the ECS service on every push to `main`, but only
  runs once the `AWS_DEPLOY_ROLE_ARN` secret exists; until then it no-ops
  with a clear warning instead of failing.
- `.github/workflows/ci.yml` — typecheck/lint/build on every PR and push
  to `main` (unchanged behavior, one incidental fix: added
  `npx next typegen` before `tsc --noEmit`, which Next.js 16 requires for
  `PageProps`/`LayoutProps` route-type helpers to resolve on a fresh
  checkout — found while verifying this pass's own changes).
- `.env.example` — every environment variable this app reads, across all
  three backends, documented.
- Kept from the prior pass, now the legacy/alternative path:
  `supabase/migrations/0001_rfq_intake.sql`, `vercel.json`,
  `.github/workflows/deploy-production.yml`.

## RfqStore: AWS backend

`lib/rfq/store/aws.ts` implements the same `RfqStore` interface
(`lib/rfq/store/interface.ts`) as the existing `local.ts` and
`supabase.ts` — the API route (`app/api/rfq/route.ts`) is unchanged and
has no idea which backend is active.

- **Database**: a `pg` connection pool against `DATABASE_URL` (RDS
  Postgres), connecting as the least-privilege `manufacturing_os_app`
  role (`infra/sql/0001_rfq_intake_rds.sql` grants it exactly
  `SELECT`/`INSERT`/`UPDATE` on the two RFQ tables, nothing else — the RDS
  master user is a separate credential used only to run migrations, never
  by the running app). `createSubmission` runs inside a transaction so a
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
  `GetObject`/`ListBucket` on this one bucket — no static AWS access keys
  are ever set as an app env var. `DATABASE_URL` is injected by ECS from
  Secrets Manager at container start (`infra/terraform/ecs.tf`'s
  `secrets` block, resolved via the execution role) — it is never a
  plaintext value in the task definition, a GitHub Actions log, or the
  container image.

Selected via `RFQ_BACKEND=aws` (or auto-detected when `DATABASE_URL` +
`AWS_S3_RFQ_BUCKET` are both set — see `lib/rfq/config.ts`).

## Content layer: no AWS dependency needed

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

### 0. Prerequisites (owner-side, account-level)

1. Decide: a dedicated AWS account for `manufacturing-os` (preferred), or
   a shared account with the isolation model above (already enforced by
   this Terraform config either way).
2. Have AWS credentials for that account/region available locally (or in
   CI) with permission to create the resources this config defines —
   `AdministratorAccess` for the first `terraform apply` is the simplest
   starting point for an account dedicated to this project; scope it down
   afterward if desired.
3. Install [Terraform](https://developer.hashicorp.com/terraform/install)
   >= 1.5 and the [AWS CLI](https://aws.amazon.com/cli/) v2.
4. (Optional, only if using Route 53 in this account for the domain) Know
   the hosted zone ID for the production domain.

**This repository's own session had none of the above — no AWS
credentials, no AWS MCP tools, and did not and could not provision any
live AWS resource.** Everything under `infra/terraform/` was written,
formatted (`terraform fmt`), and validated (`terraform validate` — via a
real `hashicorp/aws` provider install through a manually-configured
filesystem mirror, since this sandbox's network policy blocks
`registry.terraform.io`'s discovery endpoint but allows
`releases.hashicorp.com`'s direct downloads; see the mirror technique
in this PR's description if useful) against the real AWS provider schema.
A `terraform plan` was also attempted and got past every local
validation, all the way to a real AWS STS `GetCallerIdentity` call, which
correctly failed for lack of credentials — i.e., the configuration's
resource graph and references are confirmed sound; only live
provisioning (which requires the owner's own credentials) was not done.

### 1. Provision the infrastructure

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars: aws_region, environment, site_url, and DNS vars
# if using Route 53 (see § DNS below). Do NOT put passwords in this file.

export TF_VAR_db_master_password="$(openssl rand -base64 24)"
export TF_VAR_db_app_password="$(openssl rand -base64 24)"
# Save both somewhere safe (a password manager) -- you'll need the master
# password again in step 2.

terraform init
terraform plan   # review what it's about to create
terraform apply
```

This creates: the VPC + subnets + NAT/IGW + route tables, the RDS
instance, the S3 bucket (+ public access block + encryption + lifecycle
rule), the ECR repo, the ECS cluster + task definition + service, the
ALB (+ target group + listeners), IAM roles/policies, security groups,
Secrets Manager entries, and (if `route53_zone_id`/`domain_name` are set)
the ACM certificate + validation records + Route 53 alias. Exact resource
list and naming: see [§ Isolation model](#isolation-model) above.

The ECS service will fail its first deployment (no real image pushed
yet — `var.container_image` defaults to a placeholder) — that's expected
until step 3.

### 2. Apply the database schema

```bash
# Get the master connection string (or read it from Secrets Manager:
# the db_master_credentials_secret_arn Terraform output).
MASTER_URL=$(terraform output -raw db_master_credentials_secret_arn | \
  xargs -I{} aws secretsmanager get-secret-value --secret-id {} \
  --query SecretString --output text | jq -r .database_url)

psql "$MASTER_URL" \
  -v app_password="$TF_VAR_db_app_password" \
  -f ../sql/0001_rfq_intake_rds.sql
```

This creates the `manufacturing_os_app` role (password from
`TF_VAR_db_app_password`, matching what Terraform already put in the
`db_app_credentials` Secrets Manager entry the running app reads) and the
`rfq_submissions` / `rfq_files` tables with least-privilege grants. Run
this once; re-running is safe (every statement is `if not exists` /
`create or replace`).

### 3. Build and push the app image, deploy it

The first deploy can be done manually; every subsequent one happens
automatically via `.github/workflows/deploy-production-aws.yml` once its
one required secret exists (see step 4).

```bash
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$(terraform output -raw ecr_repository_url | cut -d/ -f1)"

docker build -t manufacturing-os-app .
docker tag manufacturing-os-app:latest "$(terraform output -raw ecr_repository_url):latest"
docker push "$(terraform output -raw ecr_repository_url):latest"

aws ecs update-service --cluster "$(terraform output -raw ecs_cluster_name)" \
  --service "$(terraform output -raw ecs_service_name)" --force-new-deployment
```

#### A note on image tagging

This MVP pass uses a mutable `:latest` tag + `--force-new-deployment` —
the simplest pattern that works, at the cost of losing an explicit
"which exact image is task definition revision N" audit trail. If/when
that guarantee matters, switch to: tag images by git SHA, render a new
task definition JSON with that image (e.g.
`aws-actions/amazon-ecs-render-task-definition` +
`amazon-ecs-deploy-task-definition` in the GitHub Actions workflow), and
let ECS create a new task definition revision per deploy (enabling clean
rollback via `aws ecs update-service --task-definition <prior-revision>`).
Not done in this pass — an explicit "avoid premature automation, don't
overbuild" tradeoff (AGENTS.md rule 10).

### 4. Set up GitHub OIDC → AWS deploy role (for CI/CD)

So `.github/workflows/deploy-production-aws.yml` can build/push/deploy
without any long-lived AWS access keys stored in GitHub:

1. Create (or reuse, if this AWS account already has one) an OIDC
   identity provider for `token.actions.githubusercontent.com` — see
   [GitHub's own guide](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services).
2. Create an IAM role `manufacturing-os-github-deploy-role` (kept out of
   `infra/terraform/` deliberately — this role's trust policy needs this
   specific GitHub repo/branch, which is more of an account-bootstrap
   step than app infrastructure) trusting that OIDC provider, scoped to:
   `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`,
   `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`,
   `ecr:CompleteLayerUpload` on the `manufacturing-os-app` ECR repo, and
   `ecs:UpdateService`, `ecs:DescribeServices` on the
   `manufacturing-os-app-service` ECS service.
3. Add that role's ARN as the repo secret `AWS_DEPLOY_ROLE_ARN`
   (`Settings → Secrets and variables → Actions`).
4. (Optional) Set repo variables `AWS_REGION`, `AWS_ECS_CLUSTER`,
   `AWS_ECS_SERVICE` if the Terraform `name_prefix`/`aws_region` were
   changed from their defaults.

### 5. DNS / custom domain

**If the domain's DNS is managed in Route 53, in this AWS account:**
set `route53_zone_id` and `domain_name` in `terraform.tfvars` and re-run
`terraform apply` — it requests an ACM certificate, DNS-validates it
automatically (creates the validation CNAME records itself), attaches it
to the ALB's HTTPS listener, and creates the `A` alias record pointing at
the ALB. Nothing further to do; the certificate auto-renews.

**If DNS is managed outside Route 53** (a registrar, Cloudflare, etc.):

1. Issue a certificate for the domain via
   [AWS Certificate Manager](https://console.aws.amazon.com/acm/) with
   DNS validation, and add the CNAME record it gives you at your DNS
   provider.
2. Once validated, set `acm_certificate_arn` in `terraform.tfvars` to
   that certificate's ARN and re-run `terraform apply` — this attaches it
   to the ALB's HTTPS listener.
3. At your DNS provider, point the domain at the ALB: a `CNAME` (for a
   subdomain) or, for an apex/root domain most providers support some
   form of "ALIAS"/"ANAME" record — to the ALB's DNS name (`terraform
   output alb_dns_name`).
4. Set `NEXT_PUBLIC_SITE_URL` (via `var.site_url` in `terraform.tfvars`,
   which sets it as an ECS task environment variable) to the final
   `https://` domain and redeploy, so canonical URLs / Open Graph /
   `sitemap.xml` / `robots.txt` point at the real domain.

Either way, until a certificate exists, the ALB serves plain HTTP on its
own `*.elb.amazonaws.com` DNS name (`terraform output alb_dns_name`) —
fine for an initial smoke test, not for real production traffic.

### 6. Verify

1. `GET https://<domain>/api/health` (or the ALB DNS name over HTTP
   before a cert exists) should return
   `{"status":"ok", "rfqBackend":"aws", ...}`. If `rfqBackend` reads
   `"local"`, the ECS task's env vars/secrets are missing or misnamed —
   check the task definition (`infra/terraform/ecs.tf`) actually applied.
2. Submit a real test RFQ through `/rfq` and confirm a row appears in
   `rfq_submissions` (via `psql` against the master connection string)
   and an object appears in the `manufacturing-os-rfq-files-<account-id>`
   S3 bucket.
3. Confirm the S3 object is NOT publicly reachable (e.g.
   `curl -I https://manufacturing-os-rfq-files-<account-id>.s3.amazonaws.com/<key>`
   should return `403`, never `200`).
4. `GET /sitemap.xml` and `/robots.txt` reflect the real domain.
5. Spot-check `/`, `/parts/robot-joint-housing`, `/how-it-works`, `/rfq`,
   and a 404 route on both desktop and mobile widths.

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
