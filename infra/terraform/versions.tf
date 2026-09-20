terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure once the owner has decided where Terraform
  # state should live (an S3 bucket + DynamoDB lock table in the dedicated
  # manufacturing-os AWS account -- see DEPLOYMENT.md "Terraform state").
  # Left as local state by default so this pass never assumes a backend
  # bucket exists.
  #
  # backend "s3" {
  #   bucket         = "manufacturing-os-tfstate-<account-id>"
  #   key            = "manufacturing-os/production/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "manufacturing-os-tfstate-lock"
  #   encrypt        = true
  # }
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
