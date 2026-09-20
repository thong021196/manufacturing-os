# Secrets Manager holds every credential the running app needs at
# runtime. Nothing here is a literal secret value committed to the repo --
# db_master_password / db_app_password come in only via TF_VAR_* /
# -var at apply time (see variables.tf), never a committed .tfvars file.
# The ECS task definition (ecs.tf) references this secret's ARN and AWS
# injects the value as an env var at container start -- it is never
# printed in a GitHub Actions log or baked into the container image.

resource "aws_secretsmanager_secret" "db_app_credentials" {
  name        = "${var.name_prefix}/rfq-db-app-credentials"
  description = "manufacturing-os: RFQ database connection string for the least-privilege manufacturing_os_app role. Consumed only by the ECS task definition (ecs.tf)."

  tags = { Name = "${var.name_prefix}-rfq-db-app-credentials" }
}

resource "aws_secretsmanager_secret_version" "db_app_credentials" {
  secret_id = aws_secretsmanager_secret.db_app_credentials.id
  secret_string = jsonencode({
    database_url = "postgresql://manufacturing_os_app:${var.db_app_password}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.db_name}"
    username     = "manufacturing_os_app"
    password     = var.db_app_password
    host         = aws_db_instance.main.address
    port         = aws_db_instance.main.port
    dbname       = var.db_name
  })
}

# Master credentials, kept in Secrets Manager too (rather than only ever
# living in shell history) so the owner can retrieve them later to run the
# migration (infra/sql/0001_rfq_intake_rds.sql) or future schema changes.
# The running app never reads this secret -- only db_app_credentials above.
resource "aws_secretsmanager_secret" "db_master_credentials" {
  name        = "${var.name_prefix}/rfq-db-master-credentials"
  description = "manufacturing-os: RDS master (admin) credentials, for running migrations only. The app itself never uses this secret."

  tags = { Name = "${var.name_prefix}-rfq-db-master-credentials" }
}

resource "aws_secretsmanager_secret_version" "db_master_credentials" {
  secret_id = aws_secretsmanager_secret.db_master_credentials.id
  secret_string = jsonencode({
    database_url = "postgresql://${var.db_master_username}:${var.db_master_password}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.db_name}"
    username     = var.db_master_username
    password     = var.db_master_password
    host         = aws_db_instance.main.address
    port         = aws_db_instance.main.port
    dbname       = var.db_name
  })
}
