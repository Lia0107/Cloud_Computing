const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN, // AWS Academy requires session token
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ecommerce-images-22018097';
const IMAGES_DIR = path.join(__dirname, '../frontend/public/images');

// Image mappings
const images = [
  { file: 'laptop.jpg', sku: 'LAP-001', key: 'products/laptop.jpg' },
  { file: 'wireless mouse.jpg', sku: 'MOU-001', key: 'products/wireless-mouse.jpg' },
  { file: 'mechanical keyboard.jpg', sku: 'KEY-001', key: 'products/mechanical-keyboard.jpg' },
  { file: 'office chair.jpg', sku: 'CHA-001', key: 'products/office-chair.jpg' },
  { file: 'standing desk.jpg', sku: 'DES-001', key: 'products/standing-desk.jpg' },
  { file: 'monitor.jpg', sku: 'MON-001', key: 'products/monitor.jpg' },
];

async function uploadImage(imageInfo) {
  const filePath = path.join(IMAGES_DIR, imageInfo.file);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const fileContent = fs.readFileSync(filePath);
  const contentType = 'image/jpeg';

  const params = {
    Bucket: BUCKET_NAME,
    Key: imageInfo.key,
    Body: fileContent,
    ContentType: contentType,
  };

  try {
    const result = await s3.upload(params).promise();
    console.log(`✓ Uploaded ${imageInfo.file} -> ${result.Location}`);
    return result.Location;
  } catch (error) {
    console.error(`✗ Failed to upload ${imageInfo.file}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Starting image upload to S3...');
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Region: ${process.env.AWS_REGION || 'us-east-1'}\n`);

  const results = [];

  for (const imageInfo of images) {
    const url = await uploadImage(imageInfo);
    if (url) {
      results.push({ sku: imageInfo.sku, url });
    }
  }

  console.log('\n--- Upload Summary ---');
  console.log(`Successfully uploaded: ${results.length}/${images.length} images\n`);

  if (results.length > 0) {
    console.log('SQL commands to update database:');
    console.log('---');
    results.forEach(({ sku, url }) => {
      console.log(`UPDATE products SET image_url = '${url}' WHERE sku = '${sku}';`);
    });
    console.log('---\n');
  }
}

main().catch(console.error);
