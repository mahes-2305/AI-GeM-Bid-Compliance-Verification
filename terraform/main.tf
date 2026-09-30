provider "aws" {
  region = var.aws_region
}

# 1. Elastic Container Registries (ECR)
resource "aws_ecr_repository" "frontend_repo" {
  name                 = "nexverify-frontend"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "backend_repo" {
  name                 = "nexverify-backend"
  image_tag_mutability = "MUTABLE"
}

# 2. Security Group for Web Server
resource "aws_security_group" "web_sg" {
  name        = "nexverify_web_sg"
  description = "Allow HTTP and SSH traffic"

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["223.239.58.193/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. IAM Role for EC2 to pull from ECR
resource "aws_iam_role" "ec2_ecr_role" {
  name = "nexverify_ec2_ecr_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "nexverify_ec2_profile"
  role = aws_iam_role.ec2_ecr_role.name
}

# 4. EC2 Instance (Ubuntu 22.04 LTS)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.web_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  # User data script to install Docker and Docker-Compose automatically on boot
  user_data = <<-EOF
  #!/bin/bash
  set -e

  apt-get update

  apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    awscli

  install -m 0755 -d /etc/apt/keyrings

  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update

  apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

  systemctl enable docker
  systemctl start docker

  usermod -aG docker ubuntu

  mkdir -p /opt/nexverify

  chown -R ubuntu:ubuntu /opt/nexverify
EOF

  tags = {
    Name = "NexVerify-Production-Server"
  }
}
