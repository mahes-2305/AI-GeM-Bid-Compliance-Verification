variable "aws_region" {
  description = "The AWS region to deploy into"
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.small"
}

variable "key_name" {
  description = "Name of the SSH key pair in AWS"
  default     = "nexverify-key"
}
