const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all product categories
router.get('/', async (req, res) => {
  try {
    const categories = await db('product_categories')
      .leftJoin('product_categories as parent', 'product_categories.parent_id', 'parent.id')
      .select(
        'product_categories.*',
        'parent.name as parent_name'
      )
      .where('product_categories.is_active', true)
      .orderBy('product_categories.sort_order')
      .orderBy('product_categories.name');

    res.json({
      success: true,
      message: 'Product categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product categories',
      error: error.message
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await db('product_categories')
      .leftJoin('product_categories as parent', 'product_categories.parent_id', 'parent.id')
      .select(
        'product_categories.*',
        'parent.name as parent_name'
      )
      .where('product_categories.id', id)
      .first();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Product category not found'
      });
    }

    // Get subcategories
    const subcategories = await db('product_categories')
      .where('parent_id', id)
      .where('is_active', true)
      .orderBy('sort_order')
      .orderBy('name');

    category.subcategories = subcategories;

    res.json({
      success: true,
      message: 'Product category retrieved successfully',
      data: category
    });
  } catch (error) {
    console.error('Error fetching product category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product category',
      error: error.message
    });
  }
});

// Create new product category
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, parent_id, image_url, sort_order } = req.body;
    
    const [category] = await db('product_categories')
      .insert({
        name,
        slug,
        description,
        parent_id: parent_id || null,
        image_url,
        sort_order: sort_order || 0,
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Product category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating product category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product category',
      error: error.message
    });
  }
});

// Update product category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parent_id, image_url, sort_order, is_active } = req.body;

    const [category] = await db('product_categories')
      .where('id', id)
      .update({
        name,
        slug,
        description,
        parent_id: parent_id || null,
        image_url,
        sort_order: sort_order || 0,
        is_active,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Product category not found'
      });
    }

    res.json({
      success: true,
      message: 'Product category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating product category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product category',
      error: error.message
    });
  }
});

// Delete product category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has subcategories
    const subcategories = await db('product_categories')
      .where('parent_id', id)
      .count('id as count')
      .first();

    if (subcategories.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories'
      });
    }

    // Check if category has products
    const products = await db('products')
      .where('category_id', id)
      .count('id as count')
      .first();

    if (products.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with products'
      });
    }

    const deletedCount = await db('product_categories')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product category not found'
      });
    }

    res.json({
      success: true,
      message: 'Product category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product category',
      error: error.message
    });
  }
});

module.exports = router;
