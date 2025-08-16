const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Register new user
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      phone,
      address,
      birth_date,
      gender
    } = req.body;

    // Check if user already exists
    const existingUser = await db('users')
      .where('email', email)
      .orWhere('username', username)
      .first();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [newUser] = await db('users')
      .insert({
        username,
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        address,
        birth_date,
        gender,
        is_active: true
      })
      .returning([
        'id', 'username', 'email', 'first_name', 'last_name', 
        'phone', 'address', 'birth_date', 'gender', 'is_active', 'created_at'
      ]);

    // Assign default role (employee)
    const defaultRole = await db('roles').where('slug', 'employee').first();
    if (defaultRole) {
      await db('user_roles').insert({
        user_id: newUser.id,
        role_id: defaultRole.id,
        assigned_by: newUser.id
      });
    }

    // Generate token
    const token = generateToken(newUser.id);

    // Log registration
    await db('system_logs').insert({
      level: 'info',
      action: 'user_registered',
      message: `New user registered: ${email}`,
      user_id: newUser.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'auth',
      entity_type: 'users',
      entity_id: newUser.id
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with roles and permissions
    const user = await db('users')
      .select(
        'users.*',
        db.raw('array_agg(DISTINCT roles.name) as role_names'),
        db.raw('array_agg(DISTINCT roles.slug) as role_slugs'),
        db.raw('array_agg(DISTINCT permissions.slug) as permission_slugs')
      )
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
      .leftJoin('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('users.email', email)
      .where('users.is_active', true)
      .groupBy('users.id')
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await db('users')
      .where('id', user.id)
      .update({ last_login_at: db.fn.now() });

    // Generate token
    const token = generateToken(user.id);

    // Clean up null values from arrays
    user.role_names = user.role_names.filter(name => name !== null);
    user.role_slugs = user.role_slugs.filter(slug => slug !== null);
    user.permission_slugs = user.permission_slugs.filter(slug => slug !== null);

    // Remove sensitive data
    delete user.password_hash;
    delete user.reset_token;
    delete user.reset_token_expires_at;

    // Log login
    await db('system_logs').insert({
      level: 'info',
      action: 'user_login',
      message: `User logged in: ${email}`,
      user_id: user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'auth',
      entity_type: 'users',
      entity_id: user.id
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db('users')
      .select(
        'users.id', 'users.username', 'users.email', 'users.first_name', 
        'users.last_name', 'users.phone', 'users.address', 'users.birth_date',
        'users.gender', 'users.avatar_url', 'users.is_active', 
        'users.email_verified', 'users.last_login_at', 'users.created_at',
        db.raw('array_agg(DISTINCT roles.name) as role_names'),
        db.raw('array_agg(DISTINCT roles.slug) as role_slugs'),
        db.raw('array_agg(DISTINCT permissions.slug) as permission_slugs')
      )
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
      .leftJoin('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('users.id', userId)
      .groupBy('users.id')
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clean up null values from arrays
    user.role_names = user.role_names.filter(name => name !== null);
    user.role_slugs = user.role_slugs.filter(slug => slug !== null);
    user.permission_slugs = user.permission_slugs.filter(slug => slug !== null);

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout (client-side token invalidation)
const logout = async (req, res) => {
  try {
    // Log logout
    await db('system_logs').insert({
      level: 'info',
      action: 'user_logout',
      message: `User logged out: ${req.user.email}`,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'auth',
      entity_type: 'users',
      entity_id: req.user.id
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout
};