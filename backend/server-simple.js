require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WarehousePro Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      credentials: '/api/demo-credentials',
      login: 'POST /api/auth/login',
      users: '/api/users',
      products: '/api/products',
      warehouses: '/api/warehouses'
    },
    demoCredentials: {
      admin: { username: 'admin', password: 'admin123' },
      demo: { username: 'demo', password: 'demo123' },
      manager: { username: 'manager', password: 'manager123' }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Auth routes that match frontend expectations
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username or email
    const result = await pool.query(`
      SELECT 
        id, username, email, password_hash,
        first_name as "firstName", last_name as "lastName",
        is_active as "isActive"
      FROM users 
      WHERE (username = $1 OR email = $1) AND is_active = true
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    const user = result.rows[0];
    
    // Verify password
    const bcrypt = require('bcrypt');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Return user without password, add role field for compatibility
    const { password_hash, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      role: user.username === 'admin' ? 'admin' : 'user' // Simple role assignment
    };
    
    // Set current user for demo session
    currentUser = userResponse;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/register', (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  // Simple demo registration
  const newUser = {
    id: Date.now(), // Simple ID generation
    username,
    email,
    firstName: firstName || 'New',
    lastName: lastName || 'User',
    role: 'user',
    isActive: true
  };
  
  res.status(201).json(newUser);
});

// Simple session storage (in production, use proper session management)
let currentUser = null; // Reset to null on server restart

app.get('/api/user', (req, res) => {
  // Return current logged in user
  console.log('API /user called, currentUser:', currentUser);
  res.json(currentUser);
});

app.post('/api/logout', (req, res) => {
  // Clear current user
  currentUser = null;
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/demo-credentials', (req, res) => {
  res.json({
    success: true,
    message: 'Demo credentials for testing (from database seeds)',
    data: {
      credentials: [
        {
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          description: 'System Administrator with full access'
        },
        {
          username: 'manager',
          password: 'manager123',
          role: 'manager',
          description: 'John Manager with management permissions'
        },
        {
          username: 'employee',
          password: 'employee123',
          role: 'user',
          description: 'Jane Employee for testing'
        },
        {
          username: 'mustafa',
          password: 'mustafa123',
          role: 'admin',
          description: 'Mustafa Mbari - Project Owner'
        }
      ],
      note: 'These credentials are from the database seeds and use proper password hashing.'
    }
  });
});

// Users routes with real database
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        username, 
        email, 
        first_name as "firstName", 
        last_name as "lastName",
        phone,
        address,
        birth_date as "birthDate",
        gender,
        avatar_url as "avatarUrl",
        is_active as "isActive",
        email_verified as "emailVerified",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users 
      ORDER BY id
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user endpoint
app.post('/api/users', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      birthDate,
      gender
    } = req.body;

    // Hash password (basic hashing for demo - in production use bcrypt)
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, 
        phone, address, birth_date, gender, is_active, email_verified,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, false, NOW(), NOW())
      RETURNING 
        id, username, email, first_name as "firstName", last_name as "lastName",
        phone, address, birth_date as "birthDate", gender, is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    `, [username, email, hashedPassword, firstName, lastName, phone, address, birthDate, gender]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

// Update user endpoint
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      firstName,
      lastName,
      phone,
      address,
      birthDate,
      gender,
      isActive
    } = req.body;

    const result = await pool.query(`
      UPDATE users SET
        username = $2,
        email = $3,
        first_name = $4,
        last_name = $5,
        phone = $6,
        address = $7,
        birth_date = $8,
        gender = $9,
        is_active = $10,
        updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id, username, email, first_name as "firstName", last_name as "lastName",
        phone, address, birth_date as "birthDate", gender, is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    `, [id, username, email, firstName, lastName, phone, address, birthDate, gender, isActive]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user endpoint
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: `User ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Basic products routes
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    message: 'Products endpoint - Database setup required',
    data: []
  });
});

// Basic warehouses routes
app.get('/api/warehouses', (req, res) => {
  // Return demo warehouses for development
  const demoWarehouses = [
    {
      id: 'WH001',
      name: 'Main Warehouse',
      description: 'Primary distribution center',
      address: '1000 Industrial Blvd',
      city: 'Warehouse City',
      state: 'WS',
      country: 'USA',
      postalCode: '10001',
      contactName: 'Warehouse Manager',
      contactEmail: 'wh001@warehousepro.com',
      contactPhone: '+1-555-1001',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'WH002',
      name: 'Secondary Warehouse',
      description: 'Regional distribution center',
      address: '2000 Commerce Ave',
      city: 'Commerce City',
      state: 'CC',
      country: 'USA',
      postalCode: '20002',
      contactName: 'Regional Manager',
      contactEmail: 'wh002@warehousepro.com',
      contactPhone: '+1-555-2002',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'WH003',
      name: 'Cold Storage Facility',
      description: 'Temperature controlled storage',
      address: '3000 Cold Storage Dr',
      city: 'Cold City',
      state: 'CS',
      country: 'USA',
      postalCode: '30003',
      contactName: 'Cold Storage Manager',
      contactEmail: 'wh003@warehousepro.com',
      contactPhone: '+1-555-3003',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json(demoWarehouses);
});

// Dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
  // Mock dashboard statistics data
  const mockStats = {
    inventoryValue: 2459780,
    activeProducts: 1247,
    pendingOrders: 34,
    lowStockItemsCount: 12,
    inventoryLevelsByCategory: [
      { category: "Electronics", value: 450 },
      { category: "Clothing", value: 320 },
      { category: "Books", value: 180 },
      { category: "Home & Garden", value: 250 },
      { category: "Sports", value: 127 }
    ],
    orderTrends: [
      { date: "2025-08-10", incoming: 24, outgoing: 18 },
      { date: "2025-08-11", incoming: 32, outgoing: 22 },
      { date: "2025-08-12", incoming: 28, outgoing: 25 },
      { date: "2025-08-13", incoming: 35, outgoing: 30 },
      { date: "2025-08-14", incoming: 41, outgoing: 28 },
      { date: "2025-08-15", incoming: 38, outgoing: 33 },
      { date: "2025-08-16", incoming: 45, outgoing: 35 }
    ],
    recentOrders: [
      {
        id: 1,
        orderNumber: "ORD-2025-001",
        customerId: "CUST-001",
        orderDate: "2025-08-16T10:30:00Z",
        status: "PENDING",
        totalAmount: 1250.00
      },
      {
        id: 2,
        orderNumber: "ORD-2025-002",
        customerId: "CUST-002",
        orderDate: "2025-08-16T09:15:00Z",
        status: "SHIPPED",
        totalAmount: 850.50
      },
      {
        id: 3,
        orderNumber: "ORD-2025-003",
        customerId: "CUST-003",
        orderDate: "2025-08-15T16:45:00Z",
        status: "DELIVERED",
        totalAmount: 2100.75
      }
    ]
  };
  
  res.json(mockStats);
});

app.get('/api/dashboard/activities', (req, res) => {
  // Mock recent activities data
  const mockActivities = [
    {
      id: 1,
      referenceType: "RECEIVED",
      referenceId: "REC-001",
      direction: "IN",
      quantity: 50,
      createdAt: "2025-08-16T14:30:00Z"
    },
    {
      id: 2,
      referenceType: "SHIPPED",
      referenceId: "SHIP-002",
      direction: "OUT",
      quantity: 25,
      createdAt: "2025-08-16T13:15:00Z"
    },
    {
      id: 3,
      referenceType: "ADJUSTMENT",
      referenceId: "ADJ-003",
      direction: "IN",
      quantity: 10,
      createdAt: "2025-08-16T11:45:00Z"
    },
    {
      id: 4,
      referenceType: "SHIPPED",
      referenceId: "SHIP-004",
      direction: "OUT",
      quantity: 75,
      createdAt: "2025-08-16T10:20:00Z"
    }
  ];
  
  res.json(mockActivities);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`✅ API Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚠️  Database connection will be configured later`);
});

module.exports = app;
