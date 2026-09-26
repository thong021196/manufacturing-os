# DNS / TLS, fully optional -- HTTPS/custom-domain-ready using the
# AWS-native certificate path, without forcing the domain into Route 53.
#
# Supported states:
#  1. Nothing set: no certificate. The ALB serves plain HTTP on its own
#     *.elb.amazonaws.com name -- fine for the first smoke test. The admin
#     cannot be used yet (its session cookie is Secure-only by design).
#  2. domain_name set, DNS OUTSIDE Route 53 (the expected case): Terraform
#     requests an ACM certificate and outputs `acm_validation_records`. The
#     owner adds those CNAMEs at their DNS provider plus a CNAME for the site
#     hostname -> `alb_dns_name`; then `terraform apply -var
#     external_dns_validated=true` waits for ISSUED and turns on HTTPS (HTTP
#     then redirects). docs/ops/LAUNCH-RUNBOOK.md "Owner-only DNS steps".
#  3. domain_name + route53_zone_id set (zone in this account): validation
#     records and the alias A record are created automatically.
#  4. acm_certificate_arn set: use an existing, already-issued certificate.

locals {
  request_cert  = var.acm_certificate_arn == "" && var.domain_name != ""
  use_route53   = var.route53_zone_id != "" && var.domain_name != ""
  validate_cert = local.request_cert && (local.use_route53 || var.external_dns_validated)
}

resource "aws_acm_certificate" "app" {
  count                     = local.request_cert ? 1 : 0
  domain_name               = var.domain_name
  subject_alternative_names = var.domain_aliases
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = { Name = "${var.name_prefix}-cert" }
}

resource "aws_route53_record" "cert_validation" {
  for_each = local.request_cert && local.use_route53 ? {
    for dvo in aws_acm_certificate.app[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  } : {}

  zone_id         = var.route53_zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

# Waits until ACM reports the certificate ISSUED. Only created once
# validation can actually succeed (Route 53 records above, or the owner has
# confirmed the external CNAMEs via external_dns_validated = true), so a
# plain `terraform apply` never blocks on DNS the owner hasn't added yet.
resource "aws_acm_certificate_validation" "app" {
  count                   = local.validate_cert ? 1 : 0
  certificate_arn         = aws_acm_certificate.app[0].arn
  validation_record_fqdns = local.use_route53 ? [for r in aws_route53_record.cert_validation : r.fqdn] : null

  timeouts {
    create = "30m"
  }
}

resource "aws_route53_record" "app_alias" {
  count   = local.use_route53 ? 1 : 0
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

locals {
  certificate_arn = var.acm_certificate_arn != "" ? var.acm_certificate_arn : (
    length(aws_acm_certificate_validation.app) > 0 ? aws_acm_certificate_validation.app[0].certificate_arn : ""
  )
}
