variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "mind-sprinter"
}

variable "api_base_url" {
  description = "Base URL for the API (backend)"
  type        = string
  default     = "https://n2f7znze3m.execute-api.us-east-1.amazonaws.com/dev"
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"  # US, Canada, Europe, & Israel
  
  validation {
    condition = contains([
      "PriceClass_All",
      "PriceClass_200", 
      "PriceClass_100"
    ], var.cloudfront_price_class)
    error_message = "CloudFront price class must be one of: PriceClass_All, PriceClass_200, PriceClass_100."
  }
}

variable "use_custom_domain" {
  description = "Whether to use a custom domain name"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Custom domain name for the frontend (if use_custom_domain is true)"
  type        = string
  default     = ""
}

variable "ssl_certificate_arn" {
  description = "ARN of the SSL certificate in ACM (if use_custom_domain is true)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "mind-sprinter"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
