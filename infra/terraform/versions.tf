terraform {
  # 1.10+ for S3-native state locking (use_lockfile) -- no DynamoDB table.
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state in a dedicated, versioned, encrypted S3 bucket in the same
  # account (partial configuration: the bucket name is passed at init time,
  # because it contains the account id). docs/ops/LAUNCH-RUNBOOK.md step 2
  # creates the bucket and runs:
  #
  #   terraform init \
  #     -backend-config="bucket=manufacturing-os-tfstate-<account-id>" \
  #     -backend-config="region=<region>"
  #
  # State must NOT stay local: it holds the RDS passwords and would be lost
  # with the ephemeral agent session that runs the first apply. For offline
  # validation use `terraform init -backend=false`.
  backend "s3" {
    key          = "manufacturing-os/production/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region

  # Hard isolation guardrail: every resource this configuration creates is
  # tagged with these defaults (merged with each resource's own tags), so
  # nothing it creates can be mistaken for another project's resource in
  # cost/inventory tooling even if it ends up in a shared account.
  default_tags {
    tags = {
      Project     = "manufacturing-os"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
