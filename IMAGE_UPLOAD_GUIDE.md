# How to Upload Product Images to Your E-Commerce Website

## 🎯 Overview

Your e-commerce application already has built-in S3 image upload functionality! Here's how to use it.

## 📋 Prerequisites

Before uploading images, make sure you've completed:
- ✅ S3 bucket created and configured
- ✅ CORS policy added to S3 bucket
- ✅ Bucket policy for public read access
- ✅ AWS credentials in `.env` file
- ✅ Application deployed and running

## 🚀 Method 1: Upload via Admin Panel (Recommended)

### Step 1: Create Admin Account

1. **Register as Admin:**
   ```bash
   # Open your browser to your application
   http://YOUR-ALB-DNS-NAME  # or http://localhost for local testing
   
   # Click "Sign Up"
   # Fill in details:
   Email: admin@example.com
   Password: Admin123!
   First Name: Admin
   Last Name: User
   ```

2. **Login:**
   - Click "Login"
   - Enter your admin credentials
   - You should be logged in

### Step 2: Access Product Management

1. **Navigate to Products:**
   - Click "Products" in the navigation menu
   - You should see existing products (Laptop Pro, Wireless Mouse, Mechanical Keyboard)

2. **Add New Product:**
   - Look for "Add Product" or "Create Product" button
   - Click it to open the product creation form

### Step 3: Upload Product Image

1. **Fill Product Details:**
   ```
   Product Name: [Your Product Name]
   Description: [Product Description]
   Price: [Price in dollars]
   Category: [Electronics/Clothing/Books/etc.]
   Stock Quantity: [Number of items]
   SKU: [Unique product code]
   ```

2. **Upload Image:**
   - Look for "Product Image" or "Upload Image" field
   - Click "Choose File" or drag-and-drop
   - Select an image from your computer
   - **Supported formats:** JPG, PNG, GIF
   - **Recommended size:** 800x800px or larger

3. **Submit:**
   - Click "Create Product" or "Save"
   - Image will be uploaded to S3
   - Product will appear on the homepage

### Step 4: Verify Image Display

1. **Check Homepage:**
   - Navigate to "Home" or "Products" page
   - Your new product should appear with the image
   - Image loads from S3 bucket

2. **Image URL Format:**
   ```
   https://ecommerce-images-[your-id].s3.amazonaws.com/[filename]
   ```

---

## 🔧 Method 2: Upload via API (For Testing)

### Using cURL (Command Line)

```bash
# 1. Login to get token
curl -X POST http://YOUR-ALB-DNS-NAME/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'

# Save the token from response

# 2. Create product with image
curl -X POST http://YOUR-ALB-DNS-NAME/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name=New Product" \
  -F "description=Amazing product" \
  -F "price=99.99" \
  -F "category=Electronics" \
  -F "stockQuantity=10" \
  -F "sku=PROD-001" \
  -F "image=@/path/to/your/image.jpg"
```

### Using Postman

1. **Login Request:**
   - Method: POST
   - URL: `http://YOUR-ALB-DNS-NAME/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "Admin123!"
     }
     ```
   - Copy the `token` from response

2. **Create Product with Image:**
   - Method: POST
   - URL: `http://YOUR-ALB-DNS-NAME/api/products`
   - Headers:
     - `Authorization: Bearer YOUR_TOKEN_HERE`
   - Body (form-data):
     ```
     name: New Product
     description: Amazing product
     price: 99.99
     category: Electronics
     stockQuantity: 10
     sku: PROD-001
     image: [Select file from computer]
     ```

---

## 🖼️ Method 3: Manual S3 Upload (Quick Test)

### Upload Directly to S3

1. **Go to S3 Console:**
   - Open AWS Console
   - Navigate to S3
   - Click on your bucket: `ecommerce-images-[your-id]`

2. **Upload Image:**
   - Click "Upload"
   - Click "Add files"
   - Select your product image
   - Click "Upload"

3. **Get Image URL:**
   - Click on uploaded image
   - Copy "Object URL"
   - Example: `https://ecommerce-images-xxx.s3.amazonaws.com/product.jpg`

4. **Create Product with Image URL:**
   ```bash
   curl -X POST http://YOUR-ALB-DNS-NAME/api/products \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "New Product",
       "description": "Amazing product",
       "price": 99.99,
       "category": "Electronics",
       "stockQuantity": 10,
       "sku": "PROD-001",
       "imageUrl": "https://ecommerce-images-xxx.s3.amazonaws.com/product.jpg"
     }'
   ```

---

## 🎨 Image Best Practices

### Image Specifications

| Aspect | Recommendation | Why |
|--------|----------------|-----|
| **Format** | JPG or PNG | Best compatibility |
| **Size** | 800x800px minimum | Good quality on all devices |
| **Aspect Ratio** | 1:1 (square) | Consistent product grid |
| **File Size** | < 500KB | Fast loading |
| **Background** | White or transparent | Professional look |

### Optimize Images Before Upload

```bash
# Using ImageMagick (optional)
convert original.jpg -resize 800x800 -quality 85 optimized.jpg

# Using online tools
# - TinyPNG.com
# - Squoosh.app
# - Compressor.io
```

---

## 🔍 Troubleshooting

### Issue 1: Image Not Uploading

**Symptoms:** Upload fails or returns error

**Solutions:**
1. Check AWS credentials in `.env`:
   ```env
   AWS_ACCESS_KEY_ID=ASIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_SESSION_TOKEN=...
   S3_BUCKET_NAME=ecommerce-images-[your-id]
   ```

2. Verify S3 bucket permissions:
   - CORS configured correctly
   - Bucket policy allows PutObject

3. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

### Issue 2: Image Not Displaying

**Symptoms:** Product shows but image is broken

**Solutions:**
1. Verify bucket policy allows public read:
   ```json
   {
     "Effect": "Allow",
     "Principal": "*",
     "Action": "s3:GetObject",
     "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
   }
   ```

2. Check image URL in database:
   ```bash
   docker exec -it ecommerce-backend psql -U postgres -d ecommerce
   SELECT id, name, image_url FROM products;
   ```

3. Test image URL directly:
   - Copy image URL from database
   - Paste in browser
   - Should display image

### Issue 3: CORS Error

**Symptoms:** Browser console shows CORS error

**Solution:** Update S3 CORS configuration:
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

### Issue 4: AWS Credentials Expired

**Symptoms:** Upload works then suddenly fails

**Solution:** Update AWS credentials (they expire every 4 hours in AWS Academy):
1. Go to Learner Lab → AWS Details → Show credentials
2. Update `.env` file with new credentials
3. Restart backend:
   ```bash
   docker-compose restart backend
   ```

---

## 📊 How It Works (Behind the Scenes)

### Image Upload Flow

```
1. User selects image in browser
   ↓
2. Frontend sends image to backend API
   POST /api/products (multipart/form-data)
   ↓
3. Backend receives image file
   ↓
4. Backend uploads to S3 using AWS SDK
   - Generates unique filename
   - Uploads to S3 bucket
   - Gets public URL
   ↓
5. Backend saves product to database
   - Stores image URL in image_url column
   ↓
6. Frontend displays product
   - Fetches product data
   - Renders image from S3 URL
```

### Database Schema

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  image_url TEXT,  -- S3 URL stored here
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### S3 Upload Code (Already in Your Backend)

```javascript
// backend/routes/products.js
const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `products/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' // Makes image publicly accessible
  };
  
  const result = await s3.upload(params).promise();
  return result.Location; // Returns public URL
};
```

---

## ✅ Quick Start Checklist

Before uploading your first image:

- [ ] S3 bucket created
- [ ] CORS configured on S3
- [ ] Bucket policy for public read access
- [ ] AWS credentials in `.env` file
- [ ] Application running (locally or on AWS)
- [ ] Admin account created
- [ ] Logged in to application
- [ ] Image ready (800x800px, < 500KB)

Then:
1. Navigate to Products page
2. Click "Add Product"
3. Fill in product details
4. Upload image
5. Submit
6. Verify image appears on homepage

---

## 🎓 Testing Locally vs AWS

### Local Testing (localhost)
```env
REACT_APP_API_URL=http://localhost:5000/api
S3_BUCKET_NAME=ecommerce-images-[your-id]
# Images upload to S3, app runs locally
```

### AWS Deployment
```env
REACT_APP_API_URL=http://YOUR-ALB-DNS-NAME/api
S3_BUCKET_NAME=ecommerce-images-[your-id]
# Images upload to S3, app runs on AWS
```

**Note:** S3 bucket is the same in both cases! Images are always stored in the cloud.

---

## 📸 Example: Adding a Product

1. **Login as admin**
2. **Navigate to Products → Add Product**
3. **Fill form:**
   - Name: "Gaming Laptop"
   - Description: "High-performance gaming laptop with RTX 4070"
   - Price: 1299.99
   - Category: Electronics
   - Stock: 5
   - SKU: LAPTOP-GAMING-001
   - Image: [Upload gaming-laptop.jpg]
4. **Click "Create Product"**
5. **Verify on homepage** - Should see new product with image

---

## 🔗 Useful Links

- **S3 Console:** https://s3.console.aws.amazon.com/
- **Your Bucket:** `ecommerce-images-[your-id]`
- **Application:** `http://YOUR-ALB-DNS-NAME`
- **API Docs:** See README.md for all endpoints

---

**Need help?** Check the troubleshooting section or review backend logs with `docker-compose logs backend`
