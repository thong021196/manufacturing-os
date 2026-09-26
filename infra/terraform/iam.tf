# Two distinct roles, per ECS Fargate convention:
#  - execution role: used by the ECS agent itself to pull the image from
#    ECR and write to CloudWatch Logs -- the app code never assumes this
#    role.
#  - task role: assumed by the app code running inside the container
#    (this is what the AWS SDK v3 clients in lib/rfq/store/aws.ts pick up
#    automatically). Scoped to exactly the two things the app needs: R/W
#    the manufacturing-os-rfq-files-* bucket, and read the one RFQ DB
#    secret. No other project's roles, policies, or resources are
#    referenced anywhere in this file.

data "aws_iam_policy_document" "ecs_tasks_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution" {
  name               = "${var.name_prefix}-ecs-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
  tags               = { Name = "${var.name_prefix}-ecs-execution-role" }
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# The execution role also needs to read the DB secret, because ECS
# resolves task-definition `secrets` (ecs.tf) using the EXECUTION role,
# not the task role, before the container even starts.
data "aws_iam_policy_document" "ecs_execution_read_secrets" {
  statement {
    sid     = "ReadAppRuntimeSecrets"
    actions = ["secretsmanager:GetSecretValue"]
    # The app DB credential + the owner-admin secret. NOT the RDS master
    # secret -- only the migration task's execution role can read that.
    resources = [
      aws_secretsmanager_secret.db_app_credentials.arn,
      aws_secretsmanager_secret.admin.arn,
    ]
  }
}

resource "aws_iam_role_policy" "ecs_execution_read_secrets" {
  name   = "${var.name_prefix}-ecs-execution-read-secrets"
  role   = aws_iam_role.ecs_execution.id
  policy = data.aws_iam_policy_document.ecs_execution_read_secrets.json
}

resource "aws_iam_role" "ecs_task" {
  name               = "${var.name_prefix}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
  tags               = { Name = "${var.name_prefix}-ecs-task-role" }
}

data "aws_iam_policy_document" "ecs_task_app_permissions" {
  statement {
    sid = "RfqFilesBucketReadWrite"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
    ]
    resources = ["${aws_s3_bucket.rfq_files.arn}/*"]
  }

  statement {
    sid       = "RfqFilesBucketList"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.rfq_files.arn]
  }
}

resource "aws_iam_role_policy" "ecs_task_app_permissions" {
  name   = "${var.name_prefix}-ecs-task-app-permissions"
  role   = aws_iam_role.ecs_task.id
  policy = data.aws_iam_policy_document.ecs_task_app_permissions.json
}

# Execution role for the one-off migration task (ecs.tf
# aws_ecs_task_definition.migrate). Separate from the app's execution role so
# the long-running app task can never be given the RDS master credentials:
# only this role can read the master secret, and only the migrate task
# definition references it.
resource "aws_iam_role" "ecs_migrate_execution" {
  name               = "${var.name_prefix}-ecs-migrate-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
  tags               = { Name = "${var.name_prefix}-ecs-migrate-execution-role" }
}

resource "aws_iam_role_policy_attachment" "ecs_migrate_execution_managed" {
  role       = aws_iam_role.ecs_migrate_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ecs_migrate_read_secrets" {
  statement {
    sid     = "ReadDbSecretsForMigrations"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      aws_secretsmanager_secret.db_master_credentials.arn,
      aws_secretsmanager_secret.db_app_credentials.arn,
    ]
  }
}

resource "aws_iam_role_policy" "ecs_migrate_read_secrets" {
  name   = "${var.name_prefix}-ecs-migrate-read-secrets"
  role   = aws_iam_role.ecs_migrate_execution.id
  policy = data.aws_iam_policy_document.ecs_migrate_read_secrets.json
}
