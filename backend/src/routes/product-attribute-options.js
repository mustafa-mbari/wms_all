const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all product attribute options
router.get('/', async (req, res) => {
  try {
    const { attribute_id } = req.query;
    
    let query = db('product_attribute_options')
      .join('product_attributes', 'product_attribute_options.attribute_id', 'product_attributes.id')
      .select(
        'product_attribute_options.*',
        'product_attributes.name as attribute_name',
        'product_attributes.slug as attribute_slug'
      )
      .where('product_attribute_options.is_active', true);

    if (attribute_id) {
      query = query.where('product_attribute_options.attribute_id', attribute_id);
    }

    const options = await query
      .orderBy('product_attribute_options.sort_order')
      .orderBy('product_attribute_options.value');

    res.json({
      success: true,
      message: 'Product attribute options retrieved successfully',
      data: options
    });
  } catch (error) {
    console.error('Error fetching product attribute options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product attribute options',
      error: error.message
    });
  }
});

// Get option by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const option = await db('product_attribute_options')
      .join('product_attributes', 'product_attribute_options.attribute_id', 'product_attributes.id')
      .select(
        'product_attribute_options.*',
        'product_attributes.name as attribute_name',
        'product_attributes.slug as attribute_slug'
      )
      .where('product_attribute_options.id', id)
      .first();

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute option not found'
      });
    }

    res.json({
      success: true,
      message: 'Product attribute option retrieved successfully',
      data: option
    });
  } catch (error) {
    console.error('Error fetching product attribute option:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product attribute option',
      error: error.message
    });
  }
});

// Create new product attribute option
router.post('/', async (req, res) => {
  try {
    const { attribute_id, value, label, sort_order } = req.body;
    
    // Verify the attribute exists and is a select/multiselect type
    const attribute = await db('product_attributes')
      .where('id', attribute_id)
      .first();

    if (!attribute) {
      return res.status(400).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    if (attribute.type !== 'select' && attribute.type !== 'multiselect') {
      return res.status(400).json({
        success: false,
        message: 'Options can only be created for select and multiselect attributes'
      });
    }

    const [option] = await db('product_attribute_options')
      .insert({
        attribute_id,
        value,
        label: label || value,
        sort_order: sort_order || 0,
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Product attribute option created successfully',
      data: option
    });
  } catch (error) {
    console.error('Error creating product attribute option:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product attribute option',
      error: error.message
    });
  }
});

// Update product attribute option
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { value, label, sort_order, is_active } = req.body;

    const [option] = await db('product_attribute_options')
      .where('id', id)
      .update({
        value,
        label: label || value,
        sort_order: sort_order || 0,
        is_active,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute option not found'
      });
    }

    res.json({
      success: true,
      message: 'Product attribute option updated successfully',
      data: option
    });
  } catch (error) {
    console.error('Error updating product attribute option:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product attribute option',
      error: error.message
    });
  }
});

// Delete product attribute option
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if option is used in attribute values
    const values = await db('product_attribute_values')
      .where('option_id', id)
      .count('id as count')
      .first();

    if (values.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete option that is used in product attribute values'
      });
    }

    const deletedCount = await db('product_attribute_options')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute option not found'
      });
    }

    res.json({
      success: true,
      message: 'Product attribute option deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product attribute option:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product attribute option',
      error: error.message
    });
  }
});

module.exports = router;
