const express = require('express');
const multer = require('multer');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadToS3 } = require('../config/aws');

const router = express.Router();

// Configure multer for memory storage (for S3 upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Get all products with optional filtering
router.get('/', [
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM products WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      queryText += ` AND category = $${paramCount}`;
      queryParams.push(category);
    }

    if (search) {
      paramCount++;
      queryText += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await db.query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const countParams = [];
    if (category) countParams.push(category);
    if (search) countParams.push(`%${search}%`);

    if (category || search) {
      let countParamCount = 0;
      if (category) {
        countParamCount++;
        countQuery += ` AND category = $${countParamCount}`;
      }
      if (search) {
        countParamCount++;
        countQuery += ` AND (name ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      }
    }

    const countResult = await db.query(
      countQuery,
      category || search ? countParams : []
    );

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Create product (Admin only)
router.post('/', authenticate, isAdmin, upload.single('image'), [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').trim().notEmpty(),
  body('stockQuantity').isInt({ min: 0 }),
  body('sku').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let imageUrl = req.body.imageUrl || null;

    // Upload to S3 if image provided
    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }

    const { name, description, price, category, stockQuantity, sku } = req.body;

    const result = await db.query(
      `INSERT INTO products (name, description, price, category, stock_quantity, sku, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, price, category, stockQuantity, sku, imageUrl]
    );

    // Log inventory change
    await db.query(
      'INSERT INTO inventory_logs (product_id, change_type, quantity_change, reason) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, 'initial', stockQuantity, 'Initial stock']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update product (Admin only)
router.put('/:id', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stockQuantity, sku } = req.body;
    const productId = req.params.id;

    // Get current product
    const currentProduct = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (currentProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let imageUrl = currentProduct.rows[0].image_url;

    // Upload new image if provided
    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }

    const result = await db.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           stock_quantity = COALESCE($5, stock_quantity),
           sku = COALESCE($6, sku),
           image_url = COALESCE($7, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, price, category, stockQuantity, sku, imageUrl, productId]
    );

    // Log inventory change if stock changed
    if (stockQuantity !== undefined && stockQuantity !== currentProduct.rows[0].stock_quantity) {
      const quantityChange = stockQuantity - currentProduct.rows[0].stock_quantity;
      await db.query(
        'INSERT INTO inventory_logs (product_id, change_type, quantity_change, reason) VALUES ($1, $2, $3, $4)',
        [productId, quantityChange > 0 ? 'restock' : 'adjustment', quantityChange, 'Manual update']
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(result.rows.map(row => row.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

module.exports = router;

