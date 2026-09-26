# ECS Fargate: the chosen AWS runtime for the Next.js server (see
# DEPLOYMENT.md "Why ECS Fargate" for the full comparison against AWS
# Amplify Hosting and Lambda/OpenNext). Summary of why: this app's RFQ
# route accepts multipart file uploads up to RFQ_MAX_FILE_MB (100 MB
# default) / RFQ_MAX_TOTAL_MB (300 MB default) directly in the request
# body (see app/api/rfq/route.ts). Both Amplify Hosting's SSR compute and
# Lambda-based adapters (OpenNext, etc.) run Next.js on Lambda under the
# hood, which caps synchronous request/response payloads far below that
# (single-digit MB). Fargate runs a normal, long-lived Node process behind
# an ALB with no such payload ceiling, so the existing upload flow works
# unchanged -- no need to rearchitect file uploads into a separate
# presigned-URL-from-the-browser flow just to fit the runtime.
#
# Deliberately NOT included at MVP scale (see variables.tf for the
# cost/HA variables this respects):
#  - No autoscaling (desired_count is fixed, no Application Auto Scaling
#    target/policy). One task is enough for MVP traffic; add a
#    target-tracking policy on CPU/memory once real load shows up.
#  - No Fargate Spot (adds interruption complexity for a single-task
#    service where an interruption briefly drops the only task).
#  - No WAF in front of the ALB (revisit if abuse/scraping becomes real).
#  - No service mesh / App Mesh / ECS Exec left permanently enabled.

resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled" # avoid the extra CloudWatch cost at MVP scale; flip to "enabled" if deeper per-task metrics are worth it later
  }

  tags = { Name = "${var.name_prefix}-cluster" }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.name_prefix}-app"
  retention_in_days = var.log_retention_days

  tags = { Name = "${var.name_prefix}-app-logs" }
}

locals {
  # Until CI has pushed a real image, task definitions point at a tag that
  # does not exist yet and the service runs 0 tasks (see desired_count).
  bootstrap_image = "${aws_ecr_repository.app.repository_url}:bootstrap"
  image           = var.container_image != "" ? var.container_image : local.bootstrap_image

  app_environment = concat(
    [
      { name = "PORT", value = tostring(var.container_port) },
      { name = "NODE_ENV", value = "production" },
      { name = "AWS_REGION", value = var.aws_region },
      { name = "RFQ_BACKEND", value = "aws" },
      { name = "AWS_S3_RFQ_BUCKET", value = aws_s3_bucket.rfq_files.bucket },
      # Runtime canonical URL (lib/seo.ts reads SITE_URL at runtime; the
      # NEXT_PUBLIC_ variant is frozen at image build time).
      { name = "SITE_URL", value = var.site_url },
      { name = "NEXT_PUBLIC_SITE_URL", value = var.site_url },
      { name = "RFQ_MAX_FILE_MB", value = tostring(var.rfq_max_file_mb) },
      { name = "RFQ_MAX_FILES", value = tostring(var.rfq_max_files) },
      { name = "RFQ_MAX_TOTAL_MB", value = tostring(var.rfq_max_total_mb) },
      { name = "ADMIN_TIMEZONE", value = var.admin_timezone },
      { name = "ADMIN_VISIT_DAYS", value = var.admin_visit_days },
      { name = "CONTENT_REPO", value = var.github_repository },
      # Replaced with the commit SHA by the deploy workflow on every rollout.
      { name = "APP_VERSION", value = "terraform-bootstrap" },
    ],
    local.ses_enabled ? [
      { name = "NOTIFY_EMAIL_TO", value = var.notify_email_to },
      { name = "SES_FROM_ADDRESS", value = var.ses_from_address },
      { name = "SES_REGION", value = var.aws_region },
    ] : [],
  )
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.name_prefix}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.task_cpu)
  memory                   = tostring(var.task_memory)
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = local.image
      essential = true
      portMappings = [
        { containerPort = var.container_port, protocol = "tcp" }
      ]
      environment = local.app_environment
      secrets = [
        # ECS resolves these via the EXECUTION role (see iam.tf) and injects
        # them as env vars at container start -- never logged, never in the
        # task definition itself, never in the built image.
        {
          name      = "DATABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.db_app_credentials.arn}:database_url::"
        },
        { name = "ADMIN_USERNAME", valueFrom = "${aws_secretsmanager_secret.admin.arn}:ADMIN_USERNAME::" },
        { name = "ADMIN_PASSWORD_HASH", valueFrom = "${aws_secretsmanager_secret.admin.arn}:ADMIN_PASSWORD_HASH::" },
        { name = "ADMIN_SESSION_SECRET", valueFrom = "${aws_secretsmanager_secret.admin.arn}:ADMIN_SESSION_SECRET::" },
        { name = "ADMIN_TOTP_SECRET", valueFrom = "${aws_secretsmanager_secret.admin.arn}:ADMIN_TOTP_SECRET::" },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app"
        }
      }
    }
  ])

  tags = { Name = "${var.name_prefix}-app-task" }

  depends_on = [aws_secretsmanager_secret_version.admin_placeholder]
}

# One-off database migration task (scripts/migrate.mjs), run by the deploy
# workflow before every rollout with the SAME image as the app. It is the
# only task that receives the RDS master credentials (via its own execution
# role, iam.tf); it needs no task role because it calls no AWS APIs.
resource "aws_ecs_task_definition" "migrate" {
  family                   = "${var.name_prefix}-migrate"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_migrate_execution.arn

  container_definitions = jsonencode([
    {
      name      = "migrate"
      image     = local.image
      essential = true
      command   = ["node", "scripts/migrate.mjs"]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "AWS_DB_SSL", value = "relaxed" },
      ]
      secrets = [
        { name = "MIGRATION_DATABASE_URL", valueFrom = "${aws_secretsmanager_secret.db_master_credentials.arn}:database_url::" },
        { name = "DB_APP_PASSWORD", valueFrom = "${aws_secretsmanager_secret.db_app_credentials.arn}:password::" },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "migrate"
        }
      }
    }
  ])

  tags = { Name = "${var.name_prefix}-migrate-task" }
}

resource "aws_ecs_service" "app" {
  name            = "${var.name_prefix}-app-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  # 0 until CI has pushed an image (bootstrap), then CI owns the count.
  desired_count = var.container_image == "" ? 0 : var.desired_count
  launch_type   = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = false # private subnet + NAT for outbound; never a public IP on the task itself
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = var.container_port
  }

  # A rollout whose new tasks never become healthy is stopped and rolled
  # back to the last working task definition automatically.
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # Give the app time to become healthy behind the ALB before the
  # deployment considers old tasks replaceable.
  health_check_grace_period_seconds = 60

  # The deploy workflow registers new task-definition revisions (real image,
  # APP_VERSION) and sets the desired count; Terraform must not roll those
  # back on the next apply.
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  depends_on = [aws_lb_listener.http]

  tags = { Name = "${var.name_prefix}-app-service" }
}
