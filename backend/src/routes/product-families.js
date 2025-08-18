const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all product families
router.get('/', async (req, res) => {
  try {
    const families = await db('product_families')
      .leftJoin('product_categories', 'product_families.category_id', 'product_categories.id')
      .select(
        'product_families.*',
        'product_categories.name as category_name'
      )
      .where('product_families.is_active', true)
      .orderBy('product_families.name');

    res.json({
      success: true,
      message: 'Product families retrieved successfully',
      data: families
    });
  } catch (error) {
    console.error('Error fetching product families:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product families',
      error: error.message
    });
  }
});

// Get family by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const family = await db('product_families')
      .leftJoin('product_categories', 'product_families.category_id', 'product_categories.id')
      .select(
        'product_families.*',
        'product_categories.name as category_name'
      )
      .where('product_families.id', id)
      .first();

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Product family not found'
      });
    }

    // Get products in this family
    const products = await db('products')
      .where('family_id', id)
      .where('status', 'active')
      .select('id', 'name', 'sku', 'price')
      .orderBy('name');

    family.products = products;

    res.json({
      success: true,
      message: 'Product family retrieved successfully',
      data: family
    });
  } catch (error) {
    console.error('Error fetching product family:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product family',
      error: error.message
    });
  }
});

// Create new product family
router.post('/', async (req, res) => {
  try {
    const { name, description, category_id } = req.body;
    
    const [family] = await db('product_families')
      .insert({
        name,
        description,
        category_id: category_id || null,
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Product family created successfully',
      data: family
    });
  } catch (error) {
    console.error('Error creating product family:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product family',
      error: error.message
    });
  }
});

// Update product family
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_id, is_active } = req.body;

    const [family] = await db('product_families')
      .where('id', id)
      .update({
        name,
        description,
        category_id: category_id || null,
        is_active,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Product family not found'
      });
    }

    res.json({
      success: true,
      message: 'Product family updated successfully',
      data: family
    });
  } catch (error) {
    console.error('Error updating product family:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product family',
      error: error.message
    });
  }
});

// Delete product family
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if family has products
    const products = await db('products')
      .where('family_id', id)
      .count('id as count')
      .first();

    if (products.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete family with products'
      });
    }

    const deletedCount = await db('product_families')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product family not found'
      });
    }

    res.json({
      success: true,
      message: 'Product family deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product family:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product family',
      error: error.message
    });
  }
});

module.exports = router;
