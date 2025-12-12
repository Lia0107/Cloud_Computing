---
description: Deploy to AWS Academy step-by-step
---

# AWS Academy Deployment Workflow

Follow these steps to deploy your e-commerce application to AWS Academy Learner Lab.

## Prerequisites Check

Before starting, ensure you have:
- AWS Academy Learner Lab access
- SSH client installed
- Git installed (or ability to upload files)

## Step 1: Start AWS Lab

1. Log into AWS Academy
2. Go to Learner Lab course
3. Click **Start Lab**
4. Wait for indicator to turn green
5. Click **AWS** to open console

## Step 2: Create S3 Bucket

// turbo
1. Navigate to S3 Console
2. Create bucket: `ecommerce-images-[your-id]`
3. Region: us-east-1
4. Uncheck "Block all public access"
5. Add CORS configuration (see AWS_ACADEMY_SETUP.md)
6. Add bucket policy for public read (see AWS_ACADEMY_SETUP.md)

## Step 3: Create RDS Database

1. Navigate to RDS Console
2. Create PostgreSQL database
   - Engine: PostgreSQL 15
   - Template: Free tier
   - DB identifier: `ecommerce-db`
   - Username: `postgres`
   - Password: (create strong password - save it!)
   - Instance: db.t3.micro
   - Storage: 20 GB
   - Public access: Yes
   - Initial database: `ecommerce`
3. Wait for database to be available (5-10 min)
4. Configure security group to allow port 5432 from anywhere
5. Copy database endpoint URL

## Step 4: Create EC2 Key Pair

// turbo
1. Go to EC2 → Key Pairs
2. Create key pair: `ecommerce-key`
3. Type: RSA
4. Format: .pem (Mac/Linux) or .ppk (Windows)
5. Download and save securely

## Step 5: Launch EC2 Instance

1. Go to EC2 → Launch Instance
2. Name: `ecommerce-app-server`
3. AMI: Ubuntu 22.04 LTS
4. Instance type: t2.micro
5. Key pair: ecommerce-key
6. Security group: Create new
   - Allow SSH (22) from anywhere
   - Allow HTTP (80) from anywhere
   - Allow HTTPS (443) from anywhere
   - Allow TCP (5000) from anywhere
7. Storage: 20 GB
8. User data (optional):
   ```bash
   #!/bin/bash
   apt-get update
   apt-get install -y docker.io docker-compose git
   systemctl start docker
   systemctl enable docker
   usermod -aG docker ubuntu
   ```
9. Launch instance
10. Copy public IP address

## Step 6: Get AWS Credentials

1. Go back to Learner Lab page
2. Click **AWS Details**
3. Click **Show** next to AWS CLI credentials
4. Copy all three values:
   - aws_access_key_id
   - aws_secret_access_key
   - aws_session_token

## Step 7: Connect to EC2

// turbo
**Mac/Linux:**
```bash
chmod 400 ecommerce-key.pem
ssh -i ecommerce-key.pem ubuntu@YOUR-EC2-IP
```

**Windows PowerShell:**
```powershell
ssh -i ecommerce-key.pem ubuntu@YOUR-EC2-IP
```

## Step 8: Install Docker (if not done via user data)

// turbo
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
exit
# SSH back in
```

## Step 9: Deploy Application

// turbo
```bash
# Clone or upload your code
git clone YOUR-REPO-URL
cd Cloud_Computing

# Or if uploading from local:
# scp -i ecommerce-key.pem -r "d:\Cloud Computing\Cloud_Computing" ubuntu@YOUR-EC2-IP:~/
```

## Step 10: Configure Environment

```bash
# Copy template
cp .env.aws-academy-template .env

# Edit environment file
nano .env
```

Update these values:
- `DB_HOST`: Your RDS endpoint
- `DB_PASSWORD`: Your database password
- `FRONTEND_URL`: http://YOUR-EC2-IP
- `REACT_APP_API_URL`: http://YOUR-EC2-IP:5000/api
- `AWS_ACCESS_KEY_ID`: From step 6
- `AWS_SECRET_ACCESS_KEY`: From step 6
- `AWS_SESSION_TOKEN`: From step 6
- `S3_BUCKET_NAME`: Your bucket name from step 2
- `JWT_SECRET`: Generate random string

Save: Ctrl+X, Y, Enter

## Step 11: Build and Start

// turbo
```bash
docker-compose up -d --build
```

## Step 12: Verify Deployment

// turbo
```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test backend
curl http://localhost:5000/health
```

## Step 13: Access Application

1. Open browser
2. Navigate to: `http://YOUR-EC2-IP`
3. Test all features:
   - User registration
   - Login
   - Product browsing
   - Cart functionality
   - Image upload (admin)

## Troubleshooting

If something doesn't work:

1. **Check container logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **Verify database connection:**
   - Check RDS security group
   - Verify endpoint in .env
   - Test connection: `docker exec -it ecommerce-backend npm run migrate`

3. **Check S3 access:**
   - Verify credentials are current
   - Check bucket name
   - Verify CORS and bucket policy

4. **Restart containers:**
   ```bash
   docker-compose restart
   ```

## Updating Credentials

When lab session expires:

// turbo
```bash
# Get new credentials from Learner Lab
# SSH into EC2
nano .env
# Update AWS credentials
docker-compose restart backend
```

## Cleanup (When Done)

To avoid charges:

1. Stop EC2 instance (don't terminate yet)
2. Stop RDS database
3. Or delete all resources if completely done

---

For detailed instructions, see [AWS_ACADEMY_SETUP.md](../AWS_ACADEMY_SETUP.md)
