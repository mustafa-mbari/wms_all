// Shared TypeScript types for both frontend and backend

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role_id?: number;
  role?: Role;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id?: number;
  warehouse_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  description?: string;
  manager_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

// Query types
export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  warehouse_id?: number;
  is_active?: boolean;
}

// System types
export interface SystemSettings {
  id: number;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface SystemLog {
  id: number;
  user_id?: number;
  action: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
