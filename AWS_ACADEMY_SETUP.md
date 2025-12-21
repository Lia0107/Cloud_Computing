# AWS Academy Deployment Guide - E-Commerce Application

This guide provides step-by-step instructions for deploying the e-commerce application on **AWS Academy Learner Lab**.

> [!IMPORTANT]
> AWS Academy has specific limitations compared to regular AWS accounts. This guide is tailored for those constraints.

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] AWS Academy Learner Lab access
- [ ] Git installed on your local machine
- [ ] Basic understanding of AWS services
- [ ] SSH client (PuTTY for Windows, or built-in terminal for Mac/Linux)

## 🔑 AWS Academy Limitations

Be aware of these AWS Academy constraints:
- **No IAM user creation** - Use temporary credentials from Learner Lab
- **Limited service access** - Some services may not be available
- **Session timeout** - Lab sessions expire after 4 hours
- **Budget limits** - Monitor your spending carefully
- **No Route53** - Use ALB DNS name instead of custom domain

---

## 🚀 Deployment Steps

### Step 1: Start AWS Academy Lab Session

1. Log into AWS Academy
2. Go to your **Learner Lab** course
3. Click **Start Lab** button
4. Wait for the indicator to turn **green** (AWS ready)
5. Click **AWS** to open AWS Console

> [!TIP]
> Keep the Learner Lab page open to monitor your session time and budget.

---

### Step 2: Set Up VPC Network Architecture (Required for Production)

This section creates a highly available, secure network architecture with public and private subnets across 2 availability zones.

> [!IMPORTANT]
> This VPC setup is **required** for production-grade deployment with proper network isolation and high availability.

#### Architecture Overview

```
VPC (10.0.0.0/16)
├── Availability Zone 1 (us-east-1a)
│   ├── Public Subnet 1 (10.0.1.0/24) - ALB, NAT Gateway
│   └── Private Subnet 1 (10.0.3.0/24) - EC2 App Servers
└── Availability Zone 2 (us-east-1b)
    ├── Public Subnet 2 (10.0.2.0/24) - ALB
    └── Private Subnet 2 (10.0.4.0/24) - EC2 App Servers, RDS
```

#### 2.1 Create VPC

1. **Navigate to VPC Console**
   - Search for "VPC" in AWS Console
   - Click **Your VPCs** in left menu
   - Click **Create VPC**

2. **Configure VPC**
   - **Resources to create**: VPC only
   - **Name tag**: `ecommerce-vpc`
   - **IPv4 CIDR block**: `10.0.0.0/16`
   - **IPv6 CIDR block**: No IPv6 CIDR block
   - **Tenancy**: Default
   - Click **Create VPC**

#### 2.2 Create Internet Gateway

1. **Create Internet Gateway**
   - In VPC Console, click **Internet Gateways** in left menu
   - Click **Create internet gateway**
   - **Name tag**: `ecommerce-igw`
   - Click **Create internet gateway**

2. **Attach to VPC**
   - Select the created Internet Gateway
   - Click **Actions** → **Attach to VPC**
   - **VPC**: Select `ecommerce-vpc`
   - Click **Attach internet gateway**

#### 2.3 Create Subnets

**Public Subnet 1 (AZ-1a):**
1. Click **Subnets** in left menu → **Create subnet**
2. **VPC**: Select `ecommerce-vpc`
3. **Subnet name**: `ecommerce-public-subnet-1a`
4. **Availability Zone**: `us-east-1a`
5. **IPv4 CIDR block**: `10.0.1.0/24`
6. Click **Create subnet**

**Public Subnet 2 (AZ-1b):**
1. Click **Create subnet** again
2. **VPC**: Select `ecommerce-vpc`
3. **Subnet name**: `ecommerce-public-subnet-1b`
4. **Availability Zone**: `us-east-1b`
5. **IPv4 CIDR block**: `10.0.2.0/24`
6. Click **Create subnet**

**Private Subnet 1 (AZ-1a):**
1. Click **Create subnet** again
2. **VPC**: Select `ecommerce-vpc`
3. **Subnet name**: `ecommerce-private-subnet-1a`
4. **Availability Zone**: `us-east-1a`
5. **IPv4 CIDR block**: `10.0.3.0/24`
6. Click **Create subnet**

**Private Subnet 2 (AZ-1b):**
1. Click **Create subnet** again
2. **VPC**: Select `ecommerce-vpc`
3. **Subnet name**: `ecommerce-private-subnet-1b`
4. **Availability Zone**: `us-east-1b`
5. **IPv4 CIDR block**: `10.0.4.0/24`
6. Click **Create subnet**

#### 2.4 Enable Auto-assign Public IP for Public Subnets

1. Select `ecommerce-public-subnet-1a`
2. Click **Actions** → **Edit subnet settings**
3. Check **Enable auto-assign public IPv4 address**
4. Click **Save**
5. Repeat for `ecommerce-public-subnet-1b`

#### 2.5 Create NAT Gateway

> [!NOTE]
> NAT Gateway allows instances in private subnets to access the internet for updates while remaining private.

1. **Allocate Elastic IP**
   - Click **Elastic IPs** in left menu
   - Click **Allocate Elastic IP address**
   - Click **Allocate**
   - Note the Allocation ID

2. **Create NAT Gateway**
   - Click **NAT Gateways** in left menu
   - Click **Create NAT gateway**
   - **Name**: `ecommerce-nat-gateway`
   - **Subnet**: Select `ecommerce-public-subnet-1a` (must be public subnet)
   - **Elastic IP allocation ID**: Select the allocated EIP
   - Click **Create NAT gateway**
   - Wait for status to become "Available" (2-3 minutes)

#### 2.6 Create Route Tables

**Public Route Table:**
1. Click **Route Tables** in left menu
2. Click **Create route table**
3. **Name**: `ecommerce-public-rt`
4. **VPC**: Select `ecommerce-vpc`
5. Click **Create route table**

6. **Add Internet Gateway Route:**
   - Select `ecommerce-public-rt`
   - Click **Routes** tab → **Edit routes**
   - Click **Add route**
   - **Destination**: `0.0.0.0/0`
   - **Target**: Internet Gateway → Select `ecommerce-igw`
   - Click **Save changes**

7. **Associate Public Subnets:**
   - Click **Subnet associations** tab under route table section → **Edit subnet associations**
   - Select both:
     - `ecommerce-public-subnet-1a`
     - `ecommerce-public-subnet-1b`
   - Click **Save associations**

**Private Route Table:**
1. Click **Create route table**
2. **Name**: `ecommerce-private-rt`
3. **VPC**: Select `ecommerce-vpc`
4. Click **Create route table**

5. **Add NAT Gateway Route:**
   - Select `ecommerce-private-rt`
   - Click **Routes** tab → **Edit routes**
   - Click **Add route**
   - **Destination**: `0.0.0.0/0`
   - **Target**: NAT Gateway → Select `ecommerce-nat-gateway`
   - Click **Save changes**

6. **Associate Private Subnets:**
   - Click **Subnet associations** tab under route table section → **Edit subnet associations**
   - Select both:
     - `ecommerce-private-subnet-1a`
     - `ecommerce-private-subnet-1b`
   - Click **Save associations**

#### 2.7 Verify VPC Setup

Your VPC architecture should now have:
- ✅ 1 VPC (10.0.0.0/16)
- ✅ 1 Internet Gateway (attached to VPC)
- ✅ 2 Public Subnets (in different AZs)
- ✅ 2 Private Subnets (in different AZs)
- ✅ 1 NAT Gateway (in public subnet)
- ✅ 1 Public Route Table (routes to IGW)
- ✅ 1 Private Route Table (routes to NAT)

#### 2.8 Create VPC Endpoint for S3 (Recommended)

> [!TIP]
> VPC Endpoints allow private connections to S3 without going through the internet, saving NAT Gateway costs and improving security.

1. **Navigate to VPC Endpoints**
   - In VPC Console, click **Endpoints** in left menu
   - Click **Create endpoint**

2. **Configure S3 Gateway Endpoint**
   - **Name tag**: `ecommerce-s3-endpoint`
   - **Service category**: AWS services
   - **Services**: Search and select `com.amazonaws.us-east-1.s3` (Type: Gateway)
   - **VPC**: Select `ecommerce-vpc`
   - **Route tables**: Select `ecommerce-private-rt`
   - **Policy**: Full access (default)
   - Click **Create endpoint**

3. **Benefits**
   - ✅ **Free** - No data transfer charges for S3 access
   - ✅ **Faster** - Traffic stays on AWS private network
   - ✅ **Secure** - No internet exposure for S3 traffic
   - ✅ **Automatic** - EC2 instances automatically use the endpoint

> [!NOTE]
> The endpoint automatically adds a route to the selected route table, allowing private subnet instances to access S3 without NAT Gateway charges.

---

### Step 3: Create S3 Bucket for Product Images

1. **Navigate to S3 Console**
   - Search for "S3" in AWS Console
   - Click **Create bucket**

2. **Configure Bucket**
   - **Bucket name**: `ecommerce-images-[your-student-id]` (must be globally unique)
   - **AWS Region**: `us-east-1` (or your preferred region)
   - **Block Public Access**: Uncheck "Block all public access"
   - **Versioning**: Enable
   - **Default encryption**: SSE-S3
   - **Bucket Key**: Enable
   - **Object Lock**: Disable
   - Check the acknowledgment box
   - Click **Create bucket**

3. **Configure CORS**
   - Select your bucket
   - Go to **Permissions** tab
   - Scroll to **Cross-origin resource sharing (CORS)**
   - Click **Edit** and paste:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
   - Click **Save changes**

4. **Configure Bucket Policy** (for public read access)
   - In **Permissions** tab, scroll to **Bucket policy**
   - Click **Edit** and paste (replace `YOUR-BUCKET-NAME`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```
   - Click **Save changes**

---

### Step 4: Create RDS PostgreSQL Database

1. **Navigate to RDS Console**
   - Search for "RDS" in AWS Console
   - Click **Create database**

2. **Engine Options**
   - **Engine type**: PostgreSQL
   - **Engine version**: PostgreSQL 17.4-R2 (or latest available)

3. **Templates**
   - **Select**: **Production** (enables Multi-AZ by default)
   - OR **Dev/Test** (then manually enable Multi-AZ in next step)

4. **Availability and Durability** ⭐ IMPORTANT
   - **Deployment options**: **Multi-AZ DB instance deployment (2 instances)**
   - **Why**: Required to meet "deploy across 2 AZs" project requirement
   - Creates primary database in one AZ and standby in another AZ

5. **Settings**
   - **DB instance identifier**: `ecommercedb`
   - **Credentials management**: **Self managed** (AWS Secrets Manager not available in Academy)
   - **Master username**: `postgres`
   - **Master password**: Create a strong password (e.g., `Ecommerce123!`)
   - **Confirm password**: Re-enter the same password
   
   > [!IMPORTANT]
   > **Save your password!** AWS Academy does NOT support Secrets Manager. Write down your password - you'll need it for the `.env` file.


6. **Instance Configuration**
   - **DB instance class**: 
     - **Preferred**: `db.t3.micro` or `db.t4g.micro` (if available)
     - **If only large available**: `db.m6g.large` or `db.m7g.large` (smallest available)
   - **Note**: AWS Academy may limit available instance types

7. **Storage**
   - **Storage type**: **General Purpose SSD (gp3)** (newer, cheaper, better performance)
   - **Allocated storage**: 20 GB
   - **Storage autoscaling**: **Enable** (prevents running out of space)
   - **Maximum storage threshold**: 100 GB

8. **Connectivity**
   - **Compute resource**: **Don't connect to an EC2 compute resource**
   - **Virtual Private Cloud (VPC)**: Select `ecommerce-vpc`
   - **DB subnet group**: Create new (will use private subnets automatically)
   - **Public access**: **No** (database in private subnet for security)
   - **VPC security group**: 
     - **Option 1**: Choose existing → `ecommerce-db-sg` (if already created)
     - **Option 2**: Create new → Name: `ecommerce-db-sg`
   - **Availability Zone**: No preference (Multi-AZ will use both automatically)
   - **Certificate authority**: `rds-ca-rsa2048-g1` (default)

9. **Database Authentication**
   - **Select**: **Password authentication**
   - **Why**: Simple, secure, works with your application code

10. **Monitoring**
    - **Database Insights**: **Standard** (free, 7 days retention)
    - **Performance Insights**: **Disable** (uncheck to save costs)
    - **Enhanced Monitoring**: **Disable** (uncheck to save costs)
    - **CloudWatch Logs**: Optional (can enable "Upgrade log" if desired)

11. **Additional Configuration**
    - **Initial database name**: `ecommerce`
    - **Backup retention**: 7 days (recommended)
    - **Backup window**: No preference
    - **Encryption**: Enable (default, uses AWS managed key)
    - **Deletion protection**: Optional (can enable for safety)
    - Click **Create database**

6. **Wait for Database Creation** (5-10 minutes)
   - Status will change from "Creating" to "Available"

7. **Configure Security Group**
   - Go to **EC2 Console** → **Security Groups**
   - Find `ecommerce-db-sg`
   - Click **Edit inbound rules**
   - Add rule:
     - **Type**: PostgreSQL
     - **Port**: 5432
     - **Source**: Custom → Select `ecommerce-app-sg` (EC2 security group - will create in next step)
     - Or temporarily use: `10.0.0.0/16` (entire VPC)
   - Click **Save rules**

8. **Note Database Endpoint**
   - Go back to RDS Console
   - Click on your database `ecommerce-db`
   - Copy the **Endpoint** (e.g., `ecommerce-db.xxxxx.us-east-1.rds.amazonaws.com`)
   - Save this for later!

---

### Step 5: Create EC2 Key Pair

1. **Navigate to EC2 Console**
   - Search for "EC2"
   - In left menu, click **Key Pairs** (under Network & Security)

2. **Create Key Pair**
   - Click **Create key pair**
   - **Name**: `ecommerce-key`
   - **Key pair type**: RSA
   - **File format**: 
     - `.pem` for Mac/Linux
     - `.ppk` for Windows (PuTTY)
   - **Use puttygen to convert .ppk to .pem**
   - **Conversions menu -> Export OpenSSH key**
   - Click **Create key pair**
   - **Save the downloaded file securely!**

---

### Step 6: Launch EC2 Instance

1. **Launch Instance**
   - Go to **EC2 Console** → **Instances**
   - Click **Launch instances**

2. **Configure Instance**
   - **Name**: `ecommerce-app-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type**: `t3.micro` (recommended) or `t2.micro`
     - **t3.micro**: Better performance, 2 vCPUs, cheaper
     - **t2.micro**: Older generation, 1 vCPU
   - **Key pair**: Select `ecommerce-key` (created earlier)

3. **Network Settings**
   - Click **Edit**
   - **VPC**: Select `ecommerce-vpc`
   - **Subnet**: Select `ecommerce-private-subnet-1a` (private subnet for security)
   - **Auto-assign public IP**: Disable (using private subnet)
   - **Firewall (security groups)**: Create security group
   - **Security group name**: `ecommerce-app-sg`
   - **Description**: Security group for e-commerce application

4. **Configure Security Group Rules**
   Add these inbound rules:
   
   **Rule 1 - SSH:**
   - **Type**: SSH
   - **Port**: 22
   - **Source**: **My IP** (AWS auto-fills your public IP)
   - **Description**: Allow SSH from my computer
   
   **Rule 2 - HTTP:**
   - **Type**: HTTP
   - **Port**: 80
   - **Source**: `0.0.0.0/0` (temporarily, will change to ALB security group later)
   - **Description**: Allow web traffic
   
   **Rule 3 - HTTPS:**
   - **Type**: HTTPS
   - **Port**: 443
   - **Source**: `0.0.0.0/0` (temporarily, will change to ALB security group later)
   - **Description**: Allow secure web traffic
   
   **Rule 4 - Backend API:**
   - **Type**: Custom TCP
   - **Port**: 5000
   - **Source**: `10.0.0.0/16` (VPC CIDR, will change to ALB security group later)
   - **Description**: Allow backend API
   
   > [!NOTE]
   > We use `0.0.0.0/0` temporarily for HTTP/HTTPS. After creating the ALB, update these rules to use `ecommerce-alb-sg` as the source for better security.
   
   > [!TIP]
   > **Alternative Access Method**: Instead of SSH, you can use **AWS Session Manager** (browser-based terminal) which doesn't require SSH rules or bastion host.

5. **Configure Storage**
   - **Size**: 20 GB (or more if needed)
   - **Volume type**: gp3

6. **Advanced Details** (Recommended)
   
   Expand the **Advanced details** section and configure:
   
   **IAM instance profile:**
   - Select: `LabInstanceProfile` (allows EC2 to access S3)
   - **Why**: Enables secure S3 access for image uploads without hardcoding credentials
   
   **Metadata version:**
   - Select: `V2 only (required)`
   - **Why**: More secure (IMDSv2 protects against SSRF attacks)
   
   **User data** (scroll to bottom):
   - Paste this script to automatically install Docker and Git:
   ```bash
   #!/bin/bash
   apt-get update
   apt-get install -y docker.io docker-compose git
   systemctl start docker
   systemctl enable docker
   usermod -aG docker ubuntu
   ```
   
   > [!TIP]
   > User data runs automatically on first boot, saving you from manual setup. Perfect for Auto Scaling Groups!

7. **Launch Instance**
   - Click **Launch instance**
   - Wait for instance state to be **Running**

8. **Note Private IP**
   - Click on your instance
   - Copy the **Private IPv4 address** (e.g., 10.0.3.x)
   - Save this for later!
   
   > [!IMPORTANT]
   > EC2 instances in private subnets don't have public IPs. Access is through the Load Balancer.

---

### Step 7: Get AWS Credentials for S3 Access

1. **Go Back to Learner Lab**
   - Return to AWS Academy Learner Lab page
   - Click **AWS Details**
   - Click **Show** next to AWS CLI credentials

2. **Copy Credentials**
   - You'll see something like:
   ```
   [default]
   aws_access_key_id=ASIA...
   aws_secret_access_key=...
   aws_session_token=...
   ```
   - **Save these credentials** - you'll need them!

> [!WARNING]
> These credentials expire when your lab session ends. You'll need to update them each time you restart the lab.

---

### Step 8: Create Bastion Host (For SSH Access to Private Subnet)

> [!NOTE]
> Since EC2 instances are in private subnets, we need a bastion host in the public subnet for SSH access.

1. **Launch Bastion Instance**
   - Go to **EC2 Console** → **Launch instances**
   - **Name**: `ecommerce-bastion`
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance type**: `t3.micro` (recommended, better performance and cheaper than t2.micro)
   - **Key pair**: `ecommerce-key`
   
   **Network Settings:**
   - **VPC**: `ecommerce-vpc`
   - **Subnet**: `ecommerce-public-subnet-1a` (public subnet - IMPORTANT!)
   - **Auto-assign public IP**: **Enable** (bastion needs public IP for SSH access)
   
   **Security group:**
   - Create new: `ecommerce-bastion-sg`
   - **Inbound rule**:
     - **Type**: SSH
     - **Port**: 22
     - **Source**: **My IP** (only your computer can access bastion)
     - **Description**: Allow SSH from my computer
   
   **Storage:**
   - **Size**: 8 GB (bastion needs minimal storage)
   - **Volume type**: gp3
   
   - Click **Launch instance**
   
   > [!TIP]
   > **Save Money**: Stop the bastion host when not using it. Stopped instances don't incur compute charges (only storage ~$0.80/month).

2. **Update EC2 App Security Group**
   - Go to Security Groups → `ecommerce-app-sg`
   - Edit inbound rules
   - Update SSH rule:
     - **Source**: Custom → Select `ecommerce-bastion-sg`

---

### Step 9: Connect to EC2 and Deploy Application

1. **Connect via SSH (Through Bastion Host)**

   **For Mac/Linux:**
   ```bash
   # First, SSH into bastion
   chmod 400 ecommerce-key.pem
   ssh -i ecommerce-key.pem ubuntu@BASTION-PUBLIC-IP
   
   # From bastion, SSH into app server
   ssh ubuntu@EC2-PRIVATE-IP
   ```
   
   **Or use SSH ProxyJump (one command):**
   ```bash
   ssh -i ecommerce-key.pem -J ubuntu@BASTION-PUBLIC-IP ubuntu@EC2-PRIVATE-IP
   ```

   **For Windows (PuTTY):**
   - Open PuTTY
   - Host: `ubuntu@YOUR-EC2-PUBLIC-IP`
   - Connection → SSH → Auth → Browse for your `.ppk` file
   - Click Open

2. **Verify Docker Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

   If not installed, run:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose git
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ubuntu
   ```

   Then logout and login again:
   ```bash
   exit
   # SSH back in
   ```

3. **Clone Your Repository**
   ```bash
   cd ~
   git clone https://github.com/YOUR-USERNAME/Cloud_Computing.git
   cd Cloud_Computing
   ```

   Or if you don't have it on GitHub yet, you can upload via SCP:
   ```bash
   # On your local machine:
   scp -i ecommerce-key.pem -r "d:\Cloud Computing\Cloud_Computing" ubuntu@YOUR-EC2-IP:~/
   ```

4. **Create Environment File**
   ```bash
   nano .env
   ```

   Paste the following (replace with your actual values):
   ```env
   # Database Configuration
   DB_HOST=YOUR-RDS-ENDPOINT
   DB_PORT=5432
   DB_NAME=ecommerce
   DB_USER=postgres
   DB_PASSWORD=YOUR-DB-PASSWORD
   DB_SSL=true

   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

   # Frontend URL - Use ALB DNS name
   FRONTEND_URL=http://YOUR-ALB-DNS-NAME

   # Backend API URL - Use ALB DNS name
   REACT_APP_API_URL=http://YOUR-ALB-DNS-NAME/api

   # AWS Configuration
   AWS_ACCESS_KEY_ID=YOUR-AWS-ACCESS-KEY
   AWS_SECRET_ACCESS_KEY=YOUR-AWS-SECRET-KEY
   AWS_SESSION_TOKEN=YOUR-AWS-SESSION-TOKEN
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=ecommerce-images-YOUR-STUDENT-ID

   # Node Environment
   NODE_ENV=production
   ```
   # Admin Configuration
   ADMIN_SIGNUP_CODE=MyAdminCode12345
   
   Save with `Ctrl+X`, then `Y`, then `Enter`

5. **Build and Start Application**
   ```bash
   docker-compose up -d --build
   ```

   This will:
   - Build the backend Docker image
   - Build the frontend Docker image
   - Start PostgreSQL, backend, and frontend containers

6. **Check Container Status**
   ```bash
   docker-compose ps
   ```

   All containers should show "Up" status.

7. **View Logs** (if needed)
   ```bash
   # All logs
   docker-compose logs -f

   # Backend only
   docker-compose logs -f backend

   # Frontend only
   docker-compose logs -f frontend
   ```

   Press `Ctrl+C` to exit logs.

8. **Initialize Database** (if needed)
   ```bash
   docker exec -it ecommerce-backend npm run migrate
   ```

---

### Step 10: Access Your Application

1. **Get ALB DNS Name**
   - Go to **EC2 Console** → **Load Balancers**
   - Select `ecommerce-alb`
   - Copy the **DNS name** (e.g., `ecommerce-alb-xxxxx.us-east-1.elb.amazonaws.com`)

2. **Open Browser**
   - Navigate to: `http://YOUR-ALB-DNS-NAME`
   - You should see your e-commerce application!

3. **Test Backend API**
   - Navigate to: `http://YOUR-ALB-DNS-NAME/api/health`
   - Should return: `{"status":"ok"}`

4. **Create Admin Account**
   - Register a new user through the UI
   - Or use API:
   ```bash
   curl -X POST http://YOUR-ALB-DNS-NAME/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email":"admin@example.com",
       "password":"Admin123!",
       "firstName":"Admin",
       "lastName":"User"
     }'
   ```

---

## 🔧 Required: Set Up Load Balancer and Auto Scaling

> [!IMPORTANT]
> These steps are **REQUIRED** for your project to meet scalability and high availability requirements.

### Create Application Load Balancer

1. **Create Target Group**
   - Go to **EC2 Console** → **Target Groups**
   - Click **Create target group**
   - **Target type**: Instances
   - **Name**: `ecommerce-tg`
   - **Protocol**: HTTP, **Port**: 80
   - **VPC**: `ecommerce-vpc` (select your custom VPC, NOT default VPC)
   - **Health check path**: `/`
   - Click **Next**
   - Select your EC2 instance
   - Click **Include as pending below**
   - Click **Create target group**

2. **Create ALB Security Group First**
   - Go to **EC2** → **Security Groups** → **Create security group**
   - **Name**: `ecommerce-alb-sg`
   - **VPC**: `ecommerce-vpc`
   - **Inbound rules**:
     - HTTP (80) from 0.0.0.0/0
     - HTTPS (443) from 0.0.0.0/0
   - Create security group

3. **Update EC2 Security Group**
   - Edit `ecommerce-app-sg` inbound rules
   - Update HTTP/HTTPS/5000 rules:
     - **Source**: Custom → Select `ecommerce-alb-sg`

4. **Create Load Balancer**
   - Go to **Load Balancers** → **Create Load Balancer**
   - Choose **Application Load Balancer**
   - **Name**: `ecommerce-alb`
   - **Scheme**: Internet-facing
   - **IP address type**: IPv4
   - **VPC**: `ecommerce-vpc`
   - **Mappings**: Select both:
     - `ecommerce-public-subnet-1a`
     - `ecommerce-public-subnet-1b`
   - **Security group**: Select `ecommerce-alb-sg`
   - **Listener**: HTTP:80 → Forward to `ecommerce-tg`
   - Click **Create load balancer**

3. **Update Environment Variables**
   - SSH into EC2
   - Edit `.env` file
   - Update `FRONTEND_URL` and `REACT_APP_API_URL` to use ALB DNS name
   - Restart containers: `docker-compose restart`

---

## 🔧 Required: Set Up Auto Scaling (For Scalability)

> [!IMPORTANT]
> Auto Scaling is **REQUIRED** to meet project requirements for dynamic scaling based on demand.

### Create Launch Template

1. **Create AMI from Instance**
   - Go to **EC2 Console** → **Instances**
   - Select your instance
   - **Actions** → **Image and templates** → **Create image**
   - **Name**: `ecommerce-app-ami`
   - Click **Create image**

2. **Create Launch Template**
   - Go to **Launch Templates** → **Create launch template**
   - **Name**: `ecommerce-launch-template`
   - **AMI**: Select your created AMI
   - **Instance type**: t3.micro
   - **Key pair**: ecommerce-key
   - **Security group**: ecommerce-app-sg
   - Click **Create launch template**

3. **Create Auto Scaling Group**
   - Go to **Auto Scaling Groups** → **Create Auto Scaling group**
   - **Name**: `ecommerce-asg`
   - **Launch template**: ecommerce-launch-template
   - **VPC**: `ecommerce-vpc`
   - **Availability Zones and subnets**: Select both:
     - `ecommerce-private-subnet-1a`
     - `ecommerce-private-subnet-1b`
   - **Load balancing**: Attach to existing load balancer
   - **Target group**: ecommerce-tg
   - **Health check type**: ELB
   - **Group size**:
     - Desired: 2
     - Minimum: 1
     - Maximum: 4
   - **Scaling policies**: Target tracking
   - **Metric**: Average CPU utilization
   - **Target value**: 70
   - Click **Create Auto Scaling group**

> [!NOTE]
> Auto Scaling Group will automatically launch instances in both AZs for high availability.

---

## 📊 Monitoring and Maintenance

### CloudWatch Monitoring

1. **View Metrics**
   - Go to **CloudWatch Console**
   - **Dashboards** → **Create dashboard**
   - Add widgets for:
     - EC2 CPU utilization
     - Network in/out
     - RDS connections
     - ALB request count (if using ALB)

2. **Create Alarms**
   - **Alarms** → **Create alarm**
   - Example: Alert when CPU > 80%
   - Set up SNS topic for notifications

### Updating Application

When you need to update your code:

```bash
# SSH into EC2
ssh -i ecommerce-key.pem ubuntu@YOUR-EC2-IP

# Navigate to project
cd ~/Cloud_Computing

# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Renewing AWS Credentials

When your lab session expires and you restart:

1. Start new lab session
2. Get new AWS credentials from AWS Details
3. SSH into EC2
4. Update `.env` file with new credentials:
   ```bash
   nano .env
   # Update AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
   ```
5. Restart backend:
   ```bash
   docker-compose restart backend
   ```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to EC2 instance

**Solution:**
- Check security group allows SSH (port 22) from your IP
- Verify you're using correct key pair
- Ensure instance is in "running" state
- Check public IP address is correct

### Issue: Database connection failed

**Solution:**
- Verify RDS endpoint in `.env` file
- Check RDS security group allows port 5432
- Ensure database is in "available" state
- Verify database credentials are correct
- Check `DB_SSL=true` in `.env`

### Issue: S3 upload fails

**Solution:**
- Verify AWS credentials are current (not expired)
- Check bucket name in `.env` matches actual bucket
- Ensure bucket policy allows public read
- Verify CORS configuration is correct
- Check AWS_SESSION_TOKEN is included (required for Academy)

### Issue: Frontend shows "Cannot connect to API"

**Solution:**
- Check `REACT_APP_API_URL` in `.env`
- Verify backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Ensure security group allows port 5000
- Test backend directly: `curl http://localhost:5000/health`

### Issue: Docker commands require sudo

**Solution:**
```bash
sudo usermod -aG docker ubuntu
exit
# SSH back in
```

### Issue: Out of memory

**Solution:**
- Use smaller instance type if possible
- Reduce number of containers
- Add swap space:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 💰 Cost Management

### Monitor Your Spending

1. **Check Budget**
   - Go to Learner Lab page
   - View remaining budget in top-right

2. **Stop Resources When Not in Use**
   ```bash
   # Stop containers
   docker-compose down
   
   # Stop EC2 instance (from AWS Console)
   # Actions → Instance State → Stop
   ```

3. **Clean Up When Done**
   - Delete EC2 instances
   - Delete RDS database
   - Delete S3 bucket
   - Delete load balancers
   - Delete snapshots and AMIs

---

## ✅ Deployment Checklist

Use this checklist to track your progress:

**VPC Networking:**
- [ ] VPC created (10.0.0.0/16)
- [ ] Internet Gateway created and attached
- [ ] Public subnets created in 2 AZs
- [ ] Private subnets created in 2 AZs
- [ ] NAT Gateway created in public subnet
- [ ] Public route table configured (routes to IGW)
- [ ] Private route table configured (routes to NAT)
- [ ] Subnets associated with route tables
- [ ] VPC Endpoint for S3 created (cost savings)

**Core Services:**
- [ ] AWS Academy lab session started
- [ ] S3 bucket created and configured
- [ ] RDS PostgreSQL database created in private subnet
- [ ] Database security group configured
- [ ] EC2 key pair created and downloaded
- [ ] Bastion host launched in public subnet
- [ ] EC2 app instances launched in private subnets
- [ ] Security groups properly configured
- [ ] AWS credentials obtained

**Application Deployment:**
- [ ] Connected to EC2 via bastion host
- [ ] Docker and Docker Compose installed
- [ ] Application code deployed
- [ ] `.env` file configured with ALB DNS
- [ ] Docker containers built and started
- [ ] Database initialized

**Load Balancing & Scaling (Required):**
- [ ] ALB security group created
- [ ] Target group created
- [ ] Application Load Balancer configured across 2 AZs
- [ ] ALB health checks passing
- [ ] AMI created from configured instance
- [ ] Launch template created
- [ ] Auto Scaling Group created (min=1, max=4)
- [ ] Auto Scaling policies configured (CPU 70%)
- [ ] Instances distributed across 2 AZs

**Testing & Monitoring:**
- [ ] Application accessible via ALB DNS
- [ ] Backend API responding through ALB
- [ ] S3 image upload working
- [ ] CloudWatch monitoring set up
- [ ] CloudWatch alarms configured
- [ ] Multi-AZ failover tested

---

## 📚 Additional Resources

- [AWS Academy Learner Lab Guide](https://awsacademy.instructure.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)

---

## 🎓 Team Collaboration Tips

If working in a team:

1. **Divide Responsibilities**
   - Person 1: Infrastructure (EC2, RDS, S3)
   - Person 2: Application deployment and testing
   - Person 3: Monitoring, security, and documentation

2. **Share Credentials Securely**
   - Use AWS Secrets Manager or Parameter Store
   - Or share via encrypted channels (not email!)

3. **Document Everything**
   - Keep track of all resource IDs
   - Document any custom configurations
   - Take screenshots for your report

4. **Test Thoroughly**
   - Test all features before final submission
   - Verify auto-scaling works
   - Test load balancer failover
   - Check monitoring and alerts

---

**Good luck with your deployment! 🚀**

If you encounter any issues not covered here, check the main [DEPLOYMENT.md](./DEPLOYMENT.md) file or consult AWS Academy support.
