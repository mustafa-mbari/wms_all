const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional(),
    address: Joi.string().max(500).optional(),
    birth_date: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  update: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).optional(),
    email: Joi.string().email().optional(),
    first_name: Joi.string().min(2).max(100).optional(),
    last_name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional(),
    address: Joi.string().max(500).optional(),
    birth_date: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    is_active: Joi.boolean().optional()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(6).required(),
    confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
  })
};

// Role validation schemas
const roleSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    permissions: Joi.array().items(Joi.number().integer()).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    is_active: Joi.boolean().optional(),
    permissions: Joi.array().items(Joi.number().integer()).optional()
  })
};

// Product validation schemas
const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    sku: Joi.string().min(2).max(100).required(),
    barcode: Joi.string().max(100).optional(),
    description: Joi.string().optional(),
    short_description: Joi.string().max(500).optional(),
    category_id: Joi.number().integer().optional(),
    family_id: Joi.number().integer().optional(),
    unit_id: Joi.number().integer().optional(),
    price: Joi.number().min(0).optional(),
    cost: Joi.number().min(0).optional(),
    stock_quantity: Joi.number().integer().min(0).optional(),
    min_stock_level: Joi.number().integer().min(0).optional(),
    weight: Joi.number().min(0).optional(),
    length: Joi.number().min(0).optional(),
    width: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
    is_digital: Joi.boolean().optional(),
    track_stock: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    sku: Joi.string().min(2).max(100).optional(),
    barcode: Joi.string().max(100).optional(),
    description: Joi.string().optional(),
    short_description: Joi.string().max(500).optional(),
    category_id: Joi.number().integer().optional(),
    family_id: Joi.number().integer().optional(),
    unit_id: Joi.number().integer().optional(),
    price: Joi.number().min(0).optional(),
    cost: Joi.number().min(0).optional(),
    stock_quantity: Joi.number().integer().min(0).optional(),
    min_stock_level: Joi.number().integer().min(0).optional(),
    weight: Joi.number().min(0).optional(),
    length: Joi.number().min(0).optional(),
    width: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
    status: Joi.string().valid('active', 'inactive', 'discontinued').optional(),
    is_digital: Joi.boolean().optional(),
    track_stock: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  })
};

// warehouse
const warehouseSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    code: Joi.string().min(2).max(20).required(),
    location: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(500).optional(),
    manager_id: Joi.number().integer().optional(),
    capacity: Joi.number().positive().optional(),
    is_active: Joi.boolean().default(true)
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    code: Joi.string().min(2).max(20).optional(),
    location: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(500).optional(),
    manager_id: Joi.number().integer().optional(),
    capacity: Joi.number().positive().optional(),
    is_active: Joi.boolean().optional()
  })
};

// Export validation functions
module.exports = {
  validate,
  userSchemas,
  roleSchemas,
  productSchemas,
  warehouseSchemas
};