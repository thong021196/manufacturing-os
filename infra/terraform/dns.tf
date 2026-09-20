# DNS / TLS, fully optional -- HTTPS/custom-domain-ready using AWS-native
# networking/certificate path, but nothing here forces the owner into
# Route 53 if the domain is registered/managed elsewhere.
#
# Three states this config supports:
#  1. var.acm_certificate_arn set (domain's DNS lives outside Route 53):
#     use that certificate on the ALB listener; the owner points their own
#     DNS provider's CNAME/ALIAS at aws_lb.main.dns_name themselves (see
#     DEPLOYMENT.md).
#  2. var.route53_zone_id + var.domain_name set (domain's DNS already
#     lives in Route 53, in this account): this config requests an ACM
#     certificate, DNS-validates it automatically via Route 53 records it
#     creates, and creates the alias A record pointing at the ALB.
#  3. Neither set: no cert, no Route 53 records -- ALB serves plain HTTP
#     on its own *.elb.amazonaws.com DNS name (fine for initial
#     smoke-testing, not for real production traffic).

resource "aws_acm_certificate" "app" {
  count             = var.acm_certificate_arn == "" && var.route53_zone_id != "" && var.domain_name != "" ? 1 : 0
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = { Name = "${var.name_prefix}-cert" }
}

resource "aws_route53_record" "cert_validation" {
  for_each = var.acm_certificate_arn == "" && var.route53_zone_id != "" && var.domain_name != "" ? {
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

resource "aws_acm_certificate_validation" "app" {
  count                   = var.acm_certificate_arn == "" && var.route53_zone_id != "" && var.domain_name != "" ? 1 : 0
  certificate_arn         = aws_acm_certificate.app[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

resource "aws_route53_record" "app_alias" {
  count   = var.route53_zone_id != "" && var.domain_name != "" ? 1 : 0
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
