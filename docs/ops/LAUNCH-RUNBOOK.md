# Launch runbook — AWS production bootstrap

Audience: **a future agent session** that has temporary AWS credentials in its
environment (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`), plus
**the owner** for the few steps only they can do (marked **OWNER**).

Goal: one pass from "nothing exists" to "site live on the ALB, deploys on every
push to `main`, admin ready", then the owner's DNS steps, then revoke the
bootstrap key.

Everything is created by `infra/terraform/` (all names `manufacturing-os-*`,
all tagged `Project=manufacturing-os`). Images are built by GitHub Actions
(`.github/workflows/deploy-production-aws.yml`), never in the agent sandbox
(it has no Docker daemon).

> Preconditions
> - PR #26 is **merged to `main`** (Human Gate). The deploy workflow only
>   runs from `main`, and the OIDC role only trusts `refs/heads/main`.
> - The bootstrap credentials belong to a **dedicated IAM user** (e.g.
>   `manufacturing-os-bootstrap`) with `AdministratorAccess` in the account
>   meant for this project — never root-account keys. Step 10 deletes it.
> - Pick values up front: `site_url` (e.g. `https://www.example.com`), the
>   domain for alert email (optional), the owner's alert inbox, the owner's
>   timezone.

Contents: [0 Preflight](#0-preflight) · [1 Tools](#1-install-tools-no-registryterraformio-needed) ·
[2 State bucket](#2-remote-state-bucket) · [3 Variables](#3-variables-and-db-passwords) ·
[4 Apply](#4-terraform-apply) · [5 GitHub variables](#5-github-repository-variables) ·
[6 Admin credentials](#6-admin-credentials) · [7 First deploy](#7-first-deploy) ·
[8 Verify](#8-verify) · [9 OWNER DNS](#9-owner-only-dns-and-email-steps) ·
[10 Revoke](#10-revoke-the-bootstrap-access-key) · [Costs](#rough-monthly-cost) ·
[Operations](#day-2-operations)

---

## 0. Preflight

```bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git fetch origin main && git checkout main && git pull --ff-only
: "${AWS_ACCESS_KEY_ID:?}" "${AWS_SECRET_ACCESS_KEY:?}" "${AWS_REGION:?}"
export AWS_DEFAULT_REGION="$AWS_REGION"
WORK="$(mktemp -d)"; chmod 700 "$WORK"; umask 077    # scratch for secrets; deleted at the end
```

## 1. Install tools (no registry.terraform.io needed)

The agent sandbox reaches `releases.hashicorp.com` and `awscli.amazonaws.com`
but not `registry.terraform.io`, so Terraform's AWS provider is installed from
the release archive into a local filesystem mirror.

```bash
TF_VERSION=1.13.5          # validated in CI (hashicorp/setup-terraform) with this config
AWS_PROVIDER_VERSION=5.100.0   # satisfies "~> 5.0" in versions.tf
BIN="$HOME/.local/bin"; mkdir -p "$BIN"; export PATH="$BIN:$PATH"

# Terraform (checksum-verified)
cd "$WORK"
curl -fsSLO "https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_linux_amd64.zip"
curl -fsSLO "https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_SHA256SUMS"
grep "linux_amd64.zip" "terraform_${TF_VERSION}_SHA256SUMS" | sha256sum -c -
python3 -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extract('terraform', sys.argv[2])" \
  "terraform_${TF_VERSION}_linux_amd64.zip" "$BIN" && chmod +x "$BIN/terraform"

# hashicorp/aws provider -> filesystem mirror (checksum-verified)
MIRROR="$HOME/.terraform-mirror"
P="$MIRROR/registry.terraform.io/hashicorp/aws/${AWS_PROVIDER_VERSION}/linux_amd64"; mkdir -p "$P"
Z="terraform-provider-aws_${AWS_PROVIDER_VERSION}_linux_amd64.zip"
curl -fsSLO "https://releases.hashicorp.com/terraform-provider-aws/${AWS_PROVIDER_VERSION}/${Z}"
curl -fsSLO "https://releases.hashicorp.com/terraform-provider-aws/${AWS_PROVIDER_VERSION}/terraform-provider-aws_${AWS_PROVIDER_VERSION}_SHA256SUMS"
grep " ${Z}\$" "terraform-provider-aws_${AWS_PROVIDER_VERSION}_SHA256SUMS" | sha256sum -c -
python3 -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$Z" "$P"
chmod +x "$P"/terraform-provider-aws_*
cat > "$HOME/.terraformrc" <<EOF
provider_installation {
  filesystem_mirror {
    path    = "$MIRROR"
    include = ["registry.terraform.io/hashicorp/aws"]
  }
  direct {
    exclude = ["registry.terraform.io/hashicorp/aws"]
  }
}
EOF

# AWS CLI v2
curl -fsSLo awscliv2.zip "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip"
python3 -c "import zipfile; zipfile.ZipFile('awscliv2.zip').extractall('.')" && chmod -R +x aws
./aws/install --install-dir "$HOME/.local/aws-cli" --bin-dir "$BIN" --update
# (fallback if that fails: pip install --user awscli)

cd - >/dev/null
terraform version && aws --version && jq --version
aws sts get-caller-identity          # confirm the account before creating anything
export ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
```

## 2. Remote state bucket

State must survive this session (it contains the RDS passwords, so it is
encrypted and private).

```bash
export TF_STATE_BUCKET="manufacturing-os-tfstate-${ACCOUNT_ID}"
if [ "$AWS_REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$TF_STATE_BUCKET"
else
  aws s3api create-bucket --bucket "$TF_STATE_BUCKET" --create-bucket-configuration LocationConstraint="$AWS_REGION"
fi
aws s3api put-public-access-block --bucket "$TF_STATE_BUCKET" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-versioning --bucket "$TF_STATE_BUCKET" --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket "$TF_STATE_BUCKET" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-bucket-tagging --bucket "$TF_STATE_BUCKET" \
  --tagging 'TagSet=[{Key=Project,Value=manufacturing-os},{Key=ManagedBy,Value=bootstrap}]'
```

## 3. Variables and DB passwords

```bash
cd infra/terraform
cat > terraform.tfvars <<'EOF'
aws_region       = "us-east-1"                      # <- same as $AWS_REGION
site_url         = "https://www.example.com"        # <- final https URL (works before DNS exists)
admin_timezone   = "Europe/London"                  # <- owner's IANA timezone
admin_visit_days = "Mon,Thu"

# Domain (optional now, but do it now if you can -- see step 9):
# domain_name    = "www.example.com"
# domain_aliases = ["example.com"]
# route53_zone_id = "Z..."       # only if the zone is in Route 53 in THIS account

# New-RFQ email alerts (all three or none):
# ses_domain       = "example.com"
# ses_from_address = "rfq-alerts@example.com"
# notify_email_to  = "owner@example.com"
EOF
sed -i "s/^aws_region .*/aws_region       = \"${AWS_REGION}\"/" terraform.tfvars
$EDITOR terraform.tfvars   # or sed the real values in; terraform.tfvars is gitignored

# Generated, never printed, never committed. Terraform stores them in
# Secrets Manager (db credentials) -- nobody needs to remember them.
export TF_VAR_db_master_password="$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-32)"
export TF_VAR_db_app_password="$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-32)"
```

(`/`, `+`, `=` are stripped because the passwords are embedded in
`postgresql://` URLs.)

## 4. Terraform apply

```bash
terraform init -input=false \
  -backend-config="bucket=${TF_STATE_BUCKET}" -backend-config="region=${AWS_REGION}"
terraform validate
terraform plan -input=false -out=tfplan      # review: ~60 resources, all manufacturing-os-*
terraform apply -input=false tfplan          # ~10-15 min (RDS + NAT dominate)
terraform output -json > "$WORK/tf-outputs.json"
terraform output certificate_status
```

If the account already has a GitHub OIDC provider, apply fails on
`aws_iam_openid_connect_provider.github`; add
`github_oidc_provider_arn = "arn:aws:iam::<acct>:oidc-provider/token.actions.githubusercontent.com"`
to `terraform.tfvars` and apply again.

What exists now: VPC (2 AZ, 1 NAT), RDS Postgres (private), private S3 bucket,
ECR repo, ECS cluster + app service **at 0 tasks** + migration task
definition, ALB (HTTP), IAM roles (task, execution, migrate-execution, GitHub
deploy), Secrets Manager (`manufacturing-os/rfq-db-app-credentials`,
`manufacturing-os/rfq-db-master-credentials`, `manufacturing-os/admin` with
placeholders), optional ACM certificate request and SES identities.

## 5. GitHub repository variables

Values: `terraform output -json github_actions_variables`.

If this session has a GitHub token with admin rights on the repo
(`gh auth status`), set them directly:

```bash
jq -r '.github_actions_variables.value | to_entries[] | select(.value != "") | "\(.key)\t\(.value)"' "$WORK/tf-outputs.json" |
while IFS=$'\t' read -r k v; do gh variable set "$k" --repo thong021196/manufacturing-os --body "$v"; done
gh variable list --repo thong021196/manufacturing-os
```

Otherwise **OWNER**: GitHub → repo → Settings → Secrets and variables →
Actions → **Variables** → add each name/value printed by
`terraform output github_actions_variables` (at minimum `AWS_DEPLOY_ROLE_ARN`
and `AWS_REGION`). These are not secrets; no AWS keys go into GitHub.

## 6. Admin credentials

Creates the owner login and 2FA, stores them in Secrets Manager, and hands
the owner the password + authenticator secret through a **temporary** secret
they read once in the AWS console and then delete. Nothing is printed.

```bash
cd "$(git rev-parse --show-toplevel)"
npm ci
ADMIN_USER="owner"                                   # or the owner's chosen username
npm run -s admin:hash-password -- --generate --json > "$WORK/pw.json"      # {"password","hash"}
npm run -s admin:totp-secret -- --json --account "$ADMIN_USER" > "$WORK/totp.json"  # {"secret","otpauthUri"}

jq -n --arg u "$ADMIN_USER" --slurpfile pw "$WORK/pw.json" --slurpfile t "$WORK/totp.json" \
      --arg s "$(openssl rand -base64 48)" \
  '{ADMIN_USERNAME:$u, ADMIN_PASSWORD_HASH:$pw[0].hash, ADMIN_SESSION_SECRET:$s, ADMIN_TOTP_SECRET:$t[0].secret}' \
  > "$WORK/admin.json"
aws secretsmanager put-secret-value --secret-id manufacturing-os/admin --secret-string "file://$WORK/admin.json"

jq -n --arg u "$ADMIN_USER" --slurpfile pw "$WORK/pw.json" --slurpfile t "$WORK/totp.json" \
  '{username:$u, password:$pw[0].password, totp_secret:$t[0].secret, totp_uri:$t[0].otpauthUri,
    note:"Store the password in a password manager, add the TOTP secret to an authenticator app, then DELETE this secret."}' \
  > "$WORK/handoff.json"
aws secretsmanager create-secret --name manufacturing-os/admin-bootstrap-handoff \
  --description "One-time handoff of the initial admin password + TOTP secret. Owner deletes after reading." \
  --tags Key=Project,Value=manufacturing-os --secret-string "file://$WORK/handoff.json"
shred -u "$WORK/pw.json" "$WORK/totp.json" "$WORK/admin.json" "$WORK/handoff.json" 2>/dev/null || rm -f "$WORK"/*.json
```

**OWNER** (any time before first admin use): AWS console → Secrets Manager →
`manufacturing-os/admin-bootstrap-handoff` → *Retrieve secret value* → save the
password in a password manager, add `totp_secret` to an authenticator app
(Google Authenticator, 1Password, …) → **Delete secret** (choose the 7-day
minimum waiting period or, via CLI, `--force-delete-without-recovery`).

To change the password later (owner, on any machine with Node):
`npm run admin:hash-password` (prompts, hidden input) → put the new hash into
`manufacturing-os/admin` (`ADMIN_PASSWORD_HASH`) → re-run the deploy workflow.
Changing the hash or `ADMIN_SESSION_SECRET` signs out every session.
`ADMIN_TOTP_SECRET = "UNSET"` disables 2FA (not recommended).

## 7. First deploy

The deploy workflow builds the image, registers task definitions, runs
`scripts/migrate.mjs` as a one-off ECS task (creates the least-privilege DB
role, applies `infra/sql/0001…`, `0002…`), scales the service to 1 and waits
for `/api/health` to report the commit.

Trigger it (any one of):
- GitHub MCP tool `actions_run_trigger` (workflow `deploy-production-aws.yml`, ref `main`);
- `gh workflow run deploy-production-aws.yml --ref main --repo thong021196/manufacturing-os`;
- **OWNER**: Actions → *Deploy production (AWS)* → *Run workflow* (branch `main`).

Watch it: `gh run watch` / the Actions tab. Every step echoes what it did; a
failed migration stops before the service is touched.

## 8. Verify

```bash
ALB="$(jq -r .alb_dns_name.value "$WORK/tf-outputs.json")"
curl -fsS "http://$ALB/api/health" | jq .      # status ok, rfqBackend "aws", version = main's commit
curl -fsS -o /dev/null -w "%{http_code}\n" "http://$ALB/"             # 200
curl -fsS "http://$ALB/sitemap.xml" | head -5                           # uses site_url
curl -s -o /dev/null -w "%{http_code}\n" "http://$ALB/admin"            # 307 -> /admin/login
BUCKET="$(jq -r .rfq_files_bucket_name.value "$WORK/tf-outputs.json")"
curl -s -o /dev/null -w "%{http_code}\n" "https://${BUCKET}.s3.amazonaws.com/"   # 403 (private)
aws logs tail /ecs/manufacturing-os-app --since 30m | tail -50          # migrate/ + app/ streams
```

Then submit one test RFQ through `http://$ALB/rfq` (small dummy `.step`
file, company "LAUNCH TEST") and confirm with `aws s3 ls "s3://$BUCKET/" --recursive`.
The owner archives it from the admin later.

**The admin cannot be used on the plain-HTTP ALB name — by design.** Its
session cookie is `Secure` (`__Host-` prefix), so login only works over HTTPS
(step 9). Credentials and CAD downloads never travel over plain HTTP.

## 9. OWNER-only DNS and email steps

Records are in the Terraform outputs (`terraform output`, or ask the agent
to paste them). Do these while the bootstrap session is still open if at all
possible — turning on HTTPS needs one more `terraform apply`.

1. **Certificate validation** — add every `acm_validation_records` entry
   (CNAME name → value) at the DNS provider. Skip if `route53_zone_id` was set.
2. **Site hostname** — add `site_dns_records`: `www` CNAME → the ALB DNS name.
   For the apex (`example.com`), use the provider's ALIAS/ANAME/flattened
   CNAME, or a redirect to `www`. Route 53 zones get the alias automatically.
3. **Turn on HTTPS** (agent, once `aws acm describe-certificate` shows
   `ISSUED`, usually minutes after step 1):
   ```bash
   cd infra/terraform
   terraform apply -input=false -var external_dns_validated=true   # add it to terraform.tfvars too
   ```
   HTTP now redirects to HTTPS. Set the repo variable
   `PRODUCTION_URL=https://www.example.com` (step 5 method) so deploys
   smoke-check the real URL.
4. **Email alerts** — add the three `ses_dkim_records` CNAMEs (automatic in
   Route 53), and click the verification link SES emails to
   `notify_email_to` ("Amazon Web Services – Email Address Verification
   Request"). Alerts start as soon as both show *Verified* in the SES
   console. Optional but recommended: a DMARC record
   `_dmarc.example.com TXT "v=DMARC1; p=none; rua=mailto:owner@example.com"`.
   The SES sandbox is fine for owner-only alerts; no production-access
   request is needed.
5. **First admin login** — `https://www.example.com/admin` → username,
   password, authenticator code. Archive the LAUNCH TEST RFQ.

## 10. Revoke the bootstrap access key

After step 9.3 (or immediately, if DNS will wait — a new short-lived key can
be issued later for the HTTPS apply):

- **OWNER**: IAM console → Users → `manufacturing-os-bootstrap` → Security
  credentials → **Deactivate**, then **Delete** the access key; then delete
  the user (or remove its `AdministratorAccess`).
- Or, from the session before it ends (the key deletes itself last):
  ```bash
  aws iam delete-access-key --user-name manufacturing-os-bootstrap --access-key-id "$AWS_ACCESS_KEY_ID"
  ```
- Check CloudTrail → Event history filtered by that access key id for
  anything unexpected.
- Clean up: `shred -u "$WORK"/* ; rm -rf "$WORK"`; unset `TF_VAR_*`.

From then on, deploys use only the GitHub OIDC role (main branch only,
least-privilege, no stored keys). Terraform changes need a new short-lived
bootstrap key (repeat steps 0–1, `terraform init` with the same
`-backend-config`, `plan`, `apply`), then revoke again.

---

## Rough monthly cost

**ROUGH ESTIMATE, not a quote** — based on public us-east-1 on-demand list
prices as generally known, low traffic, and may be out of date. Check the AWS
Pricing Calculator / Cost Explorer after the first week.

| Item | Rough US$/month |
|---|---|
| NAT Gateway (1, always on) + small data | ~33–40 |
| ALB (always on) + low LCU | ~17–22 |
| Fargate task, 0.5 vCPU / 1 GB, 24×7 | ~15–20 |
| RDS db.t4g.micro single-AZ + 20 GB gp3 + 7-day backups | ~15–20 |
| Public IPv4 addresses (ALB ×2, NAT ×1) | ~10–11 |
| CloudWatch Logs, ECR storage, S3 (RFQ files), Secrets Manager (4), SES alerts | ~3–8 |
| **Total** | **roughly 95–120** |

Biggest levers if cost matters: the NAT Gateway (VPC endpoints for
ECR/S3/Secrets Manager/Logs/SES can replace most NAT traffic but have their
own hourly cost), and the ALB.

---

## Day-2 operations

- **Deploy**: merge to `main`. Rollback: Actions → re-run the deploy of an
  older commit, or `aws ecs update-service --cluster manufacturing-os-cluster --service manufacturing-os-app-service --task-definition manufacturing-os-app:<previous revision>` (needs AWS access).
  A deploy whose tasks never turn healthy is rolled back automatically
  (deployment circuit breaker).
- **Logs**: CloudWatch Logs `/ecs/manufacturing-os-app` — stream prefix
  `app/` (the site; `[admin]`, `[notify]`, `[rfq]` log lines) and `migrate/`.
- **Alert email failed?** Search the logs for `owner alert FAILED`. The RFQ is
  still saved; it shows up on `/admin`.
- **Locked out of /admin** (5 wrong attempts from one IP, or 30 in total, within
  15 min): wait 15 minutes, or restart the task (re-run the latest deploy).
  Lost the authenticator: set `ADMIN_TOTP_SECRET` to a new value from
  `npm run admin:totp-secret` in the `manufacturing-os/admin` secret and
  re-run the deploy.
- **Database access for a human** (rare): there is deliberately no bastion.
  Use a one-off ECS task with the migrate task definition and a command
  override, or add a bastion temporarily.
- **Teardown**: `terraform destroy` (RDS takes a final snapshot
  `manufacturing-os-db-final-snapshot`), then empty/delete the state bucket.
