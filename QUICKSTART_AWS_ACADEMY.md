# AWS Academy Quick Start Guide

## 🚀 Quick Setup (TL;DR)

### 1. Start Lab & Get Credentials
- Start AWS Academy Learner Lab
- AWS Details → Show credentials
- Save: access key, secret key, session token

### 2. Create S3 Bucket
```
Name: ecommerce-images-[your-id]
Region: us-east-1
Public access: Allow
Add CORS + bucket policy (see main guide)
```

### 3. Create RDS Database
```
Engine: PostgreSQL 15
Identifier: ecommerce-db
Username: postgres
Password: [create strong password]
Instance: db.t3.micro
Public access: Yes
Database name: ecommerce
Security group: Allow port 5432
```
**Save endpoint URL!**

### 4. Launch EC2
```
Name: ecommerce-app-server
AMI: Ubuntu 22.04
Type: t2.micro
Key: Create new (ecommerce-key)
Security: Allow 22, 80, 443, 5000
```
**Save public IP!**

### 5. Connect & Deploy
```bash
# Connect
ssh -i ecommerce-key.pem ubuntu@YOUR-EC2-IP

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git
sudo systemctl start docker
sudo usermod -aG docker ubuntu
exit  # logout and login again

# Deploy
git clone YOUR-REPO
cd Cloud_Computing
cp .env.aws-academy-template .env
nano .env  # Fill in all values
docker-compose up -d --build
```

### 6. Access
- Frontend: `http://YOUR-EC2-IP`
- Backend: `http://YOUR-EC2-IP:5000/health`

## 📋 Environment Variables Checklist

Update `.env` with:
- [ ] `DB_HOST` - RDS endpoint
- [ ] `DB_PASSWORD` - Your DB password
- [ ] `FRONTEND_URL` - http://YOUR-EC2-IP
- [ ] `REACT_APP_API_URL` - http://YOUR-EC2-IP:5000/api
- [ ] `AWS_ACCESS_KEY_ID` - From Learner Lab
- [ ] `AWS_SECRET_ACCESS_KEY` - From Learner Lab
- [ ] `AWS_SESSION_TOKEN` - From Learner Lab
- [ ] `S3_BUCKET_NAME` - Your bucket name
- [ ] `JWT_SECRET` - Random string

## 🔧 Common Commands

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 🐛 Quick Troubleshooting

**Can't connect to DB?**
- Check RDS security group allows 5432
- Verify endpoint in .env
- Ensure DB_SSL=true

**S3 upload fails?**
- Update AWS credentials (they expire!)
- Check bucket name
- Verify session token included

**Frontend can't reach API?**
- Check REACT_APP_API_URL in .env
- Verify backend running: `docker-compose ps`
- Check security group allows port 5000

---

**For detailed instructions, see [AWS_ACADEMY_SETUP.md](./AWS_ACADEMY_SETUP.md)**

**For step-by-step workflow, run:** `/deploy-aws-academy`
