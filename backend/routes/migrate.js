const express = require('express');
const router = express.Router();
const db = require('../config/database');

// One-time endpoint to migrate image URLs to S3
router.post('/migrate-images-to-s3', async (req, res) => {
  try {
    const imageUpdates = [
      { sku: 'LAP-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/laptop.jpg' },
      { sku: 'MOU-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/wireless-mouse.jpg' },
      { sku: 'KEY-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/mechanical-keyboard.jpg' },
      { sku: 'CHA-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/office-chair.jpg' },
      { sku: 'DES-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/standing-desk.jpg' },
      { sku: 'MON-001', url: 'https://ecommerce-images-22018097.s3.amazonaws.com/products/monitor.jpg' },
    ];

    const results = [];
    for (const update of imageUpdates) {
      const query = 'UPDATE products SET image_url = $1 WHERE sku = $2 RETURNING sku, image_url';
      const result = await db.query(query, [update.url, update.sku]);
      if (result.rows.length > 0) {
        results.push(result.rows[0]);
      }
    }

    res.json({
      success: true,
      message: 'Image URLs migrated to S3 successfully',
      updated: results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
