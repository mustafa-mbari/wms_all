// Shared constants for both frontend and backend

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:3000',
  VERSION: 'v1',
  TIMEOUT: 30000,
} as const;

// API Routes
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },
  
  // Users
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: number) => `/api/users/${id}`,
    SEARCH: '/api/users/search',
  },
  
  // Roles
  ROLES: {
    BASE: '/api/roles',
    BY_ID: (id: number) => `/api/roles/${id}`,
    PERMISSIONS: (id: number) => `/api/roles/${id}/permissions`,
  },
  
  // Products
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: (id: number) => `/api/products/${id}`,
    BY_CATEGORY: (categoryId: number) => `/api/products/category/${categoryId}`,
    BY_WAREHOUSE: (warehouseId: number) => `/api/products/warehouse/${warehouseId}`,
  },
  
  // Warehouses
  WAREHOUSES: {
    BASE: '/api/warehouses',
    BY_ID: (id: number) => `/api/warehouses/${id}`,
    PRODUCTS: (id: number) => `/api/warehouses/${id}/products`,
  },
  
  // System
  SYSTEM: {
    SETTINGS: '/api/system/settings',
    LOGS: '/api/system/logs',
    HEALTH: '/api/system/health',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
} as const;

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

// Permissions
export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Product management
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  
  // Warehouse management
  WAREHOUSE_CREATE: 'warehouse:create',
  WAREHOUSE_READ: 'warehouse:read',
  WAREHOUSE_UPDATE: 'warehouse:update',
  WAREHOUSE_DELETE: 'warehouse:delete',
  
  // System management
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_LOGS: 'system:logs',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
  },
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PRODUCT: {
    NAME: { MIN_LENGTH: 2, MAX_LENGTH: 255 },
    SKU: { MIN_LENGTH: 3, MAX_LENGTH: 50 },
    PRICE: { MIN: 0, MAX: 999999.99 },
  },
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'WarehousePro',
  VERSION: '1.0.0',
  DESCRIPTION: 'Warehouse Management System',
  AUTHOR: 'Your Company',
} as const;

// Date & Time
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY HH:mm',
  DISPLAY_DATE: 'DD/MM/YYYY',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  UPLOAD_PATH: '/uploads',
} as const;
