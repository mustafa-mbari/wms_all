const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all product attribute values
router.get('/', async (req, res) => {
  try {
    const { product_id, attribute_id } = req.query;
    
    let query = db('product_attribute_values')
      .join('product_attributes', 'product_attribute_values.attribute_id', 'product_attributes.id')
      .join('products', 'product_attribute_values.product_id', 'products.id')
      .leftJoin('product_attribute_options', 'product_attribute_values.option_id', 'product_attribute_options.id')
      .select(
        'product_attribute_values.*',
        'product_attributes.name as attribute_name',
        'product_attributes.slug as attribute_slug',
        'product_attributes.type as attribute_type',
        'products.name as product_name',
        'products.sku as product_sku',
        'product_attribute_options.label as option_label'
      );

    if (product_id) {
      query = query.where('product_attribute_values.product_id', product_id);
    }

    if (attribute_id) {
      query = query.where('product_attribute_values.attribute_id', attribute_id);
    }

    const values = await query.orderBy('products.name').orderBy('product_attributes.sort_order');

    res.json({
      success: true,
      message: 'Product attribute values retrieved successfully',
      data: values
    });
  } catch (error) {
    console.error('Error fetching product attribute values:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product attribute values',
      error: error.message
    });
  }
});

// Get value by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const value = await db('product_attribute_values')
      .join('product_attributes', 'product_attribute_values.attribute_id', 'product_attributes.id')
      .join('products', 'product_attribute_values.product_id', 'products.id')
      .leftJoin('product_attribute_options', 'product_attribute_values.option_id', 'product_attribute_options.id')
      .select(
        'product_attribute_values.*',
        'product_attributes.name as attribute_name',
        'product_attributes.slug as attribute_slug',
        'product_attributes.type as attribute_type',
        'products.name as product_name',
        'products.sku as product_sku',
        'product_attribute_options.label as option_label'
      )
      .where('product_attribute_values.id', id)
      .first();

    if (!value) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute value not found'
      });
    }

    res.json({
      success: true,
      message: 'Product attribute value retrieved successfully',
      data: value
    });
  } catch (error) {
    console.error('Error fetching product attribute value:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product attribute value',
      error: error.message
    });
  }
});

// Create new product attribute value
router.post('/', async (req, res) => {
  try {
    const { product_id, attribute_id, value, option_id } = req.body;
    
    // Verify the product and attribute exist
    const product = await db('products').where('id', product_id).first();
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product not found'
      });
    }

    const attribute = await db('product_attributes').where('id', attribute_id).first();
    if (!attribute) {
      return res.status(400).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    // Check if value already exists for this product-attribute combination
    const existingValue = await db('product_attribute_values')
      .where({ product_id, attribute_id })
      .first();

    if (existingValue) {
      return res.status(400).json({
        success: false,
        message: 'Value already exists for this product-attribute combination'
      });
    }

    const [attributeValue] = await db('product_attribute_values')
      .insert({
        product_id,
        attribute_id,
        value,
        option_id: option_id || null,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Product attribute value created successfully',
      data: attributeValue
    });
  } catch (error) {
    console.error('Error creating product attribute value:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product attribute value',
      error: error.message
    });
  }
});

// Update product attribute value
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { value, option_id } = req.body;

    const [attributeValue] = await db('product_attribute_values')
      .where('id', id)
      .update({
        value,
        option_id: option_id || null,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!attributeValue) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute value not found'
      });
    }

    res.json({
      success: true,
      message: 'Product attribute value updated successfully',
      data: attributeValue
    });
  } catch (error) {
    console.error('Error updating product attribute value:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product attribute value',
      error: error.message
    });
  }
});

// Delete product attribute value
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCount = await db('product_attribute_values')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product attribute value not found'
      });
    }

    res.json({
      success: true,
      message: 'Product attribute value deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product attribute value:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product attribute value',
      error: error.message
    });
  }
});

module.exports = router;
