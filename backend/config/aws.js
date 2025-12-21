 const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS SDK
// For cloud deployment, these will be set via environment variables or IAM roles
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  // For EC2 instances, you can use IAM roles instead of credentials
  // The SDK will automatically use the instance's IAM role
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ecommerce-product-images';

// Upload file to S3
const uploadToS3 = async (file, folder = 'products') => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // For public access, or use signed URLs for private
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
};

// Delete file from S3
const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split('.com/')[1]; // Extract key from URL
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting from S3:', error);
  }
};

// Generate signed URL for private files
const getSignedUrl = async (key, expiresIn = 3600) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn,
  };
  return s3.getSignedUrlPromise('getObject', params);
};

module.exports = {
  s3,
  uploadToS3,
  deleteFromS3,
  getSignedUrl,
  BUCKET_NAME,
};

