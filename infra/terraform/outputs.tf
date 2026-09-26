# Everything the owner or the next agent session needs after `terraform
# apply` (docs/ops/LAUNCH-RUNBOOK.md). Nothing here is secret: passwords and
# admin values live only in Secrets Manager.

output "alb_dns_name" {
  description = "The ALB's DNS name. First smoke test: http://<this>/api/health. Owner points the site hostname here (CNAME at an external DNS provider; Route 53 alias is automatic when route53_zone_id is set)."
  value       = aws_lb.main.dns_name
}

output "app_http_url" {
  description = "Plain-HTTP URL on the ALB name (redirects to HTTPS once a certificate is active)."
  value       = "http://${aws_lb.main.dns_name}"
}

output "github_deploy_role_arn" {
  description = "Set as the AWS_DEPLOY_ROLE_ARN repository variable (Settings -> Secrets and variables -> Actions -> Variables). Only main-branch workflows of github_repository can assume it."
  value       = aws_iam_role.github_deploy.arn
}

output "github_actions_variables" {
  description = "Repository variables for .github/workflows/deploy-production-aws.yml (names -> values)."
  value = {
    AWS_DEPLOY_ROLE_ARN   = aws_iam_role.github_deploy.arn
    AWS_REGION            = var.aws_region
    AWS_ECS_CLUSTER       = aws_ecs_cluster.main.name
    AWS_ECS_SERVICE       = aws_ecs_service.app.name
    AWS_ECR_REPOSITORY    = aws_ecr_repository.app.name
    AWS_ECS_DESIRED_COUNT = tostring(var.desired_count)
    PRODUCTION_URL        = local.certificate_arn != "" ? var.site_url : ""
  }
}

output "acm_validation_records" {
  description = "DNS records the OWNER must add at their DNS provider to validate the ACM certificate (only when domain_name is set and DNS is not in Route 53). After adding them, re-apply with external_dns_validated = true."
  value = local.request_cert ? [
    for dvo in aws_acm_certificate.app[0].domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ] : []
}

output "site_dns_records" {
  description = "Record(s) the OWNER adds so the site hostname(s) reach the ALB (skip if route53_zone_id is set -- the alias is automatic for domain_name). Apex domains need an ALIAS/ANAME/flattened CNAME at providers that support it."
  value = var.domain_name == "" ? [] : [
    for host in concat([var.domain_name], var.domain_aliases) : {
      name  = host
      type  = "CNAME"
      value = aws_lb.main.dns_name
    }
  ]
}

output "ses_dkim_records" {
  description = "Three CNAMEs the OWNER adds at the DNS provider for the SES sending domain (Easy DKIM). Created automatically when route53_zone_id is set."
  value = [
    for token in local.ses_dkim_names : {
      name  = "${token}._domainkey.${var.ses_domain}"
      type  = "CNAME"
      value = "${token}.dkim.amazonses.com"
    }
  ]
}

output "ecr_repository_url" {
  description = "Images are pushed here by the deploy workflow."
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "migrate_task_family" {
  description = "One-off migration task definition family (run by the deploy workflow)."
  value       = aws_ecs_task_definition.migrate.family
}

output "log_group_name" {
  description = "CloudWatch Logs group for the app (stream prefix app/) and migrations (stream prefix migrate/)."
  value       = aws_cloudwatch_log_group.app.name
}

output "rds_endpoint" {
  description = "RDS instance endpoint (host:port). Only reachable from inside the manufacturing-os VPC's private subnets -- there is no public route to it."
  value       = aws_db_instance.main.endpoint
}

output "rfq_files_bucket_name" {
  value = aws_s3_bucket.rfq_files.bucket
}

output "admin_secret_arn" {
  description = "Secrets Manager secret holding the owner-admin values (placeholders until set -- LAUNCH-RUNBOOK.md 'Admin credentials')."
  value       = aws_secretsmanager_secret.admin.arn
}

output "db_app_credentials_secret_arn" {
  description = "Secrets Manager ARN holding the app's DATABASE_URL (least-privilege manufacturing_os_app role). Read only by the app task's execution role."
  value       = aws_secretsmanager_secret.db_app_credentials.arn
}

output "db_master_credentials_secret_arn" {
  description = "Secrets Manager ARN holding the RDS master credentials. Read only by the migration task's execution role."
  value       = aws_secretsmanager_secret.db_master_credentials.arn
}

output "certificate_status" {
  description = "Whether an HTTPS listener exists yet."
  value = local.certificate_arn != "" ? "HTTPS listener active (${local.certificate_arn})" : (
    local.request_cert ? "Certificate requested for ${var.domain_name}: add acm_validation_records at your DNS provider, then re-apply with external_dns_validated = true." :
    "No certificate configured -- ALB serves plain HTTP only. Set domain_name (and optionally route53_zone_id) or acm_certificate_arn."
  )
}
