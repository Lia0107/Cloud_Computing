#!/bin/bash
# Script to update database with S3 image URLs
# Run this from your EC2 instance if you have access to RDS

# Database connection details from .env
DB_HOST="ecommerce-db.cjtmj2ilkkqo.us-east-1.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="ecommerce"
DB_USER="postgres"
DB_PASSWORD="ecommerce123"

echo "Updating product image URLs to S3..."

# Execute SQL updates
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << EOF
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/laptop.jpg' WHERE sku = 'LAP-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/wireless-mouse.jpg' WHERE sku = 'MOU-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/mechanical-keyboard.jpg' WHERE sku = 'KEY-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/office-chair.jpg' WHERE sku = 'CHA-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/standing-desk.jpg' WHERE sku = 'DES-001';
UPDATE products SET image_url = 'https://ecommerce-images-22018097.s3.amazonaws.com/products/monitor.jpg' WHERE sku = 'MON-001';

-- Verify updates
SELECT sku, image_url FROM products ORDER BY sku;
EOF

echo "Database update complete!"
