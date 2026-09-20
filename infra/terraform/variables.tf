# See terraform.tfvars.example for a filled-in-shape starting point.
# No default here holds a real secret, account id, or domain — every
# value that would identify or touch a real account is left unset
# (required) or set to an obvious placeholder.

variable "aws_region" {
  description = "AWS region for every manufacturing-os resource. Pick one region for the whole MVP stack -- no multi-region setup at this scale."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name used in tags and some resource names (e.g. \"production\", \"staging\"). Keep this stack to a single environment for MVP; do not multiply it into many envs yet."
  type        = string
  default     = "production"
}

variable "name_prefix" {
  description = "Naming prefix applied to every resource this configuration creates, per the owner's explicit isolation requirement. Do not change this to something that could collide with another project's naming."
  type        = string
  default     = "manufacturing-os"

  validation {
    condition     = can(regex("^manufacturing-os", var.name_prefix))
    error_message = "name_prefix must start with \"manufacturing-os\" to satisfy the project's hard-isolation naming requirement."
  }
}

# --- Networking -------------------------------------------------------

variable "vpc_cidr" {
  description = "CIDR block for the dedicated manufacturing-os VPC. Must not overlap any other VPC this AWS account/network already has if VPC peering or Transit Gateway attachment is ever added later (not part of this MVP pass)."
  type        = string
  default     = "10.42.0.0/16"
}

variable "az_count" {
  description = "Number of Availability Zones to spread public/private subnets across. 2 is the MVP-appropriate minimum for an ALB (which requires >= 2 AZs) without paying for a third AZ's NAT/subnet overhead."
  type        = number
  default     = 2
}

variable "single_nat_gateway" {
  description = "MVP cost tradeoff: true creates exactly one NAT Gateway (in the first AZ) instead of one per AZ. Saves ~2/3 of NAT Gateway cost. Tradeoff: if that AZ has an outage, private-subnet resources in other AZs temporarily lose outbound internet access (ECR/package pulls) until it recovers -- acceptable at MVP scale with a single Fargate task and no multi-AZ HA requirement. Set to false for a NAT Gateway per AZ once traffic/uptime needs justify the extra cost."
  type        = bool
  default     = true
}

# --- Database -----------------------------------------------------------

variable "db_instance_class" {
  description = "RDS instance class. db.t4g.micro is the smallest Graviton burstable class RDS Postgres supports -- right-sized for MVP traffic, not a production-at-scale class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage_gb" {
  description = "RDS allocated storage in GB (gp3). 20 GB is the RDS minimum and plenty for MVP-scale RFQ metadata (file bytes live in S3, not the database)."
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name."
  type        = string
  default     = "manufacturing_os"
}

variable "db_master_username" {
  description = "RDS master (admin) username. Used only to run migrations / create the least-privilege manufacturing_os_app role (see infra/sql/0001_rfq_intake_rds.sql) -- the running app connects as manufacturing_os_app, not this user."
  type        = string
  default     = "manufacturing_os_admin"
}

variable "db_master_password" {
  description = "RDS master password. NEVER set this in a committed .tfvars file -- pass it via TF_VAR_db_master_password or -var on the CLI at apply time, generated fresh (e.g. `openssl rand -base64 24`) and stored only in the owner's own secret manager / password manager. Terraform still writes it into state, which is why an S3 backend with encryption (see versions.tf) matters once this goes beyond local state."
  type        = string
  sensitive   = true
}

variable "db_app_password" {
  description = "Password for the least-privilege manufacturing_os_app database role that the running app actually connects as (created by infra/sql/0001_rfq_intake_rds.sql, not by Terraform). Same handling as db_master_password: never commit it, pass via TF_VAR_db_app_password. Terraform stores it in Secrets Manager (infra/terraform/secrets.tf) so the running ECS task can read it without it ever being an env var in a workflow log."
  type        = string
  sensitive   = true
}

variable "db_multi_az" {
  description = "Whether RDS is Multi-AZ. false (single-AZ) is the MVP-appropriate default -- Multi-AZ roughly doubles RDS cost for HA this MVP doesn't need yet (a single-task app already has a single point of failure at the compute layer). Flip to true once uptime requirements justify it."
  type        = bool
  default     = false
}

variable "db_backup_retention_days" {
  description = "RDS automated backup retention in days. 7 is a reasonable, cheap MVP default (point-in-time recovery within the last week) without the cost of longer retention."
  type        = number
  default     = 7
}

# --- Compute (ECS Fargate) ----------------------------------------------

variable "container_port" {
  description = "Port the Next.js server listens on inside the container."
  type        = number
  default     = 3000
}

variable "container_image" {
  description = "Full ECR image URI (with tag/digest) to deploy, e.g. \"<account-id>.dkr.ecr.<region>.amazonaws.com/manufacturing-os-app:latest\". Left as a placeholder default so `terraform plan` never assumes an image exists yet -- the CI/CD deploy step (see .github/workflows/deploy-production.yml) overrides this with the real, just-built image URI on every deploy via -var."
  type        = string
  default     = "PLACEHOLDER_SET_VIA_CI_OR_-var_container_image"
}

variable "task_cpu" {
  description = "Fargate task vCPU units (256 = 0.25 vCPU). 512 (0.5 vCPU) is a reasonable small size for a Next.js SSR app at MVP traffic; Fargate requires cpu/memory pairs from its fixed table."
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Fargate task memory in MB. 1024 MB pairs with 512 CPU units in Fargate's supported combinations table and gives Next.js SSR reasonable headroom."
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Number of running Fargate tasks. 1 is the MVP-appropriate default -- no autoscaling group at this stage (see ecs.tf comments for what was deliberately left out)."
  type        = number
  default     = 1
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention for the app's log group. 30 days is enough to debug recent issues without paying to keep logs indefinitely at MVP scale."
  type        = number
  default     = 30
}

# --- Site / app configuration -------------------------------------------

variable "site_url" {
  description = "The production https:// URL the app should treat as canonical (NEXT_PUBLIC_SITE_URL). Placeholder default -- set to the real domain once DNS is decided (see DEPLOYMENT.md)."
  type        = string
  default     = "https://www.manufacturingos.example"
}

variable "rfq_max_file_mb" {
  type    = number
  default = 100
}

variable "rfq_max_files" {
  type    = number
  default = 10
}

variable "rfq_max_total_mb" {
  type    = number
  default = 300
}

# --- DNS / TLS (optional -- only used if a Route 53 zone is provided) ---

variable "route53_zone_id" {
  description = "Existing Route 53 hosted zone ID for the production domain, if DNS for that domain is managed in this AWS account/Route 53. Leave empty (\"\") to skip creating any Route 53 records / requesting an ACM cert via DNS validation in this account -- the app still gets deployed and reachable over plain HTTP on the ALB's own DNS name; point an externally-managed DNS provider at it instead (see DEPLOYMENT.md \"DNS is managed outside Route 53\")."
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "The apex/subdomain to create a Route 53 alias + ACM certificate for (e.g. \"www.manufacturingos.example\"). Only used when route53_zone_id is set."
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ARN of an existing, already-validated ACM certificate to use for the HTTPS listener, for the case where DNS is managed OUTSIDE Route 53 (see DEPLOYMENT.md \"DNS is managed outside Route 53\") -- e.g. a cert issued via DNS validation at an external registrar, or imported. Leave empty to let this config request+validate its own certificate via Route 53 instead (requires route53_zone_id). If both are empty, the ALB serves plain HTTP only until one is provided."
  type        = string
  default     = ""
}
