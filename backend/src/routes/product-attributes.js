const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all product attributes
router.get('/', async (req, res) => {
  try {
    const attributes = await db('product_attributes')
      .where('is_active', true)
      .orderBy('sort_order')
      .orderBy('name');

    res.json({
      success: true,
      message: 'Product attributes retrieved successfully',
      data: attributes
    });
  } catch (error) {
    console.error('Error fetching product attributes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product attributes',
      error: error.message
    });
  }
});

// Get attribute by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const attribute = await db('product_attributes')
      .where('id', id)
      .first();

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute not found'
      });
    }

    // Get attribute options if it's a select/multiselect type
    if (attribute.type === 'select' || attribute.type === 'multiselect') {
      const options = await db('product_attribute_options')
        .where('attribute_id', id)
        .where('is_active', true)
        .orderBy('sort_order')
        .orderBy('value');

      attribute.options = options;
    }

    res.json({
      success: true,
      message: 'Product attribute retrieved successfully',
      data: attribute
    });
  } catch (error) {
    console.error('Error fetching product attribute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product attribute',
      error: error.message
    });
  }
});

// Create new product attribute
router.post('/', async (req, res) => {
  try {
    const { name, slug, type, description, is_required, is_filterable, is_searchable, sort_order } = req.body;
    
    const [attribute] = await db('product_attributes')
      .insert({
        name,
        slug,
        type,
        description,
        is_required: is_required || false,
        is_filterable: is_filterable || false,
        is_searchable: is_searchable || false,
        sort_order: sort_order || 0,
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Product attribute created successfully',
      data: attribute
    });
  } catch (error) {
    console.error('Error creating product attribute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product attribute',
      error: error.message
    });
  }
});

// Update product attribute
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, type, description, is_required, is_filterable, is_searchable, sort_order, is_active } = req.body;

    const [attribute] = await db('product_attributes')
      .where('id', id)
      .update({
        name,
        slug,
        type,
        description,
        is_required: is_required || false,
        is_filterable: is_filterable || false,
        is_searchable: is_searchable || false,
        sort_order: sort_order || 0,
        is_active,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute not found'
      });
    }

    res.json({
      success: true,
      message: 'Product attribute updated successfully',
      data: attribute
    });
  } catch (error) {
    console.error('Error updating product attribute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product attribute',
      error: error.message
    });
  }
});

// Delete product attribute
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if attribute has values
    const values = await db('product_attribute_values')
      .where('attribute_id', id)
      .count('id as count')
      .first();

    if (values.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete attribute with values'
      });
    }

    // Delete attribute options first
    await db('product_attribute_options')
      .where('attribute_id', id)
      .del();

    const deletedCount = await db('product_attributes')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute not found'
      });
    }

    res.json({
      success: true,
      message: 'Product attribute deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product attribute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product attribute',
      error: error.message
    });
  }
});

module.exports = router;
