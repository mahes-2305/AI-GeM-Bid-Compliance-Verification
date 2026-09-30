output "frontend_ecr_url" {
  value = aws_ecr_repository.frontend_repo.repository_url
}

output "backend_ecr_url" {
  value = aws_ecr_repository.backend_repo.repository_url
}

output "ec2_public_ip" {
  value       = aws_instance.app_server.public_ip
  description = "The public IP address of the web server"
}

output "ssh_command" {
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.app_server.public_ip}"
  description = "Command to SSH into the production server"
}
