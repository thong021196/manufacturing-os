# Application Load Balancer: the only public entry point into the app.
# HTTP (80) exists only to redirect to HTTPS (443) -- no plaintext
# listener ever forwards to the app. CloudFront in front of this was
# deliberately left out at MVP scale (see DEPLOYMENT.md "What was left
# out"); ALB + ACM + Route 53 alone gets HTTPS + a custom domain, which is
# the owner's actual requirement, without an extra caching layer this
# traffic level doesn't need yet.

resource "aws_lb" "main" {
  name               = "${var.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  # MVP cost/simplicity: deletion protection off (mirrors rds.tf's
  # reasoning -- don't block a deliberate teardown), access logs to S3
  # omitted (CloudWatch target-group metrics are enough to notice
  # problems at this scale; add access logging if/when real traffic
  # volume or a compliance need justifies the extra S3 bucket + cost).
  enable_deletion_protection = false

  tags = { Name = "${var.name_prefix}-alb" }
}

resource "aws_lb_target_group" "app" {
  name        = "${var.name_prefix}-app-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # required for awsvpc-networked Fargate tasks

  health_check {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  tags = { Name = "${var.name_prefix}-app-tg" }
}

# Plain HTTP listener. Once a certificate exists (local.certificate_arn
# set), this is redirect-only and never forwards to the app. Until then
# (no domain/cert decided yet), it forwards directly to the app over
# plain HTTP so the ALB's own DNS name is usable for initial smoke-testing
# right after `terraform apply` -- see DEPLOYMENT.md. Flip to HTTPS-only
# the moment a real domain/cert is in place.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = local.certificate_arn != "" ? "redirect" : "forward"

    dynamic "redirect" {
      for_each = local.certificate_arn != "" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }

    target_group_arn = local.certificate_arn != "" ? null : aws_lb_target_group.app.arn
  }
}

# HTTPS listener only gets created once a certificate exists (either the
# ACM cert this config requests via DNS validation when route53_zone_id is
# set, or one the owner uploads/issues out of band and passes in via
# var.acm_certificate_arn). Until then, `terraform apply` still succeeds
# and the app is reachable over plain HTTP on the ALB's own DNS name for
# initial smoke-testing -- see DEPLOYMENT.md.
resource "aws_lb_listener" "https" {
  count             = local.certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = local.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
