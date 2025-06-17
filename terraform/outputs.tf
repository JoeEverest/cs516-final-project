output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the frontend"
  value       = aws_s3_bucket.frontend_bucket.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket hosting the frontend"
  value       = aws_s3_bucket.frontend_bucket.arn
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend_distribution.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend_distribution.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend_distribution.domain_name
}

output "website_url" {
  description = "URL of the deployed website"
  value       = var.use_custom_domain ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.frontend_distribution.domain_name}"
}

output "origin_access_control_id" {
  description = "ID of the CloudFront Origin Access Control"
  value       = aws_cloudfront_origin_access_control.frontend_oac.id
}
