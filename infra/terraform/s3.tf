# Private S3 bucket for customer CAD/drawing/BOM files uploaded through
# the RFQ form (lib/rfq/store/aws.ts). AGENTS.md rule 4: "CAD and customer
# files are private and must never be publicly indexed." Enforced here at
# the bucket level, independent of any application-code bug:
#   - All four Block Public Access settings ON (belt-and-braces: even if
#     someone tried to attach a public bucket policy or object ACL later,
#     these settings would still block it from taking effect).
#   - No aws_s3_bucket_policy resource granting any public/anonymous
#     principal access -- there is no bucket policy at all beyond what
#     Terraform/IAM implicitly requires.
#   - Object Ownership set to bucket-owner-enforced, which disables ACLs
#     entirely (the app's PutObjectCommand calls in lib/rfq/store/aws.ts
#     don't set one either -- see that file's comments).
#   - Default server-side encryption (SSE-S3/AES256) on every object.
#   - Bucket name includes an account-id-derived suffix so it can never
#     collide with a bucket name some other AWS account (yours or anyone
#     else's) already registered -- S3 bucket names are globally unique.

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "rfq_files" {
  bucket = "${var.name_prefix}-rfq-files-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name    = "${var.name_prefix}-rfq-files"
    Purpose = "customer-cad-drawing-bom-uploads-private"
  }
}

resource "aws_s3_bucket_public_access_block" "rfq_files" {
  bucket = aws_s3_bucket.rfq_files.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "rfq_files" {
  bucket = aws_s3_bucket.rfq_files.id
  rule {
    object_ownership = "BucketOwnerEnforced" # disables ACLs entirely
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "rfq_files" {
  bucket = aws_s3_bucket.rfq_files.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Versioning deliberately left OFF for MVP: it protects against accidental
# overwrite/delete, which is a real but non-urgent risk given RFQ file
# keys are unique per (reference_id, file_id) and never overwritten by the
# app. Revisit if the customer-file-loss risk profile changes.
resource "aws_s3_bucket_versioning" "rfq_files" {
  bucket = aws_s3_bucket.rfq_files.id
  versioning_configuration {
    status = "Disabled"
  }
}

# Lifecycle: abort abandoned multipart uploads after 7 days so a failed
# large-file upload doesn't silently accumulate storage cost forever.
resource "aws_s3_bucket_lifecycle_configuration" "rfq_files" {
  bucket = aws_s3_bucket.rfq_files.id
  rule {
    id     = "abort-incomplete-multipart-uploads"
    status = "Enabled"
    filter {} # applies to every object in the bucket
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
