const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const imageUpdates = [
  { sku: 'LAP-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/laptop.jpg' },
  { sku: 'MOU-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/wireless-mouse.jpg' },
  { sku: 'KEY-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/mechanical-keyboard.jpg' },
  { sku: 'CHA-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/office-chair.jpg' },
  { sku: 'DES-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/standing-desk.jpg' },
  { sku: 'MON-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/monitor.jpg' },
];

async function updateDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    for (const update of imageUpdates) {
      const query = 'UPDATE products SET image_url = $1 WHERE sku = $2';
      const result = await client.query(query, [update.url, update.sku]);
      console.log(`✓ Updated ${update.sku}: ${result.rowCount} row(s) affected`);
    }

    console.log('\nAll image URLs updated successfully!');
    
    // Verify updates
    const verifyQuery = 'SELECT sku, image_url FROM products ORDER BY sku';
    const verifyResult = await client.query(verifyQuery);
    console.log('\n--- Current Image URLs ---');
    verifyResult.rows.forEach(row => {
      console.log(`${row.sku}: ${row.image_url}`);
    });

  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await client.end();
  }
}

updateDatabase();
