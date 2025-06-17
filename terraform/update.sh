#!/bin/bash

# Mind Sprinter Frontend Update Script
# This script updates the frontend code and invalidates CloudFront cache

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

print_color $BLUE "🔄 Mind Sprinter Frontend Update"
print_color $BLUE "================================"

# Check if we're in the right directory
if [ ! -f "main.tf" ]; then
    print_color $RED "❌ Error: main.tf not found. Please run this script from the terraform directory."
    exit 1
fi

# Check if Terraform state exists
if [ ! -f "terraform.tfstate" ]; then
    print_color $RED "❌ Error: No Terraform state found. Please run initial deployment first."
    exit 1
fi

# Get current outputs
S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null)
CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null)
WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null)

if [ -z "$S3_BUCKET" ] || [ -z "$CLOUDFRONT_ID" ]; then
    print_color $RED "❌ Error: Could not get deployment information. Please run full deployment."
    exit 1
fi

print_color $GREEN "✅ Found existing deployment"
print_color $BLUE "📦 S3 Bucket: $S3_BUCKET"
print_color $BLUE "🌍 CloudFront ID: $CLOUDFRONT_ID"

# Build frontend
print_color $BLUE "🏗️  Building frontend..."
cd ../frontend

# Get API URL from terraform vars
API_BASE_URL=$(grep "api_base_url" ../terraform/terraform.tfvars | cut -d'"' -f2 2>/dev/null || echo "")
if [ -z "$API_BASE_URL" ]; then
    print_color $YELLOW "⚠️  Could not find api_base_url in terraform.tfvars. Using default."
    API_BASE_URL="https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev"
fi

npm ci --legacy-peer-deps
VITE_API_BASE_URL=$API_BASE_URL npm run build

# Upload to S3
print_color $BLUE "📤 Uploading to S3..."
cd ../terraform

# Upload static assets with long cache
aws s3 sync ../frontend/dist/ s3://$S3_BUCKET/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "*.json"

# Upload index.html with no cache
aws s3 cp ../frontend/dist/index.html s3://$S3_BUCKET/index.html \
  --cache-control "public, max-age=0, must-revalidate"

# Upload JSON files with no cache
if ls ../frontend/dist/*.json >/dev/null 2>&1; then
  aws s3 cp ../frontend/dist/ s3://$S3_BUCKET/ \
    --recursive \
    --exclude "*" \
    --include "*.json" \
    --cache-control "public, max-age=0, must-revalidate"
fi

# Invalidate CloudFront cache
print_color $BLUE "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

print_color $GREEN "✅ Update completed successfully!"
print_color $BLUE "📊 Update Information:"
echo "====================="
print_color $GREEN "🌐 Website URL: $WEBSITE_URL"
print_color $BLUE "🔄 Invalidation ID: $INVALIDATION_ID"

echo ""
print_color $YELLOW "⏰ Cache invalidation can take 10-15 minutes to complete."
print_color $GREEN "🎉 Your updated frontend will be available at: $WEBSITE_URL"

# Optional: Wait for invalidation to complete
read -p "Do you want to wait for cache invalidation to complete? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_color $BLUE "⏳ Waiting for invalidation to complete..."
    aws cloudfront wait invalidation-completed \
      --distribution-id $CLOUDFRONT_ID \
      --id $INVALIDATION_ID
    print_color $GREEN "✅ Cache invalidation completed!"
fi
