#!/bin/bash

# Mind Sprinter Frontend Deployment Script
# This script deploys the frontend using Terraform

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

print_color $BLUE "🚀 Mind Sprinter Frontend Deployment"
print_color $BLUE "======================================"

# Check if we're in the right directory
if [ ! -f "main.tf" ]; then
    print_color $RED "❌ Error: main.tf not found. Please run this script from the terraform directory."
    exit 1
fi

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    print_color $YELLOW "⚠️  terraform.tfvars not found. Creating from example..."
    if [ -f "terraform.tfvars.example" ]; then
        cp terraform.tfvars.example terraform.tfvars
        print_color $YELLOW "📝 Please edit terraform.tfvars with your specific values before continuing."
        print_color $YELLOW "   Especially update the api_base_url variable."
        read -p "Press Enter to continue after editing terraform.tfvars..."
    else
        print_color $RED "❌ Error: terraform.tfvars.example not found."
        exit 1
    fi
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_color $RED "❌ Error: AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

print_color $GREEN "✅ AWS CLI configured"

# Check if Node.js is available
if ! command -v node > /dev/null 2>&1; then
    print_color $RED "❌ Error: Node.js not found. Please install Node.js to build the frontend."
    exit 1
fi

print_color $GREEN "✅ Node.js available"

# Check if frontend directory exists
if [ ! -d "../frontend" ]; then
    print_color $RED "❌ Error: Frontend directory not found. Expected ../frontend"
    exit 1
fi

print_color $GREEN "✅ Frontend directory found"

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    print_color $BLUE "🔧 Initializing Terraform..."
    terraform init
fi

# Show plan
print_color $BLUE "📋 Showing Terraform plan..."
terraform plan

# Ask for confirmation
print_color $YELLOW "⚠️  This will deploy/update your frontend to AWS."
read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_color $YELLOW "🚫 Deployment cancelled."
    exit 0
fi

# Apply Terraform
print_color $BLUE "🚀 Deploying frontend..."
terraform apply -auto-approve

# Get outputs
print_color $GREEN "✅ Deployment completed successfully!"
print_color $BLUE "📊 Deployment Information:"
echo "=========================="

WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "Not available")
CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "Not available")
S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "Not available")

print_color $GREEN "🌐 Website URL: $WEBSITE_URL"
print_color $BLUE "📦 S3 Bucket: $S3_BUCKET"
print_color $BLUE "🌍 CloudFront ID: $CLOUDFRONT_ID"

echo ""
print_color $YELLOW "⏰ Note: CloudFront deployments can take 15-20 minutes to fully propagate."
print_color $YELLOW "⏰ Cache invalidations can take 10-15 minutes to complete."
print_color $GREEN "🎉 Your frontend should be available at: $WEBSITE_URL"
