# Deploy Backend Update to AWS

## What We Need to Do

Your images are already uploaded to S3, but we need to:
1. Deploy the updated backend code with the `/api/migrate/migrate-images-to-s3` endpoint
2. Call the migration endpoint to update the database

## Option 1: Using Docker (Recommended if you have Docker on EC2)

### Step 1: Connect to your EC2 instance

```bash
# Replace with your EC2 instance details
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Step 2: Update the code on EC2

```bash
# Navigate to your app directory
cd /path/to/your/app

# Pull latest code (if using Git)
git pull origin main

# Or manually copy the updated files:
# - backend/routes/migrate.js (new file)
# - backend/server.js (updated with migrate route)
```

### Step 3: Rebuild and restart containers

```bash
# Rebuild backend container
docker-compose build backend

# Restart services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### Step 4: Call the migration endpoint

```bash
curl -X POST http://localhost:5000/api/migrate/migrate-images-to-s3
```

Or from your local machine:
```bash
curl -X POST http://ecommerce-alb-1073842211.us-east-1.elb.amazonaws.com/api/migrate/migrate-images-to-s3
```

---

## Option 2: Manual Deployment (If not using Docker)

### Step 1: Connect to EC2

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Step 2: Update files

Create the new route file:
```bash
nano /path/to/backend/routes/migrate.js
```

Paste the content from your local `backend/routes/migrate.js`

Update server.js:
```bash
nano /path/to/backend/server.js
```

Add these lines:
- After other route imports: `const migrateRoutes = require('./routes/migrate');`
- After other route definitions: `app.use('/api/migrate', migrateRoutes);`

### Step 3: Restart backend service

```bash
# If using PM2
pm2 restart backend

# If using systemd
sudo systemctl restart ecommerce-backend

# If running directly
cd /path/to/backend
node server.js
```

### Step 4: Call migration endpoint

```bash
curl -X POST http://localhost:5000/api/migrate/migrate-images-to-s3
```

---

## Option 3: Quick Database Update (Without Redeploying)

If you can access your RDS database directly, you can run this SQL:

```sql
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/laptop.jpg' WHERE sku = 'LAP-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/wireless-mouse.jpg' WHERE sku = 'MOU-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/mechanical-keyboard.jpg' WHERE sku = 'KEY-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/office-chair.jpg' WHERE sku = 'CHA-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/standing-desk.jpg' WHERE sku = 'DES-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/monitor.jpg' WHERE sku = 'MON-001';
```

Access via psql:
```bash
PGPASSWORD=ecommerce123 psql -h ecommerce-db.cjtmj2ilkkqo.us-east-1.rds.amazonaws.com -U postgres -d ecommerce -p 5432
```

Then paste the UPDATE statements above.

---

## Verification

After updating, verify the images load:

1. Open your app: `http://ecommerce-alb-1073842211.us-east-1.elb.amazonaws.com`
2. Navigate to Products page
3. Product images should now load from S3

Check the database:
```sql
SELECT sku, image_url FROM products ORDER BY sku;
```

Expected output:
```
 sku     | image_url
---------+-----------------------------------------------------------------------------------
 CHA-001 | https://ecommerce-images-22018097.s3.amazonaws.com/products/office-chair.jpg
 DES-001 | https://ecommerce-images-22018097.s3.amazonaws.com/products/standing-desk.jpg
 KEY-001 | https://ecommerce-images-22018097.s3.amazonaws.com/products/mechanical-keyboard.jpg
 LAP-001 | https://ecommerce-images-22018097.s3.amazonaws.com/products/laptop.jpg
 MON-001 | https://ecommerce-images-22018097.s3.amazonaws.com/products/monitor.jpg
 MOU-001 | https://ecommerce-images-22018097.s3.amazonaws.com/products/wireless-mouse.jpg
```

---

## Files to Deploy

These files were created/updated:

1. **NEW**: `backend/routes/migrate.js` - Migration endpoint
2. **UPDATED**: `backend/server.js` - Added migrate route
3. **REFERENCE**: `backend/upload-to-s3.js` - Already ran locally (images uploaded)
4. **REFERENCE**: `backend/update-db-images.js` - Direct DB update script

---

## Need Help?

If you're unsure about your deployment setup:
1. Check if you're using Docker: `docker ps` on EC2
2. Check if you're using PM2: `pm2 list` on EC2
3. Check for systemd service: `sudo systemctl list-units | grep ecommerce`
