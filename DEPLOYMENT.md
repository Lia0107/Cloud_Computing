# Cloud Deployment Guide

This document provides detailed instructions for deploying the e-commerce application to cloud platforms.

## AWS Deployment Steps

### Step 1: Database Setup (RDS)

1. **Create RDS PostgreSQL Instance**
   - Go to AWS RDS Console
   - Click "Create database"
   - Choose PostgreSQL 15
   - Template: Production or Dev/Test
   - DB instance identifier: `ecommerce-db`
   - Master username: `postgres` (or your choice)
   - Master password: (create strong password)
   - DB instance class: `db.t3.micro` (free tier) or `db.t3.small`
   - Storage: 20 GB, General Purpose SSD
   - **Enable Multi-AZ deployment** (for high availability)
   - VPC: Default or your custom VPC
   - Public access: No (for security)
   - Security group: Create new or use existing
   - Database name: `ecommerce`
   - Backup retention: 7 days
   - Click "Create database"

2. **Configure Security Group**
   - Allow inbound traffic on port 5432 from your backend security group only
   - Source: Custom, select your backend security group

3. **Get Connection Endpoint**
   - Note the endpoint from RDS console
   - Format: `ecommerce-db.xxxxx.us-east-1.rds.amazonaws.com`

### Step 2: S3 Bucket Setup

1. **Create S3 Bucket**
   - Go to S3 Console
   - Click "Create bucket"
   - Bucket name: `ecommerce-product-images-[your-name]` (must be globally unique)
   - AWS Region: Same as your application
   - Block Public Access: Uncheck "Block all public access" (or configure bucket policy)
   - Versioning: Enable (optional)
   - Click "Create bucket"

2. **Configure CORS**
   - Go to bucket → Permissions → CORS
   - Add CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM Policy for S3**
   - Go to IAM Console → Policies → Create policy
   - JSON tab, paste:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::ecommerce-product-images-*/*",
           "arn:aws:s3:::ecommerce-product-images-*"
         ]
       }
     ]
   }
   ```
   - Name: `EcommerceS3Access`
   - Create policy

### Step 3: EC2 Instance Setup

1. **Create Launch Template**
   - Go to EC2 → Launch Templates → Create launch template
   - Name: `ecommerce-app-template`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: `t3.small` or `t3.medium`
   - Key pair: Create or select existing
   - Security group: Create new
     - Allow SSH (22) from your IP
     - Allow HTTP (80) from anywhere (0.0.0.0/0)
     - Allow HTTPS (443) from anywhere
     - Allow custom TCP (5000) from ALB security group
   - User data script:
   ```bash
   #!/bin/bash
   apt-get update
   apt-get install -y docker.io docker-compose
   systemctl start docker
   systemctl enable docker
   usermod -aG docker ubuntu
   ```

2. **Create IAM Role for EC2**
   - Go to IAM → Roles → Create role
   - Trusted entity: EC2
   - Attach policy: `EcommerceS3Access` (created earlier)
   - Role name: `EcommerceEC2Role`
   - Create role

3. **Attach IAM Role to Launch Template**
   - Edit launch template
   - Advanced details → IAM instance profile: `EcommerceEC2Role`

### Step 4: Application Load Balancer

1. **Create Target Groups**
   - Go to EC2 → Target Groups → Create target group
   - **Backend Target Group:**
     - Name: `ecommerce-backend-tg`
     - Target type: Instances
     - Protocol: HTTP, Port: 5000
     - VPC: Your VPC
     - Health check path: `/health`
     - Create target group
   
   - **Frontend Target Group:**
     - Name: `ecommerce-frontend-tg`
     - Target type: Instances
     - Protocol: HTTP, Port: 80
     - VPC: Your VPC
     - Health check path: `/health`
     - Create target group

2. **Create Application Load Balancer**
   - Go to EC2 → Load Balancers → Create Load Balancer
   - Type: Application Load Balancer
   - Name: `ecommerce-alb`
   - Scheme: Internet-facing
   - IP address type: IPv4
   - Listeners:
     - HTTP:80 → Forward to `ecommerce-frontend-tg`
     - HTTPS:443 → Forward to `ecommerce-frontend-tg` (after SSL setup)
   - Availability Zones: Select at least 2 different zones
   - Security group: Create new
     - Allow HTTP (80) from anywhere
     - Allow HTTPS (443) from anywhere
   - Create load balancer

3. **Configure Listener Rules**
   - Edit HTTP:80 listener
   - Add rule:
     - IF: Path is `/api/*`
     - THEN: Forward to `ecommerce-backend-tg`
   - Default action: Forward to `ecommerce-frontend-tg`

### Step 5: Auto Scaling Group

1. **Create Auto Scaling Group**
   - Go to EC2 → Auto Scaling Groups → Create Auto Scaling group
   - Name: `ecommerce-asg`
   - Launch template: `ecommerce-app-template`
   - VPC: Your VPC
   - Availability Zones: Select at least 2 zones (for fault tolerance)
   - Subnets: Select subnets in different AZs
   - Load balancing: Attach to `ecommerce-alb`
   - Health check: ELB
   - Group size:
     - Desired capacity: 2
     - Minimum: 2
     - Maximum: 10
   - Scaling policies:
     - Add target tracking policy
     - Metric: Average CPU utilization
     - Target value: 70%
   - Create Auto Scaling group

### Step 6: SSL Certificate (HTTPS)

1. **Request Certificate**
   - Go to AWS Certificate Manager (ACM)
   - Request certificate
   - Domain name: Your domain (or use ALB DNS name for testing)
   - Validation: DNS or Email
   - Request certificate

2. **Configure HTTPS Listener**
   - Go to ALB → Listeners → Add listener
   - Protocol: HTTPS, Port: 443
   - Default action: Forward to `ecommerce-frontend-tg`
   - Certificate: Select your ACM certificate
   - Create listener

### Step 7: Deploy Application Code

1. **SSH into EC2 Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

2. **Clone Repository**
   ```bash
   git clone your-repository-url
   cd Cloud_Computing
   ```

3. **Create Environment File**
   ```bash
   nano .env
   ```
   Add:
   ```env
   DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=ecommerce
   DB_USER=postgres
   DB_PASSWORD=your-db-password
   DB_SSL=true
   JWT_SECRET=your-very-secure-random-secret-key
   FRONTEND_URL=http://your-alb-dns-name
   REACT_APP_API_URL=http://your-alb-dns-name/api
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=ecommerce-product-images-yourname
   NODE_ENV=production
   ```

4. **Build and Start**
   ```bash
   docker-compose up -d --build
   ```

5. **Check Logs**
   ```bash
   docker-compose logs -f
   ```

### Step 8: CloudWatch Monitoring

1. **Create CloudWatch Dashboard**
   - Go to CloudWatch → Dashboards → Create dashboard
   - Add widgets:
     - EC2 CPU utilization
     - ALB request count
     - ALB response time
     - ALB HTTP 5xx errors
     - RDS CPU utilization
     - Auto Scaling group size

2. **Create Alarms**
   - High CPU (>80%): Send notification to SNS topic
   - High error rate (>5%): Send notification
   - Low instance count (<2): Send notification

### Step 9: Database Migration

1. **Run Migration**
   ```bash
   # SSH into instance
   docker exec -it ecommerce-backend npm run migrate
   ```

   Or manually:
   ```bash
   docker exec -it ecommerce-backend node -e "require('./config/database').init()"
   ```

## Azure Deployment (Alternative)

### Key Differences:
- **Azure SQL Database** instead of RDS
- **Azure Blob Storage** instead of S3
- **Azure Load Balancer** or **Application Gateway**
- **Virtual Machine Scale Sets** for auto-scaling
- **Azure Monitor** for monitoring

### Azure SQL Setup:
```sql
-- Connection string format:
Server=tcp:your-server.database.windows.net,1433;
Database=ecommerce;
User ID=your-admin;
Password=your-password;
Encrypt=True;
```

### Azure Blob Storage:
- Update `backend/config/aws.js` to use Azure Blob Storage SDK
- Or create Azure-compatible storage service

## Verification Checklist

- [ ] Database is accessible from backend instances
- [ ] S3 bucket is accessible and configured
- [ ] Load balancer is routing traffic correctly
- [ ] Auto Scaling group has instances in multiple AZs
- [ ] Health checks are passing
- [ ] SSL certificate is configured
- [ ] CloudWatch monitoring is set up
- [ ] Security groups are properly configured
- [ ] IAM roles have correct permissions
- [ ] Application is accessible via ALB DNS name

## Cost Optimization Tips

1. Use Reserved Instances for predictable workloads
2. Enable auto-scaling to scale down during low traffic
3. Use S3 Intelligent-Tiering for storage
4. Monitor and optimize RDS instance size
5. Use CloudWatch alarms to detect cost anomalies
6. Clean up unused resources

## Troubleshooting

### Instances not joining target group
- Check security group rules
- Verify health check path
- Check application logs

### Database connection errors
- Verify security group allows traffic
- Check database endpoint
- Verify credentials

### S3 upload failures
- Check IAM role permissions
- Verify bucket name and region
- Check CORS configuration

---

**Note**: Always follow AWS Well-Architected Framework principles for production deployments.

