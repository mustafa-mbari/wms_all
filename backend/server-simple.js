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
      warehouses: '/api/warehouses',
      'units-of-measure': '/api/units-of-measure',
      'product-categories': '/api/product-categories',
      'product-families': '/api/product-families',
      'product-attributes': '/api/product-attributes',
      'product-attribute-options': '/api/product-attribute-options',
      'product-attribute-values': '/api/product-attribute-values'
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

    // Get user roles
    const rolesResult = await pool.query(`
      SELECT r.name, r.slug
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `, [user.id]);

    const roleNames = rolesResult.rows.map(role => role.name);
    const roleSlugs = rolesResult.rows.map(role => role.slug);

    // Return user without password, include role information
    const { password_hash, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      role: roleSlugs.includes('super-admin') ? 'super-admin' : roleSlugs.includes('admin') ? 'admin' : 'user',
      role_names: roleNames,
      role_slugs: roleSlugs
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

app.post('/api/register', async (req, res) => {
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
      gender,
      isActive = true,
      isAdmin = false
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, password, first name, and last name are required'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User with this username or email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Validate gender value
    const validGenders = ['male', 'female', 'other'];
    const validatedGender = gender && validGenders.includes(gender) ? gender : null;

    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert new user into database
      const result = await client.query(`
        INSERT INTO users (
          username, email, password_hash, first_name, last_name,
          phone, address, birth_date, gender, is_active, email_verified,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, NOW(), NOW()
        ) RETURNING id, username, email, first_name, last_name, phone, address, birth_date, gender, is_active
      `, [
        username, email, passwordHash, firstName, lastName,
        phone || null, address || null, birthDate || null, validatedGender,
        isActive
      ]);

      const newUser = result.rows[0];
      
      // Assign role to new user
      if (isAdmin) {
        // Assign admin role if requested
        await client.query(`
          INSERT INTO user_roles (user_id, role_id, assigned_at)
          SELECT $1, id, NOW() FROM roles WHERE slug = 'admin'
        `, [newUser.id]);
      } else {
        // Assign default viewer role to regular users
        await client.query(`
          INSERT INTO user_roles (user_id, role_id, assigned_at)
          SELECT $1, id, NOW() FROM roles WHERE slug = 'viewer'
        `, [newUser.id]);
      }
      
      await client.query('COMMIT');
      
      // Get user with role information
      const userWithRole = await pool.query(`
        SELECT 
          u.id, u.username, u.email, u.first_name as "firstName", u.last_name as "lastName",
          u.phone, u.address, u.birth_date as "birthDate", u.gender, u.is_active as "isActive", 
          u.email_verified as "emailVerified", u.created_at as "createdAt", u.updated_at as "updatedAt"
        FROM users u
        WHERE u.id = $1
      `, [newUser.id]);

      // Get user roles
      const rolesResult = await pool.query(`
        SELECT r.name, r.slug
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1
      `, [newUser.id]);

      const roleNames = rolesResult.rows.map(role => role.name);
      const roleSlugs = rolesResult.rows.map(role => role.slug);

      const userResponse = {
        ...userWithRole.rows[0],
        isAdmin: roleSlugs.includes('admin') || roleSlugs.includes('super-admin'),
        role_names: roleNames,
        role_slugs: roleSlugs
      };
      
      console.log('New user created:', userResponse);
      
      res.status(201).json({
        success: true,
        data: userResponse,
        message: 'User created successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user: ' + error.message
    });
  }
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
        u.id, 
        u.username, 
        u.email, 
        u.first_name as "firstName", 
        u.last_name as "lastName",
        u.phone,
        u.address,
        u.birth_date as "birthDate",
        u.gender,
        u.avatar_url as "avatarUrl",
        u.is_active as "isActive",
        u.email_verified as "emailVerified",
        u.last_login_at as "lastLogin",
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        bool_or(r.slug = 'admin') as "isAdmin",
        array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) as "role_names",
        array_agg(DISTINCT r.slug) FILTER (WHERE r.slug IS NOT NULL) as "role_slugs"
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.address, 
               u.birth_date, u.gender, u.avatar_url, u.is_active, u.email_verified, 
               u.last_login_at, u.created_at, u.updated_at
      ORDER BY u.id
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
    console.log('PUT /api/users/:id called with:', req.params.id, req.body);
    
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
      isActive,
      password,
      isAdmin
    } = req.body;

    // Validate gender value
    const validGenders = ['male', 'female', 'other'];
    const validatedGender = gender && validGenders.includes(gender) ? gender : null;

    console.log('Update user request:', { id, username, email, firstName, lastName, phone, address, birthDate, gender, validatedGender, isActive, password: password ? '[PROVIDED]' : '[NOT PROVIDED]', isAdmin });

    // Start a transaction for updating user and roles
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Prepare update query - only update basic user fields first
      let updateQuery = `
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
      `;
      let queryParams = [id, username, email, firstName, lastName, phone, address, birthDate, validatedGender, isActive];
      
      // Add password update if provided
      if (password && password.trim() !== '') {
        console.log('Updating password for user', id);
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += `, password_hash = $${queryParams.length + 1}`;
        queryParams.push(hashedPassword);
      }
      
      updateQuery += ` WHERE id = $1 RETURNING 
        id, username, email, first_name as "firstName", last_name as "lastName",
        phone, address, birth_date as "birthDate", gender, is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"`;

      console.log('Executing update query:', updateQuery);
      console.log('Query params:', queryParams);

      const result = await client.query(updateQuery, queryParams);

      if (result.rows.length === 0) {
        console.log('User not found with id:', id);
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('User updated successfully:', result.rows[0]);

      // Handle admin role assignment - skip if roles table doesn't exist
      if (typeof isAdmin === 'boolean') {
        try {
          console.log('Handling admin role assignment:', isAdmin);
          
          // Check if roles table exists
          const roleCheck = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles')");
          
          if (roleCheck.rows[0].exists) {
            // Remove existing admin role
            await client.query('DELETE FROM user_roles WHERE user_id = $1 AND role_id = (SELECT id FROM roles WHERE slug = $2)', [id, 'admin']);
            
            // Add admin role if needed
            if (isAdmin) {
              await client.query(`
                INSERT INTO user_roles (user_id, role_id, assigned_at)
                SELECT $1, id, NOW() FROM roles WHERE slug = 'admin'
                ON CONFLICT (user_id, role_id) DO NOTHING
              `, [id]);
            }
            console.log('Role assignment completed');
          } else {
            console.log('Roles table does not exist, skipping role assignment');
          }
        } catch (roleError) {
          console.log('Role assignment error (non-critical):', roleError.message);
          // Don't fail the entire update if roles fail
        }
      }

      await client.query('COMMIT');
      console.log('Transaction committed successfully');
      
      // Return updated user - simplified version if roles don't work
      try {
        const updatedUserResult = await pool.query(`
          SELECT 
            u.id, u.username, u.email, u.first_name as "firstName", u.last_name as "lastName",
            u.phone, u.address, u.birth_date as "birthDate", u.gender, u.is_active as "isActive",
            u.created_at as "createdAt", u.updated_at as "updatedAt",
            COALESCE((SELECT CASE WHEN r.slug = 'admin' THEN true ELSE false END 
                     FROM user_roles ur 
                     LEFT JOIN roles r ON ur.role_id = r.id 
                     WHERE ur.user_id = u.id AND r.slug = 'admin' LIMIT 1), false) as "isAdmin"
          FROM users u
          WHERE u.id = $1
        `, [id]);

        if (updatedUserResult.rows.length > 0) {
          res.json(updatedUserResult.rows[0]);
        } else {
          // Fallback to basic user data
          const basicUser = result.rows[0];
          basicUser.isAdmin = false; // Default to false if roles don't work
          res.json(basicUser);
        }
      } catch (selectError) {
        console.log('Error in final select, returning basic user data:', selectError.message);
        const basicUser = result.rows[0];
        basicUser.isAdmin = false;
        res.json(basicUser);
      }
      
    } catch (error) {
      console.error('Transaction error:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update user: ' + error.message });
    }
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

// Products API Routes
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        pc.name as category_name,
        pf.name as family_name,
        uom.name as unit_name,
        uom.symbol as unit_symbol
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN product_families pf ON p.family_id = pf.id
      LEFT JOIN units_of_measure uom ON p.unit_id = uom.id
      WHERE p.status = 'active'
      ORDER BY p.name
    `);
    
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.rows
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

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const productResult = await pool.query(`
      SELECT 
        p.*,
        pc.name as category_name,
        pf.name as family_name,
        uom.name as unit_name,
        uom.symbol as unit_symbol
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN product_families pf ON p.family_id = pf.id
      LEFT JOIN units_of_measure uom ON p.unit_id = uom.id
      WHERE p.id = $1
    `, [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = productResult.rows[0];

    // Get product attributes
    const attributesResult = await pool.query(`
      SELECT 
        pa.name as attribute_name,
        pa.slug as attribute_slug,
        pa.type as attribute_type,
        pav.value,
        pao.label as option_label
      FROM product_attribute_values pav
      JOIN product_attributes pa ON pav.attribute_id = pa.id
      LEFT JOIN product_attribute_options pao ON pav.option_id = pao.id
      WHERE pav.product_id = $1
    `, [id]);

    product.attributes = attributesResult.rows;

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

// Units of Measure API Routes
app.get('/api/units-of-measure', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM units_of_measure 
      WHERE is_active = true 
      ORDER BY name
    `);
    
    res.json({
      success: true,
      message: 'Units of measure retrieved successfully',
      data: result.rows
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

// Product Categories API Routes
app.get('/api/product-categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pc.*,
        parent.name as parent_name
      FROM product_categories pc
      LEFT JOIN product_categories parent ON pc.parent_id = parent.id
      WHERE pc.is_active = true
      ORDER BY pc.sort_order, pc.name
    `);
    
    res.json({
      success: true,
      message: 'Product categories retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product categories',
      error: error.message
    });
  }
});

// Product Families API Routes
app.get('/api/product-families', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pf.*,
        pc.name as category_name
      FROM product_families pf
      LEFT JOIN product_categories pc ON pf.category_id = pc.id
      WHERE pf.is_active = true
      ORDER BY pf.name
    `);
    
    res.json({
      success: true,
      message: 'Product families retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching product families:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product families',
      error: error.message
    });
  }
});

// Product Attributes API Routes
app.get('/api/product-attributes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM product_attributes 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `);
    
    res.json({
      success: true,
      message: 'Product attributes retrieved successfully',
      data: result.rows
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

// Product Attribute Options API Routes
app.get('/api/product-attribute-options', async (req, res) => {
  try {
    const { attribute_id } = req.query;
    
    let query = `
      SELECT 
        pao.*,
        pa.name as attribute_name,
        pa.slug as attribute_slug
      FROM product_attribute_options pao
      JOIN product_attributes pa ON pao.attribute_id = pa.id
      WHERE pao.is_active = true
    `;
    
    const params = [];
    if (attribute_id) {
      query += ` AND pao.attribute_id = $1`;
      params.push(attribute_id);
    }
    
    query += ` ORDER BY pao.sort_order, pao.value`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Product attribute options retrieved successfully',
      data: result.rows
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

// Product Attribute Values API Routes
app.get('/api/product-attribute-values', async (req, res) => {
  try {
    const { product_id, attribute_id } = req.query;
    
    let query = `
      SELECT 
        pav.*,
        pa.name as attribute_name,
        pa.slug as attribute_slug,
        pa.type as attribute_type,
        p.name as product_name,
        p.sku as product_sku,
        pao.label as option_label
      FROM product_attribute_values pav
      JOIN product_attributes pa ON pav.attribute_id = pa.id
      JOIN products p ON pav.product_id = p.id
      LEFT JOIN product_attribute_options pao ON pav.option_id = pao.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (product_id) {
      query += ` AND pav.product_id = $${paramIndex}`;
      params.push(product_id);
      paramIndex++;
    }
    
    if (attribute_id) {
      query += ` AND pav.attribute_id = $${paramIndex}`;
      params.push(attribute_id);
      paramIndex++;
    }
    
    query += ` ORDER BY p.name, pa.sort_order`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Product attribute values retrieved successfully',
      data: result.rows
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

// Get all roles - for role management dropdown
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, slug, description, created_at as "createdAt"
      FROM roles
      ORDER BY name
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    });
  }
});

// Update user role - Super Admin only
app.put('/api/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    
    // Check if current user is super admin
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    // Check if current user has super admin privileges
    const currentUserRoles = await pool.query(`
      SELECT r.slug
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `, [currentUser.id]);
    
    const isSuperAdmin = currentUserRoles.rows.some(row => row.slug === 'super-admin');
    
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only Super Admin can change user roles'
      });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Remove existing roles for the user
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      
      // Add new role if provided
      if (roleId) {
        await client.query(`
          INSERT INTO user_roles (user_id, role_id, assigned_at)
          VALUES ($1, $2, NOW())
        `, [id, roleId]);
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
});

// Update user password - restricted based on role
app.put('/api/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password, currentPassword } = req.body;
    
    // Check if user is authenticated
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    // Users can only change their own password unless they're super admin
    const currentUserRoles = await pool.query(`
      SELECT r.slug
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `, [currentUser.id]);
    
    const isSuperAdmin = currentUserRoles.rows.some(row => row.slug === 'super-admin');
    const isOwnPassword = currentUser.id.toString() === id;
    
    if (!isSuperAdmin && !isOwnPassword) {
      return res.status(403).json({
        success: false,
        error: 'You can only change your own password'
      });
    }
    
    // If changing own password, verify current password
    if (isOwnPassword && !isSuperAdmin) {
      const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
      const bcrypt = require('bcrypt');
      const isValid = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
    }
    
    // Hash new password
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, id]
    );
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update password'
    });
  }
});

// Get user profile by ID
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        u.id, u.username, u.email, u.first_name as "firstName", u.last_name as "lastName",
        u.phone, u.address, u.birth_date as "birthDate", u.gender, u.is_active as "isActive", 
        u.email_verified as "emailVerified", u.created_at as "createdAt", u.updated_at as "updatedAt",
        array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) as "role_names",
        array_agg(DISTINCT r.slug) FILTER (WHERE r.slug IS NOT NULL) as "role_slugs",
        bool_or(CASE WHEN r.slug = 'admin' OR r.slug = 'super-admin' THEN true ELSE false END) as "isAdmin"
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.address, u.birth_date, u.gender, u.is_active, u.email_verified, u.created_at, u.updated_at
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// Update user profile
app.put('/api/users/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, address, birthDate, gender } = req.body;
    
    // Check if user is authenticated
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    // Users can only update their own profile unless they're super admin
    const currentUserRoles = await pool.query(`
      SELECT r.slug
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `, [currentUser.id]);
    
    const isSuperAdmin = currentUserRoles.rows.some(row => row.slug === 'super-admin');
    const isOwnProfile = currentUser.id.toString() === id;
    
    if (!isSuperAdmin && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own profile'
      });
    }
    
    // Validate gender value
    const validGenders = ['male', 'female', 'other'];
    const validatedGender = gender && validGenders.includes(gender) ? gender : null;
    
    // Update user profile
    const result = await pool.query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, phone = $3, address = $4, birth_date = $5, gender = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING id, username, email, first_name as "firstName", last_name as "lastName", phone, address, birth_date as "birthDate", gender
    `, [firstName, lastName, phone || null, address || null, birthDate || null, validatedGender, id]);
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
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
