const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all units of measure
router.get('/', async (req, res) => {
  try {
    const units = await db('units_of_measure')
      .where('is_active', true)
      .orderBy('name');

    res.json({
      success: true,
      message: 'Units of measure retrieved successfully',
      data: units
    });
  } catch (error) {
    console.error('Error fetching units of measure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch units of measure',
      error: error.message
    });
  }
});

// Get unit of measure by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const unit = await db('units_of_measure')
      .where('id', id)
      .first();

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit of measure not found'
      });
    }

    res.json({
      success: true,
      message: 'Unit of measure retrieved successfully',
      data: unit
    });
  } catch (error) {
    console.error('Error fetching unit of measure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unit of measure',
      error: error.message
    });
  }
});

// Create new unit of measure
router.post('/', async (req, res) => {
  try {
    const { name, symbol, description } = req.body;
    
    const [unit] = await db('units_of_measure')
      .insert({
        name,
        symbol,
        description,
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Unit of measure created successfully',
      data: unit
    });
  } catch (error) {
    console.error('Error creating unit of measure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create unit of measure',
      error: error.message
    });
  }
});

// Update unit of measure
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol, description, is_active } = req.body;

    const [unit] = await db('units_of_measure')
      .where('id', id)
      .update({
        name,
        symbol,
        description,
        is_active,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit of measure not found'
      });
    }

    res.json({
      success: true,
      message: 'Unit of measure updated successfully',
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit of measure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update unit of measure',
      error: error.message
    });
  }
});

// Delete unit of measure
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCount = await db('units_of_measure')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Unit of measure not found'
      });
    }

    res.json({
      success: true,
      message: 'Unit of measure deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit of measure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete unit of measure',
      error: error.message
    });
  }
});

module.exports = router;
