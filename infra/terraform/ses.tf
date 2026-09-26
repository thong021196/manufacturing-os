# Same-day new-RFQ email alerts to the owner (lib/notify/new-rfq.ts) via
# Amazon SES v2. Entirely optional: with ses_domain empty nothing here is
# created and the app logs "email alerts off" instead of sending.
#
# Owner-only follow-ups (docs/ops/LAUNCH-RUNBOOK.md):
#  - add the three DKIM CNAMEs from the `ses_dkim_records` output at the DNS
#    provider (automatic when route53_zone_id is set);
#  - click the one-time verification link SES emails to notify_email_to
#    (needed while the account is in the SES sandbox, which is fine for
#    alerts that only ever go to the owner).

locals {
  ses_enabled    = var.ses_domain != "" && var.ses_from_address != "" && var.notify_email_to != ""
  ses_dkim_names = local.ses_enabled ? aws_sesv2_email_identity.domain[0].dkim_signing_attributes[0].tokens : []
}

resource "aws_sesv2_email_identity" "domain" {
  count          = local.ses_enabled ? 1 : 0
  email_identity = var.ses_domain
  tags           = { Name = "${var.name_prefix}-ses-domain" }
}

# Recipient verification (SES sandbox requirement).
resource "aws_sesv2_email_identity" "notify_to" {
  count          = local.ses_enabled ? 1 : 0
  email_identity = var.notify_email_to
  tags           = { Name = "${var.name_prefix}-ses-owner-inbox" }
}

resource "aws_route53_record" "ses_dkim" {
  count   = local.ses_enabled && var.route53_zone_id != "" ? 3 : 0
  zone_id = var.route53_zone_id
  name    = "${local.ses_dkim_names[count.index]}._domainkey.${var.ses_domain}"
  type    = "CNAME"
  ttl     = 600
  records = ["${local.ses_dkim_names[count.index]}.dkim.amazonses.com"]
}

data "aws_iam_policy_document" "ecs_task_send_alerts" {
  count = local.ses_enabled ? 1 : 0
  statement {
    sid       = "SendOwnerAlertsOnly"
    actions   = ["ses:SendEmail"]
    resources = [aws_sesv2_email_identity.domain[0].arn, aws_sesv2_email_identity.notify_to[0].arn]
  }
}

resource "aws_iam_role_policy" "ecs_task_send_alerts" {
  count  = local.ses_enabled ? 1 : 0
  name   = "${var.name_prefix}-ecs-task-send-alerts"
  role   = aws_iam_role.ecs_task.id
  policy = data.aws_iam_policy_document.ecs_task_send_alerts[0].json
}
