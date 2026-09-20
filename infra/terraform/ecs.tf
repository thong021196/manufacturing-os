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
      image     = var.container_image
      essential = true
      portMappings = [
        { containerPort = var.container_port, protocol = "tcp" }
      ]
      environment = [
        { name = "PORT", value = tostring(var.container_port) },
        { name = "NODE_ENV", value = "production" },
        { name = "AWS_REGION", value = var.aws_region },
        { name = "RFQ_BACKEND", value = "aws" },
        { name = "AWS_S3_RFQ_BUCKET", value = aws_s3_bucket.rfq_files.bucket },
        { name = "NEXT_PUBLIC_SITE_URL", value = var.site_url },
        { name = "RFQ_MAX_FILE_MB", value = tostring(var.rfq_max_file_mb) },
        { name = "RFQ_MAX_FILES", value = tostring(var.rfq_max_files) },
        { name = "RFQ_MAX_TOTAL_MB", value = tostring(var.rfq_max_total_mb) },
      ]
      secrets = [
        # ECS resolves this via the EXECUTION role (see iam.tf) and injects
        # it as a plain env var at container start -- never logged, never
        # in the task definition itself, never in the built image.
        {
          name      = "DATABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.db_app_credentials.arn}:database_url::"
        }
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
}

resource "aws_ecs_service" "app" {
  name            = "${var.name_prefix}-app-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

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

  # Give the app time to become healthy behind the ALB before the
  # deployment considers old tasks replaceable.
  health_check_grace_period_seconds = 60

  depends_on = [aws_lb_listener.http]

  tags = { Name = "${var.name_prefix}-app-service" }
}
