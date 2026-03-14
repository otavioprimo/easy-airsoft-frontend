variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "easy-airsoft-frontend"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "vite_api_url" {
  description = "Backend API URL injected at build time (VITE_API_URL)"
  type        = string
  sensitive   = true
}
