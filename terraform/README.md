# Mind Sprinter Frontend Deployment with Terraform

This Terraform configuration deploys the Mind Sprinter frontend React application to AWS using S3 and CloudFront.

## Architecture

- **S3 Bucket**: Hosts the static website files
- **CloudFront Distribution**: CDN for global content delivery with caching
- **Origin Access Control (OAC)**: Secure access from CloudFront to S3
- **Build Automation**: Automatically builds and uploads the Vite React app
- **Cache Invalidation**: Invalidates CloudFront cache on deployments

## Prerequisites

1. AWS CLI installed and configured with appropriate permissions
2. Terraform >= 1.0 installed
3. Node.js and npm installed (for building the frontend)

## Required AWS Permissions

Your AWS credentials need the following permissions:
- S3: Full access to create and manage buckets
- CloudFront: Full access to create and manage distributions
- IAM: Read access to get caller identity

## Deployment Steps

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Configure Variables

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific values:

```hcl
# Update with your actual backend API URL
api_base_url = "https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev"

# Optionally configure custom domain
use_custom_domain = true
domain_name = "your-domain.com"
ssl_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/your-cert-id"
```

### 3. Plan the Deployment

```bash
terraform plan
```

### 4. Deploy

```bash
terraform apply
```

### 5. Access Your Application

After deployment, Terraform will output the website URL:

```bash
# Get the CloudFront URL
terraform output website_url
```

## What the Terraform Does

1. **Creates S3 Bucket**: A private S3 bucket with versioning enabled
2. **Builds Frontend**: Runs `npm ci` and `npm run build` in the frontend directory
3. **Uploads Files**: Syncs the built files to S3 with appropriate cache headers
4. **Creates CloudFront**: Sets up a distribution with:
   - Origin Access Control for secure S3 access
   - Optimized cache behaviors for static assets vs. HTML files
   - Custom error pages for SPA routing (404/403 → index.html)
   - HTTPS redirect
5. **Invalidates Cache**: Creates CloudFront invalidation on updates

## Cache Strategy

- **Static Assets** (`/assets/*`): Cached for 1 year (immutable files with hashes)
- **HTML Files**: No cache, always fetch latest version
- **JSON Files**: No cache (manifests, etc.)

## Custom Domain Setup (Optional)

To use a custom domain:

1. Create an SSL certificate in AWS Certificate Manager (ACM) in `us-east-1` region
2. Set `use_custom_domain = true` in `terraform.tfvars`
3. Provide your `domain_name` and `ssl_certificate_arn`
4. After deployment, create a CNAME record pointing your domain to the CloudFront domain

## Updates and Redeployment

The configuration automatically detects changes in your frontend code:

```bash
# After making frontend changes
terraform apply
```

This will:
1. Rebuild the frontend if source files changed
2. Upload new files to S3
3. Invalidate CloudFront cache

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

## Troubleshooting

### Build Fails
- Ensure Node.js and npm are installed
- Check that `package.json` exists in the frontend directory
- Verify all dependencies can be installed

### Upload Fails
- Verify AWS CLI is configured with correct permissions
- Check that the S3 bucket was created successfully

### CloudFront Issues
- CloudFront distributions can take 15-20 minutes to deploy
- Cache invalidations can take 10-15 minutes to complete
- Check CloudFront console for distribution status

## Cost Optimization

- Uses `PriceClass_100` by default (US, Canada, Europe, Israel)
- Change `cloudfront_price_class` to `PriceClass_All` for global edge locations
- S3 Standard storage class for frequently accessed files
- CloudFront caching reduces origin requests

## Security Features

- S3 bucket is private, only accessible via CloudFront
- Origin Access Control (OAC) instead of deprecated OAI
- HTTPS enforcement via CloudFront
- Public access blocked on S3 bucket
