const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await db('products')
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .leftJoin('product_families', 'products.family_id', 'product_families.id')
      .leftJoin('units_of_measure', 'products.unit_id', 'units_of_measure.id')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_families.name as family_name',
        'units_of_measure.name as unit_name',
        'units_of_measure.symbol as unit_symbol'
      )
      .where('products.status', 'active')
      .orderBy('products.name');

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await db('products')
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .leftJoin('product_families', 'products.family_id', 'product_families.id')
      .leftJoin('units_of_measure', 'products.unit_id', 'units_of_measure.id')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_families.name as family_name',
        'units_of_measure.name as unit_name',
        'units_of_measure.symbol as unit_symbol'
      )
      .where('products.id', id)
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get product attributes
    const attributes = await db('product_attribute_values')
      .join('product_attributes', 'product_attribute_values.attribute_id', 'product_attributes.id')
      .leftJoin('product_attribute_options', 'product_attribute_values.option_id', 'product_attribute_options.id')
      .select(
        'product_attributes.name as attribute_name',
        'product_attributes.slug as attribute_slug',
        'product_attributes.type as attribute_type',
        'product_attribute_values.value',
        'product_attribute_options.label as option_label'
      )
      .where('product_attribute_values.product_id', id);

    product.attributes = attributes;

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    // Insert product
    const [product] = await db('products')
      .insert({
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        short_description: productData.short_description,
        category_id: productData.category_id || null,
        family_id: productData.family_id || null,
        unit_id: productData.unit_id || null,
        price: productData.price || 0,
        cost: productData.cost || 0,
        stock_quantity: productData.stock_quantity || 0,
        min_stock_level: productData.min_stock_level || 0,
        weight: productData.weight || null,
        length: productData.length || null,
        width: productData.width || null,
        height: productData.height || null,
        status: productData.status || 'active',
        is_digital: productData.is_digital || false,
        track_stock: productData.track_stock !== false,
        image_url: productData.image_url || null,
        barcode: productData.barcode || null,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const [product] = await db('products')
      .where('id', id)
      .update({
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        short_description: productData.short_description,
        category_id: productData.category_id || null,
        family_id: productData.family_id || null,
        unit_id: productData.unit_id || null,
        price: productData.price || 0,
        cost: productData.cost || 0,
        stock_quantity: productData.stock_quantity || 0,
        min_stock_level: productData.min_stock_level || 0,
        weight: productData.weight || null,
        length: productData.length || null,
        width: productData.width || null,
        height: productData.height || null,
        status: productData.status || 'active',
        is_digital: productData.is_digital || false,
        track_stock: productData.track_stock !== false,
        image_url: productData.image_url || null,
        barcode: productData.barcode || null,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCount = await db('products')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

module.exports = router;
