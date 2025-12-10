# Security Architecture & Operations Guide

This guide covers security implementation, monitoring, backup policies, and cost optimization for your e-commerce application on AWS.

---

## Table of Contents
1. [Security Architecture Implementation](#security-architecture-implementation)
2. [IAM Roles and RBAC Configuration](#iam-roles-and-rbac-configuration)
3. [Monitoring, Logging, and Alerts](#monitoring-logging-and-alerts)
4. [Backup Policies](#backup-policies)
5. [Database Security](#database-security)
6. [Cost Monitoring and Optimization](#cost-monitoring-and-optimization)

---

## 1. Security Architecture Implementation

### 1.1 Network Security Architecture

Your current architecture already implements several security best practices:

```
Internet
    ↓
Internet Gateway
    ↓
Application Load Balancer (Public Subnets)
    ↓
EC2 Instances (Private Subnets)
    ↓
RDS Database (Private Subnets)
```

**✅ Security Layers Already Implemented:**
- Multi-AZ deployment across 2 availability zones
- Private subnets for application and database
- Public subnets only for ALB and NAT Gateway
- Security groups acting as virtual firewalls
- NAT Gateway for outbound internet access

### 1.2 Security Group Configuration Review

#### ALB Security Group (`ecommerce-alb-sg`):
```yaml
Inbound Rules:
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0

Outbound Rules:
  - All traffic to 0.0.0.0/0 (for health checks to EC2)
```

#### Application Security Group (`ecommerce-app-sg`):
```yaml
Inbound Rules:
  - SSH (22) from ecommerce-bastion-sg only
  - HTTP (80) from ecommerce-alb-sg only
  - HTTPS (443) from ecommerce-alb-sg only
  - Custom TCP (5000) from ecommerce-alb-sg only

Outbound Rules:
  - All traffic to 0.0.0.0/0 (for updates, S3, RDS access)
```

#### Database Security Group (`ecommerce-db-sg`):
```yaml
Inbound Rules:
  - PostgreSQL (5432) from ecommerce-app-sg only

Outbound Rules:
  - None (database doesn't initiate outbound connections)
```

#### Bastion Security Group (`ecommerce-bastion-sg`):
```yaml
Inbound Rules:
  - SSH (22) from YOUR-IP only (update this regularly)

Outbound Rules:
  - SSH (22) to ecommerce-app-sg (to reach private instances)
```

### 1.3 Additional Security Hardening

#### Enable VPC Flow Logs:

1. **Navigate to VPC Console**
2. Select your `ecommerce-vpc`
3. **Actions** → **Create flow log**
4. **Filter**: All
5. **Destination**: Send to CloudWatch Logs
6. **Log group**: `/aws/vpc/ecommerce-flowlogs`
7. **IAM role**: Create new role or use existing
8. **Tags**: 
   - Key: Name
   - Value: ecommerce-vpc-flowlogs
9. Click **Create flow log**

**Purpose**: Track all IP traffic for security analysis and troubleshooting

#### Enable AWS WAF (Web Application Firewall) - Optional:

1. **Navigate to AWS WAF Console**
2. Click **Create web ACL**
3. **Name**: `ecommerce-waf`
4. **Resource type**: Application Load Balancer
5. **Select resources**: Choose your `ecommerce-alb`
6. **Add rules**:
   - AWS Managed Rules → Core rule set
   - AWS Managed Rules → Known bad inputs
   - AWS Managed Rules → SQL database
7. **Default action**: Allow
8. Click **Create web ACL**

**Purpose**: Protect against common web exploits (SQL injection, XSS, etc.)

---

## 2. IAM Roles and RBAC Configuration

### 2.1 Current IAM Setup

**✅ Already Using:**
- `LabInstanceProfile` for EC2 instances (allows S3 access)

### 2.2 Create Custom IAM Roles for Better Security

#### Create EC2 Role with Minimal Permissions:

**Note**: In AWS Academy, you may not be able to create IAM roles. Document this configuration for production environments.

1. **Navigate to IAM Console** → **Roles**
2. Click **Create role**
3. **Trusted entity type**: AWS service
4. **Use case**: EC2
5. Click **Next**

6. **Add permissions policies**:

**Policy 1 - S3 Access (for product images):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::ecommerce-images-22018097/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::ecommerce-images-22018097"
    }
  ]
}
```

**Policy 2 - CloudWatch Logs:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

**Policy 3 - Systems Manager (for session manager access):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:UpdateInstanceInformation",
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel"
      ],
      "Resource": "*"
    }
  ]
}
```

7. **Role name**: `ecommerce-ec2-role`
8. Click **Create role**

### 2.3 Application-Level RBAC

Your application already has role-based access control in the code:

**Backend (Node.js) - Already Implemented:**
```javascript
// middleware/auth.js
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

**Usage in routes:**
```javascript
// Admin-only endpoints
router.post('/products', authenticate, isAdmin, createProduct);
router.put('/products/:id', authenticate, isAdmin, updateProduct);
router.delete('/products/:id', authenticate, isAdmin, deleteProduct);

// Customer endpoints
router.get('/products', getAllProducts); // Public
router.get('/orders', authenticate, getUserOrders); // Own orders only
```

### 2.4 Database User Permissions

**Create separate database users for different purposes:**

```sql
-- Connect to your RDS database
-- Create read-only user for reporting
CREATE USER reporting_user WITH PASSWORD 'strong_password_here';
GRANT CONNECT ON DATABASE ecommerce TO reporting_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_user;

-- Create application user with limited permissions
CREATE USER app_user WITH PASSWORD 'strong_password_here';
GRANT CONNECT ON DATABASE ecommerce TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Revoke dangerous permissions from app_user
REVOKE CREATE ON SCHEMA public FROM app_user;
```

**Update your application to use `app_user` instead of `postgres`**

---

## 3. Monitoring, Logging, and Alerts

### 3.1 CloudWatch Dashboard (Already Created) ✅

You should have these widgets:
- Auto Scaling Group CPU
- ALB Request Count
- ALB Response Time
- Healthy Host Count
- RDS CPU
- RDS Connections

### 3.2 Create CloudWatch Alarms

#### Alarm 1: High CPU Usage

1. **Navigate to CloudWatch** → **Alarms** → **Create alarm**
2. Click **Select metric**
3. **EC2** → **By Auto Scaling Group** → Select `ecommerce-asg` → **CPUUtilization**
4. **Statistic**: Average
5. **Period**: 5 minutes
6. **Conditions**:
   - Threshold type: Static
   - Greater than: 80
7. **Datapoints to alarm**: 2 out of 3 (must be high for 10 minutes)
8. **Configure actions**:
   - Click **Create new topic**
   - Topic name: `ecommerce-alerts`
   - Email: your-email@example.com
   - Click **Create topic**
9. **Alarm name**: `ecommerce-high-cpu`
10. **Description**: Alert when CPU exceeds 80% for 10 minutes
11. Click **Create alarm**

**Check your email and confirm SNS subscription!**

#### Alarm 2: Unhealthy Targets

1. **Create alarm** → **Select metric**
2. **ApplicationELB** → **Per AppELB, per TG Metrics**
3. Select your ALB and target group → **UnHealthyHostCount**
4. **Statistic**: Maximum
5. **Period**: 1 minute
6. **Conditions**: Greater than 0
7. **Datapoints**: 2 out of 2 (2 consecutive minutes)
8. **Actions**: Select existing `ecommerce-alerts` topic
9. **Alarm name**: `ecommerce-unhealthy-targets`
10. Click **Create alarm**

#### Alarm 3: High Database Connections

1. **Create alarm** → **Select metric**
2. **RDS** → **Per-Database Metrics** → Select `ecommerce-db` → **DatabaseConnections**
3. **Statistic**: Average
4. **Period**: 5 minutes
5. **Conditions**: Greater than 50
6. **Datapoints**: 2 out of 3
7. **Actions**: Select `ecommerce-alerts` topic
8. **Alarm name**: `ecommerce-db-high-connections`
9. Click **Create alarm**

#### Alarm 4: High Application Response Time

1. **Create alarm** → **Select metric**
2. **ApplicationELB** → **Per AppELB, per TG Metrics**
3. Select your target group → **TargetResponseTime**
4. **Statistic**: Average
5. **Period**: 5 minutes
6. **Conditions**: Greater than 3 (seconds)
7. **Datapoints**: 3 out of 3
8. **Actions**: Select `ecommerce-alerts` topic
9. **Alarm name**: `ecommerce-slow-response`
10. Click **Create alarm**

#### Alarm 5: ALB 5xx Errors

1. **Create alarm** → **Select metric**
2. **ApplicationELB** → **Per AppELB Metrics**
3. Select your ALB → **HTTPCode_Target_5XX_Count**
4. **Statistic**: Sum
5. **Period**: 1 minute
6. **Conditions**: Greater than 10
7. **Datapoints**: 2 out of 2
8. **Actions**: Select `ecommerce-alerts` topic
9. **Alarm name**: `ecommerce-5xx-errors`
10. Click **Create alarm**

### 3.3 Enable Application Logging

#### Enable RDS Error Logs:

1. **Navigate to RDS** → Select `ecommerce-db`
2. **Modify**
3. Scroll to **Log exports**
4. Check:
   - ✅ PostgreSQL log
   - ✅ Upgrade log
5. Click **Continue** → **Apply immediately** → **Modify DB instance**

#### View RDS Logs:

1. **CloudWatch** → **Log groups**
2. Look for `/aws/rds/instance/ecommerce-db/postgresql`
3. Click to view logs

#### Application Logs via Docker:

**Already available on your EC2 instances:**
```bash
# SSH to EC2
ssh -i ecommerce-key.pem ubuntu@INSTANCE-IP

# View backend logs
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend

# Save logs to file
docker-compose logs backend > backend-logs.txt
```

### 3.4 Enable CloudTrail (AWS API Audit Logs)

**Note**: AWS Academy may have CloudTrail already enabled by default.

1. **Navigate to CloudTrail**
2. Check if a trail named `aws-academy-trail` or similar exists
3. If not, click **Create trail**:
   - **Trail name**: `ecommerce-audit-trail`
   - **Storage location**: Create new S3 bucket
   - **Log events**: Management events (Read and Write)
   - Click **Create trail**

**Purpose**: Audit all API calls (who did what, when)

---

## 4. Backup Policies

### 4.1 RDS Automated Backups

#### Configure RDS Backup Retention:

1. **Navigate to RDS** → Select `ecommerce-db`
2. Click **Modify**
3. **Backup** section:
   - **Backup retention period**: 7 days (already configured)
   - **Backup window**: 
     - Select specific time (e.g., 03:00-04:00 UTC)
     - Choose low-traffic hours
   - **Copy tags to snapshots**: ✅ Enable
4. Click **Continue** → **Apply immediately** → **Modify**

**What this does:**
- Automatic daily backups at 3 AM
- Keeps backups for 7 days
- Point-in-time recovery available
- Automatic transaction log backups every 5 minutes

#### Create Manual RDS Snapshot (Before Major Changes):

1. **RDS Console** → **Snapshots**
2. Click **Create snapshot**
3. **DB instance**: `ecommerce-db`
4. **Snapshot name**: `ecommerce-db-before-deployment-2025-12-10`
5. Click **Create snapshot**

**Best practice**: Create manual snapshots before:
- Major application deployments
- Database schema changes
- Configuration updates

#### Test Backup Restoration:

1. **RDS Console** → **Snapshots**
2. Select a snapshot
3. **Actions** → **Restore snapshot**
4. **DB instance identifier**: `ecommerce-db-test`
5. **VPC**: `ecommerce-vpc`
6. **Subnet group**: Use existing
7. **Public access**: No
8. Click **Restore DB instance**

**Purpose**: Verify backups work and practice disaster recovery

### 4.2 AMI Backups (EC2 Snapshots)

#### Create AMI Backup Schedule:

**Manual AMI Creation:**
```bash
# Via AWS CLI (if available)
aws ec2 create-image \
  --instance-id i-1234567890abcdef0 \
  --name "ecommerce-app-backup-$(date +%Y%m%d)" \
  --description "Weekly backup of application server"
```

**Or via Console:**
1. **EC2 Console** → **Instances**
2. Select your instance
3. **Actions** → **Image and templates** → **Create image**
4. **Image name**: `ecommerce-app-backup-20251210`
5. **Reboot instance**: No (if you want zero downtime)
6. Click **Create image**

**Recommended Schedule:**
- Weekly AMIs before deployments
- Keep last 2-3 AMIs
- Delete old AMIs to save costs

### 4.3 S3 Versioning (Product Images)

1. **Navigate to S3** → Select `ecommerce-images-22018097`
2. **Properties** tab
3. **Bucket Versioning** → **Edit**
4. Select **Enable**
5. Click **Save changes**

**What this does:**
- Keeps all versions of uploaded images
- Can recover from accidental deletions
- Can revert to previous versions

**Enable S3 Lifecycle Policy (Cost Optimization):**

1. Same bucket → **Management** tab
2. **Create lifecycle rule**
3. **Rule name**: `archive-old-versions`
4. **Rule scope**: Apply to all objects
5. **Lifecycle rule actions**:
   - ✅ Move noncurrent versions between storage classes
   - ✅ Delete noncurrent versions
6. **Transitions**:
   - Move to Glacier after 30 days
   - Permanently delete after 90 days
7. Click **Create rule**

### 4.4 Backup Testing Schedule

**Monthly Backup Test Checklist:**

```markdown
## Monthly Backup Verification - [Date]

### RDS Backup Test:
- [ ] Select latest automatic backup
- [ ] Restore to test instance
- [ ] Verify data integrity
- [ ] Check all tables accessible
- [ ] Delete test instance

### AMI Backup Test:
- [ ] Launch instance from latest AMI
- [ ] Verify application starts correctly
- [ ] Check Docker containers running
- [ ] Terminate test instance

### S3 Versioning Test:
- [ ] Upload test image
- [ ] Delete test image
- [ ] Restore from version history
- [ ] Verify image accessible

**Test completed by**: [Name]
**Result**: Pass/Fail
**Notes**: [Any issues found]
```

---

## 5. Database Security

### 5.1 Current Database Security Measures ✅

**Already Implemented:**
- ✅ Database in private subnet (no public access)
- ✅ Security group allows connections only from application servers
- ✅ SSL/TLS encryption in transit (`DB_SSL=true`)
- ✅ Multi-AZ deployment for high availability
- ✅ Automated backups enabled

### 5.2 Additional Database Security Hardening

#### Enable Encryption at Rest:

**Note**: This must be done during database creation. To enable on existing database:

1. Create snapshot of current database
2. Copy snapshot with encryption enabled:
   - Select snapshot
   - **Actions** → **Copy snapshot**
   - Check **Enable encryption**
   - Select KMS key (use default `aws/rds`)
3. Restore encrypted snapshot as new database
4. Update application connection string
5. Delete old unencrypted database

**For AWS Academy**: Document this requirement for production.

#### Enable Enhanced Monitoring:

1. **RDS Console** → Select `ecommerce-db`
2. **Modify**
3. **Monitoring** section:
   - **Enhanced monitoring**: Enable
   - **Granularity**: 60 seconds
   - **Monitoring role**: Create new role or use existing
4. **Continue** → **Apply immediately**

**What this provides:**
- Real-time OS metrics
- CPU, memory, I/O statistics
- Process list
- Better troubleshooting

#### Enable Performance Insights:

1. **RDS Console** → Select `ecommerce-db`
2. **Modify**
3. **Performance Insights**:
   - ✅ Enable Performance Insights
   - **Retention period**: 7 days (free tier)
   - **KMS key**: Use default
4. **Continue** → **Apply immediately**

**What this provides:**
- Query performance analysis
- Identify slow queries
- Database load monitoring
- Wait event analysis

### 5.3 Database Access Control

#### Implement Connection Pooling:

**Update backend/config/database.js:**

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  
  // Connection pool settings
  max: 20,                    // Maximum number of clients
  min: 5,                     // Minimum number of clients
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return error after 5 seconds if no connection
});

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
```

#### Database Audit Logging:

**Enable pgAudit (for production PostgreSQL):**

1. Modify RDS parameter group
2. Add `pgaudit` extension
3. Configure audit settings:
   ```
   pgaudit.log = 'write, ddl'
   pgaudit.log_relation = on
   ```

**For AWS Academy**: Document this for production implementation.

### 5.4 Database Security Best Practices

#### Secure Database Credentials:

**Option 1: AWS Secrets Manager (Recommended for Production)**

1. **Navigate to Secrets Manager**
2. **Store a new secret**
3. **Secret type**: Credentials for RDS database
4. **Credentials**:
   - Username: postgres
   - Password: your-password
5. **Database**: Select `ecommerce-db`
6. **Secret name**: `ecommerce/db/credentials`
7. **Create secret**

**Update application to retrieve credentials:**

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getDatabaseCredentials() {
  const secret = await secretsManager
    .getSecretValue({ SecretId: 'ecommerce/db/credentials' })
    .promise();
  
  return JSON.parse(secret.SecretString);
}
```

**Option 2: Environment Variables (Current Method)**

- Store in `.env` file
- Never commit to Git (already in `.gitignore`)
- Use secure variable storage in CI/CD pipelines

#### Regular Security Audits:

**Monthly Database Security Checklist:**

```markdown
## Database Security Audit - [Date]

### Access Control:
- [ ] Review security group rules
- [ ] Verify no public access enabled
- [ ] Check bastion host access logs
- [ ] Review IAM policies

### Encryption:
- [ ] Verify SSL connections enforced
- [ ] Check encryption at rest status
- [ ] Review KMS key permissions

### Monitoring:
- [ ] Review CloudWatch alarms
- [ ] Check for suspicious query patterns
- [ ] Analyze slow query logs
- [ ] Review connection statistics

### Backups:
- [ ] Verify automated backups running
- [ ] Test restore procedure
- [ ] Check backup retention settings

### Updates:
- [ ] Review PostgreSQL version
- [ ] Check for security patches
- [ ] Plan maintenance window

**Audited by**: [Name]
**Issues found**: [None/List]
**Action items**: [List]
```

---

## 6. Cost Monitoring and Optimization

### 6.1 Set Up Cost Alerts

#### Create Budget Alert:

1. **Navigate to AWS Billing** → **Budgets**
2. Click **Create budget**
3. **Budget setup**:
   - **Budget type**: Cost budget
   - **Name**: `ecommerce-monthly-budget`
   - **Period**: Monthly
   - **Budgeted amount**: $50 (adjust based on your needs)
4. **Budget scope**: All services
5. **Configure alerts**:
   - Alert threshold: 80% of budgeted amount
   - Email: your-email@example.com
6. Click **Create budget**

#### Set Up Additional Thresholds:

Create alerts at:
- 50% ($25)
- 80% ($40)
- 100% ($50)
- 120% ($60) - Overage alert

### 6.2 Cost Allocation Tags

#### Tag All Resources:

**Apply consistent tags to all resources:**

```yaml
Tags:
  Project: ecommerce
  Environment: production
  Owner: your-name
  CostCenter: cloud-computing-course
  ManagedBy: terraform (or manual)
```

**How to add tags:**

1. **EC2 Instances**:
   - Select instance → **Tags** tab → **Manage tags**
   
2. **RDS Database**:
   - Select database → **Tags** tab → **Add tags**
   
3. **Load Balancer**:
   - Select ALB → **Tags** tab → **Add tags**
   
4. **S3 Bucket**:
   - Select bucket → **Properties** → **Tags** → **Add tag**

**Why tags matter:**
- Track costs by project
- Identify expensive resources
- Filter billing reports
- Automate resource management

### 6.3 Cost Optimization Strategies

#### EC2 Cost Optimization:

**1. Right-Size Instances:**
```markdown
Current: t3.micro (2 vCPU, 1 GB RAM)
Monitor CPU usage:
- If consistently < 20%: Can downgrade to t2.micro
- If consistently > 70%: Should upgrade to t3.small

Check memory usage:
ssh to instance → run: free -h
```

**2. Use Spot Instances for Development:**

For non-production environments:
- Create separate Auto Scaling Group
- Configure with Spot instances
- Save up to 90% compared to on-demand

**3. Stop Unused Resources:**

```bash
# Stop bastion host when not in use
aws ec2 stop-instances --instance-ids i-xxxxx

# Stop development instances overnight
# Set up CloudWatch Events to automate
```

**4. Reserved Instances (If running long-term):**

If you know you'll run 2+ instances for a year:
- Purchase Reserved Instances
- Save up to 40% vs on-demand pricing

#### RDS Cost Optimization:

**1. Review Instance Size:**
```markdown
Current: db.t3.micro or similar
Monitor:
- CPU utilization < 40%? Can downgrade
- Connection count consistently low? Can use smaller instance
- Storage usage < 50%? Appropriate size
```

**2. Optimize Storage:**
```markdown
Current: gp3 (General Purpose SSD)
- Start with 20 GB
- Enable auto-scaling to grow as needed
- Monitor IOPS usage
- If low IOPS, gp3 is most cost-effective
```

**3. Delete Old Snapshots:**
```bash
# List snapshots older than 30 days
# Delete manually or automate cleanup
```

**4. Consider Aurora Serverless (For Variable Workloads):**

For unpredictable traffic:
- Pay per second
- Automatically scales
- Can save 70% vs provisioned instances

#### S3 Cost Optimization:

**1. Implement Lifecycle Policies:**

Already configured earlier:
- Move old versions to Glacier after 30 days
- Delete old versions after 90 days

**2. Review Storage Class:**
```markdown
Current: S3 Standard
For archived product images:
- Move to S3 Standard-IA after 30 days (50% cheaper)
- Move to Glacier for rarely accessed (90% cheaper)
```

**3. Enable S3 Intelligent-Tiering:**

1. Select bucket → **Management** → **Create lifecycle rule**
2. **Rule name**: `intelligent-tiering`
3. **Choose a rule scope**: Apply to all objects
4. **Lifecycle rule actions**:
   - ✅ Transition current versions between storage classes
5. **Transitions**:
   - After 0 days → Intelligent-Tiering
6. **Create rule**

#### NAT Gateway Cost Optimization:

**NAT Gateway is expensive ($0.045/hour + data transfer)**

**Options to reduce costs:**

1. **Use single NAT Gateway** (if acceptable downtime):
   - Remove NAT Gateway from AZ-2
   - Update route tables
   - Save 50% on NAT costs
   - Trade-off: If NAT Gateway AZ fails, instances in other AZ can't access internet

2. **Use NAT Instance** (more complex, cheaper):
   - Launch t3.micro as NAT instance
   - Configure port forwarding
   - Save ~60% vs NAT Gateway

3. **Use VPC Endpoints for AWS services** (recommended):
   - Create S3 VPC Endpoint (free!)
   - Avoid NAT Gateway for S3 traffic

**Create S3 VPC Endpoint:**

1. **VPC Console** → **Endpoints**
2. **Create endpoint**
3. **Service category**: AWS services
4. **Service name**: `com.amazonaws.us-east-1.s3` (Gateway type)
5. **VPC**: `ecommerce-vpc`
6. **Route tables**: Select `ecommerce-private-rt`
7. **Policy**: Full access
8. **Create endpoint**

**Benefits:**
- Free!
- Faster S3 access
- Reduces NAT Gateway data transfer costs

### 6.4 Cost Monitoring Dashboard

#### Create Cost Dashboard in CloudWatch:

1. **CloudWatch** → **Dashboards** → **Create dashboard**
2. **Name**: `ecommerce-costs`
3. **Add widgets** → **Number**
4. **Metrics** → **Billing** → **Total Estimated Charge**
5. Select **USD**
6. **Create widget**

**Add additional widgets for:**
- EC2 costs
- RDS costs
- Data transfer costs
- S3 storage costs

### 6.5 Monthly Cost Review Checklist

```markdown
## Monthly Cost Review - [Month/Year]

### Total Spending:
- Total AWS costs: $______
- vs Budget: $______
- Variance: +/- $______

### Top Cost Drivers:
1. EC2 instances: $______
2. RDS database: $______
3. Data transfer: $______
4. S3 storage: $______
5. NAT Gateway: $______

### Optimization Actions Taken:
- [ ] Reviewed instance utilization
- [ ] Stopped unused resources
- [ ] Deleted old snapshots
- [ ] Reviewed S3 lifecycle policies
- [ ] Checked Reserved Instance opportunities

### Upcoming Changes:
- [ ] Schedule maintenance windows
- [ ] Plan capacity changes
- [ ] Review retention policies

### Cost Savings Achieved:
- Action 1: Saved $______
- Action 2: Saved $______
- Total savings: $______

**Reviewed by**: [Name]
**Date**: [Date]
```

### 6.6 Cost Optimization Best Practices

**Daily:**
- Monitor budget alerts
- Check for unexpected spikes

**Weekly:**
- Review CloudWatch dashboards
- Check resource utilization
- Stop unused development resources

**Monthly:**
- Complete cost review checklist
- Analyze Cost Explorer reports
- Right-size instances based on metrics
- Delete old snapshots and AMIs
- Review lifecycle policies

**Quarterly:**
- Evaluate Reserved Instance opportunities
- Review architecture for optimization
- Compare costs with previous quarters
- Update budget forecasts

---

## Summary Checklist

### Security Architecture:
- [x] Multi-tier network architecture (public/private subnets)
- [ ] VPC Flow Logs enabled
- [ ] AWS WAF configured (optional)
- [x] Security groups properly configured

### IAM and RBAC:
- [x] EC2 instances use IAM role for S3 access
- [ ] Custom IAM roles created (if possible in AWS Academy)
- [x] Application RBAC implemented (admin/customer roles)
- [ ] Database user roles configured

### Monitoring and Logging:
- [x] CloudWatch Dashboard created
- [ ] 5 CloudWatch Alarms configured
- [ ] SNS topic for alerts created
- [ ] Email notifications confirmed
- [ ] RDS logs enabled
- [ ] CloudTrail verified

### Backup Policies:
- [x] RDS automated backups enabled (7 days)
- [ ] Backup window configured
- [ ] Manual RDS snapshot created
- [ ] AMI backup created
- [x] S3 versioning enabled
- [ ] S3 lifecycle policy configured
- [ ] Backup restoration tested

### Database Security:
- [x] Database in private subnet
- [x] SSL/TLS encryption in transit
- [ ] Enhanced monitoring enabled
- [ ] Performance Insights enabled
- [ ] Connection pooling configured
- [ ] Database audit logging planned

### Cost Optimization:
- [ ] Budget alerts configured
- [ ] Cost allocation tags applied
- [ ] S3 lifecycle policies configured
- [ ] S3 VPC Endpoint created
- [ ] Monthly cost review scheduled
- [ ] Resource utilization monitored

---

## Next Steps

1. **Immediate Actions** (Today):
   - [ ] Enable VPC Flow Logs
   - [ ] Create 5 CloudWatch Alarms
   - [ ] Configure SNS email notifications
   - [ ] Enable RDS logs
   - [ ] Create manual RDS snapshot
   - [ ] Set up budget alert

2. **This Week**:
   - [ ] Apply tags to all resources
   - [ ] Create S3 lifecycle policy
   - [ ] Create S3 VPC Endpoint
   - [ ] Test backup restoration
   - [ ] Configure backup windows
   - [ ] Set up monthly review schedule

3. **Ongoing**:
   - [ ] Monitor CloudWatch dashboards daily
   - [ ] Review costs weekly
   - [ ] Test backups monthly
   - [ ] Security audit quarterly

---

## Documentation for Project Report

Include these screenshots and details in your project report:

1. **Network Architecture Diagram** showing:
   - VPC with public/private subnets
   - Security groups and their rules
   - Multi-AZ deployment

2. **CloudWatch Dashboard** showing:
   - All widgets with live data
   - Time period: Last 24 hours

3. **CloudWatch Alarms** list:
   - All 5 alarms configured
   - Status of each alarm

4. **RDS Backup Configuration**:
   - Screenshot of automated backup settings
   - List of available snapshots

5. **Cost Dashboard**:
   - Current month spending
   - Budget vs actual
   - Cost breakdown by service

6. **Security Groups Configuration**:
   - All security groups and their rules
   - Explanation of each rule

---

**Congratulations!** You now have a secure, monitored, backed-up, and cost-optimized cloud application! 🎉

