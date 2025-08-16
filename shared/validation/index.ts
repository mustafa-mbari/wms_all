import { z } from 'zod';
import { VALIDATION_RULES } from '../constants/index.js';

// User validation schemas
export const loginSchema = z.object({
  username: z.string()
    .min(VALIDATION_RULES.USERNAME.MIN_LENGTH, 'Username must be at least 3 characters')
    .max(VALIDATION_RULES.USERNAME.MAX_LENGTH, 'Username must not exceed 50 characters')
    .regex(VALIDATION_RULES.USERNAME.PATTERN, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, 'Password must be at least 8 characters')
    .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH, 'Password must not exceed 128 characters'),
});

export const registerSchema = z.object({
  username: z.string()
    .min(VALIDATION_RULES.USERNAME.MIN_LENGTH)
    .max(VALIDATION_RULES.USERNAME.MAX_LENGTH)
    .regex(VALIDATION_RULES.USERNAME.PATTERN),
  email: z.string()
    .email('Invalid email format')
    .max(VALIDATION_RULES.EMAIL.MAX_LENGTH),
  password: z.string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH)
    .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  full_name: z.string().max(255).optional(),
});

export const updateUserSchema = z.object({
  username: z.string()
    .min(VALIDATION_RULES.USERNAME.MIN_LENGTH)
    .max(VALIDATION_RULES.USERNAME.MAX_LENGTH)
    .regex(VALIDATION_RULES.USERNAME.PATTERN)
    .optional(),
  email: z.string()
    .email()
    .max(VALIDATION_RULES.EMAIL.MAX_LENGTH)
    .optional(),
  full_name: z.string().max(255).optional(),
  is_active: z.boolean().optional(),
  role_id: z.number().int().positive().optional(),
});

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string()
    .min(VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.PRODUCT.NAME.MAX_LENGTH),
  sku: z.string()
    .min(VALIDATION_RULES.PRODUCT.SKU.MIN_LENGTH)
    .max(VALIDATION_RULES.PRODUCT.SKU.MAX_LENGTH),
  description: z.string().max(1000).optional(),
  price: z.number()
    .min(VALIDATION_RULES.PRODUCT.PRICE.MIN)
    .max(VALIDATION_RULES.PRODUCT.PRICE.MAX),
  stock_quantity: z.number().int().min(0),
  category_id: z.number().int().positive().optional(),
  warehouse_id: z.number().int().positive().optional(),
  is_active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

// Warehouse validation schemas
export const createWarehouseSchema = z.object({
  name: z.string().min(2).max(255),
  location: z.string().min(2).max(500),
  description: z.string().max(1000).optional(),
  manager_id: z.number().int().positive().optional(),
  is_active: z.boolean().default(true),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

// Query validation schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(25),
});

export const userQuerySchema = paginationSchema.extend({
  search: z.string().max(255).optional(),
  role_id: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
});

export const productQuerySchema = paginationSchema.extend({
  search: z.string().max(255).optional(),
  category_id: z.number().int().positive().optional(),
  warehouse_id: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
});

// System validation schemas
export const systemSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(1000),
  description: z.string().max(500).optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
});

// Export type definitions
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type CreateWarehouseRequest = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseRequest = z.infer<typeof updateWarehouseSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type SystemSettingRequest = z.infer<typeof systemSettingSchema>;
