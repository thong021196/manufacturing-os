# RDS Postgres for RFQ submission/file metadata (file bytes live in S3,
# see s3.tf). Single instance, single-AZ, smallest Graviton burstable
# class -- MVP-sized, not built for scale or HA (see variables.tf comments
# on db_instance_class / db_multi_az for the tradeoffs this makes
# explicit). Lives entirely in the private subnets of the dedicated
# manufacturing-os VPC; aws_security_group.rds only accepts inbound 5432
# from the ECS task security group (security_groups.tf) -- there is no
# publicly_accessible = true anywhere in this file.

resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-db"

  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage_gb
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_master_username
  password = var.db_master_password
  port     = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  multi_az = var.db_multi_az

  backup_retention_period = var.db_backup_retention_days
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:30-mon:05:30"

  # MVP-appropriate: skip a final snapshot's naming ceremony is avoided by
  # always taking one (safer default), and deletion protection is off so
  # a deliberate `terraform destroy` during teardown/isolation testing
  # isn't blocked -- see DEPLOYMENT.md "Teardown". Flip
  # deletion_protection on once this is genuinely serving production RFQ
  # traffic the owner cares about not losing.
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.name_prefix}-db-final-snapshot"
  deletion_protection       = false

  # Performance Insights / enhanced monitoring intentionally omitted --
  # overbuilt for MVP traffic; CloudWatch's default RDS metrics are enough
  # to notice real problems at this scale.
  enabled_cloudwatch_logs_exports = ["postgresql"]

  apply_immediately = true

  tags = {
    Name = "${var.name_prefix}-db"
  }
}
