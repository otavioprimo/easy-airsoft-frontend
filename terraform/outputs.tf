output "cloudfront_url" {
  description = "Public URL of the CloudFront distribution (use this to access the frontend)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "s3_bucket_name" {
  description = "S3 bucket name that holds the static files"
  value       = aws_s3_bucket.frontend.id
}
