output "alb_dns_name" {
  description = "The ALB's own DNS name. Point an external DNS provider's CNAME here (or use it directly) if not using Route 53 alias (see dns.tf)."
  value       = aws_lb.main.dns_name
}

output "ecr_repository_url" {
  description = "Push built images here (see DEPLOYMENT.md deploy steps)."
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "rds_endpoint" {
  description = "RDS instance endpoint (host:port). Only reachable from inside the manufacturing-os VPC's private subnets -- there is no public route to it."
  value       = aws_db_instance.main.endpoint
}

output "rfq_files_bucket_name" {
  value = aws_s3_bucket.rfq_files.bucket
}

output "db_app_credentials_secret_arn" {
  description = "Secrets Manager ARN holding the app's DATABASE_URL. The running ECS task reads this automatically via its task definition; use it manually only to run infra/sql/0001_rfq_intake_rds.sql's `manufacturing_os_app` password re-check."
  value       = aws_secretsmanager_secret.db_app_credentials.arn
}

output "db_master_credentials_secret_arn" {
  description = "Secrets Manager ARN holding the RDS master credentials -- retrieve these once to run the initial migration (see DEPLOYMENT.md)."
  value       = aws_secretsmanager_secret.db_master_credentials.arn
}

output "certificate_status" {
  description = "Human-readable note on whether an HTTPS listener was created."
  value       = local.certificate_arn != "" ? "HTTPS listener active on ${local.certificate_arn}" : "No certificate configured yet -- ALB currently serves plain HTTP only. Set acm_certificate_arn or route53_zone_id+domain_name."
}
