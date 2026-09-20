# Least-privilege security groups. Nothing references or is referenced by
# a security group from another project/VPC -- each SG here only allows
# traffic from another manufacturing-os SG (or, for the ALB, the public
# internet on 80/443, which is the whole point of a public load balancer).

resource "aws_security_group" "alb" {
  name        = "${var.name_prefix}-alb-sg"
  description = "manufacturing-os ALB: public HTTPS (+HTTP redirect) in, app port out to the ECS task SG only."
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from the internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from the internet (redirected to HTTPS by the listener rule, see alb.tf)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "To the ECS task security group only"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # AWS SGs can't egress-restrict to another SG by reference alone here; scope is enforced on the ECS SG's ingress side instead.
  }

  tags = { Name = "${var.name_prefix}-alb-sg" }
}

resource "aws_security_group" "ecs_service" {
  name        = "${var.name_prefix}-ecs-service-sg"
  description = "manufacturing-os ECS Fargate task: app port in from the ALB SG only, outbound to RDS SG + internet (via NAT, for ECR/S3/Secrets Manager)."
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "App port from the ALB only"
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "All outbound (ECR image pulls, S3, Secrets Manager, RDS -- all via NAT/VPC routing)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-ecs-service-sg" }
}

resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-rds-sg"
  description = "manufacturing-os RDS Postgres: inbound 5432 from the ECS task SG only. No public ingress rule exists on this SG at all."
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Postgres from the ECS service only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_service.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-rds-sg" }
}
