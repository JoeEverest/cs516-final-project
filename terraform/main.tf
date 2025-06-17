terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data source for AWS caller identity
data "aws_caller_identity" "current" {}

# Random ID for unique naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 bucket for hosting the static website
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "${var.project_name}-frontend-${random_id.bucket_suffix.hex}"
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "frontend_bucket_versioning" {
  bucket = aws_s3_bucket.frontend_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "frontend_bucket_pab" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket policy for CloudFront access
resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend_distribution.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_cloudfront_distribution.frontend_distribution]
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "frontend_oac" {
  name                              = "${var.project_name}-frontend-oac"
  description                       = "OAC for ${var.project_name} frontend S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend_distribution" {
  origin {
    domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_oac.id
    origin_id                = "S3-${aws_s3_bucket.frontend_bucket.bucket}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} Frontend Distribution"
  default_root_object = "index.html"

  # Cache behavior for the default path
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend_bucket.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Cache behavior for static assets (longer cache)
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend_bucket.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 31536000  # 1 year
    max_ttl                = 31536000  # 1 year
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  price_class = var.cloudfront_price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = var.tags

  viewer_certificate {
    cloudfront_default_certificate = var.use_custom_domain ? false : true
    
    dynamic "viewer_certificate" {
      for_each = var.use_custom_domain ? [1] : []
      content {
        acm_certificate_arn      = var.ssl_certificate_arn
        ssl_support_method       = "sni-only"
        minimum_protocol_version = "TLSv1.2_2021"
      }
    }
  }

  dynamic "aliases" {
    for_each = var.use_custom_domain ? [var.domain_name] : []
    content {
      aliases = [var.domain_name]
    }
  }
}

# Build the frontend application
resource "null_resource" "build_frontend" {
  triggers = {
    # Rebuild when any file in the frontend directory changes
    build_hash = md5(join("", [
      for f in fileset("${path.module}/../frontend", "**/*") :
      filemd5("${path.module}/../frontend/${f}")
      if !startswith(f, "node_modules/") && 
         !startswith(f, ".env") &&
         !startswith(f, "dist/") &&
         f != ".env.local" &&
         f != ".env.development" &&
         f != ".env.production"
    ]))
  }

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.module}/../frontend
      npm ci --legacy-peer-deps
      VITE_API_BASE_URL=${var.api_base_url} npm run build
    EOT
  }
}

# Upload built files to S3
resource "null_resource" "upload_to_s3" {
  depends_on = [
    null_resource.build_frontend,
    aws_s3_bucket.frontend_bucket
  ]

  triggers = {
    build_hash = null_resource.build_frontend.triggers.build_hash
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws s3 sync ${path.module}/../frontend/dist/ s3://${aws_s3_bucket.frontend_bucket.bucket}/ \
        --delete \
        --cache-control "public, max-age=31536000" \
        --exclude "index.html" \
        --exclude "*.json"
      
      # Upload index.html and manifest files with shorter cache
      aws s3 cp ${path.module}/../frontend/dist/index.html s3://${aws_s3_bucket.frontend_bucket.bucket}/index.html \
        --cache-control "public, max-age=0, must-revalidate"
      
      # Upload any JSON files (like manifest) with shorter cache
      if ls ${path.module}/../frontend/dist/*.json >/dev/null 2>&1; then
        aws s3 cp ${path.module}/../frontend/dist/ s3://${aws_s3_bucket.frontend_bucket.bucket}/ \
          --recursive \
          --exclude "*" \
          --include "*.json" \
          --cache-control "public, max-age=0, must-revalidate"
      fi
    EOT
  }
}

# CloudFront cache invalidation
resource "null_resource" "cloudfront_invalidation" {
  depends_on = [
    null_resource.upload_to_s3,
    aws_cloudfront_distribution.frontend_distribution
  ]

  triggers = {
    build_hash = null_resource.build_frontend.triggers.build_hash
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws cloudfront create-invalidation \
        --distribution-id ${aws_cloudfront_distribution.frontend_distribution.id} \
        --paths "/*"
    EOT
  }
}
