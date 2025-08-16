const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Get all users with pagination and filtering
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    let query = db('users')
      .select(
        'users.id', 'users.username', 'users.email', 'users.first_name',
        'users.last_name', 'users.phone', 'users.is_active', 
        'users.email_verified', 'users.last_login_at', 'users.created_at',
        db.raw('array_agg(DISTINCT roles.name) as role_names'),
        db.raw('array_agg(DISTINCT roles.slug) as role_slugs')
      )
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .groupBy('users.id');

    // Apply search filter
    if (search) {
      query = query.where(function() {
        this.where('users.username', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`)
          .orWhere(db.raw("CONCAT(users.first_name, ' ', users.last_name)"), 'ilike', `%${search}%`);
      });
    }

    // Apply status filter
    if (status !== '') {
      query = query.where('users.is_active', status === 'true');
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().clearGroup().count('users.id as count').first();
    const { count: totalCount } = await countQuery;

    // Apply role filter (after getting count)
    if (role) {
      query = query.having(db.raw('array_to_string(array_agg(DISTINCT roles.slug), \',\')'), 'like', `%${role}%`);
    }

    // Apply pagination and ordering
    const users = await query
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Clean up null values from role arrays
    users.forEach(user => {
      user.role_names = user.role_names.filter(name => name !== null);
      user.role_slugs = user.role_slugs.filter(slug => slug !== null);
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: parseInt(totalCount),
          per_page: limit,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users')
      .select(
        'users.id', 'users.username', 'users.email', 'users.first_name',
        'users.last_name', 'users.phone', 'users.address', 'users.birth_date',
        'users.gender', 'users.avatar_url', 'users.is_active',
        'users.email_verified', 'users.last_login_at', 'users.created_at',
        db.raw('array_agg(DISTINCT roles.name) as role_names'),
        db.raw('array_agg(DISTINCT roles.slug) as role_slugs'),
        db.raw('array_agg(DISTINCT roles.id) as role_ids')
      )
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.id', id)
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
    user.role_ids = user.role_ids.filter(id => id !== null);

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new user
const createUser = async (req, res) => {
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
      gender,
      roles = []
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

    // Create user in transaction
    const result = await db.transaction(async (trx) => {
      // Insert user
      const [newUser] = await trx('users')
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

      // Assign roles if provided
      if (roles.length > 0) {
        const roleAssignments = roles.map(roleId => ({
          user_id: newUser.id,
          role_id: roleId,
          assigned_by: req.user.id
        }));

        await trx('user_roles').insert(roleAssignments);
      } else {
        // Assign default role (employee)
        const defaultRole = await trx('roles').where('slug', 'employee').first();
        if (defaultRole) {
          await trx('user_roles').insert({
            user_id: newUser.id,
            role_id: defaultRole.id,
            assigned_by: req.user.id
          });
        }
      }

      return newUser;
    });

    // Log user creation
    await db('system_logs').insert({
      level: 'info',
      action: 'user_created',
      message: `User created: ${email}`,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'users',
      entity_type: 'users',
      entity_id: result.id
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: result }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.password_hash;
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    // Check if user exists
    const existingUser = await db('users').where('id', id).first();
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate email/username (excluding current user)
    if (updateData.email || updateData.username) {
      const duplicateCheck = db('users').where('id', '!=', id);
      
      if (updateData.email) {
        duplicateCheck.andWhere('email', updateData.email);
      }
      if (updateData.username) {
        duplicateCheck.orWhere('username', updateData.username);
      }

      const duplicate = await duplicateCheck.first();
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: duplicate.email === updateData.email 
            ? 'Email already in use' 
            : 'Username already taken'
        });
      }
    }

    // Update user
    updateData.updated_at = db.fn.now();
    
    const [updatedUser] = await db('users')
      .where('id', id)
      .update(updateData)
      .returning([
        'id', 'username', 'email', 'first_name', 'last_name',
        'phone', 'address', 'birth_date', 'gender', 'is_active', 'updated_at'
      ]);

    // Log user update
    await db('system_logs').insert({
      level: 'info',
      action: 'user_updated',
      message: `User updated: ${existingUser.email}`,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'users',
      entity_type: 'users',
      entity_id: id,
      context: { updated_fields: Object.keys(updateData) }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete user (soft delete by deactivating)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await db('users').where('id', id).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by deactivating
    await db('users')
      .where('id', id)
      .update({
        is_active: false,
        updated_at: db.fn.now()
      });

    // Log user deletion
    await db('system_logs').insert({
      level: 'info',
      action: 'user_deleted',
      message: `User deleted: ${user.email}`,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'users',
      entity_type: 'users',
      entity_id: id
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change user password (admin action)
const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Check if user exists
    const user = await db('users').where('id', id).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db('users')
      .where('id', id)
      .update({
        password_hash,
        updated_at: db.fn.now()
      });

    // Log password change
    await db('system_logs').insert({
      level: 'info',
      action: 'user_password_changed_by_admin',
      message: `Password changed for user: ${user.email} by admin: ${req.user.email}`,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'users',
      entity_type: 'users',
      entity_id: id
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user roles
const updateUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_ids } = req.body;

    if (!Array.isArray(role_ids)) {
      return res.status(400).json({
        success: false,
        message: 'role_ids must be an array'
      });
    }

    // Check if user exists
    const user = await db('users').where('id', id).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate role IDs
    if (role_ids.length > 0) {
      const existingRoles = await db('roles')
        .whereIn('id', role_ids)
        .where('is_active', true);
      
      if (existingRoles.length !== role_ids.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more invalid role IDs provided'
        });
      }
    }

    // Update roles in transaction
    await db.transaction(async (trx) => {
      // Remove existing roles
      await trx('user_roles').where('user_id', id).del();

      // Add new roles
      if (role_ids.length > 0) {
        const roleAssignments = role_ids.map(roleId => ({
          user_id: parseInt(id),
          role_id: roleId,
          assigned_by: req.user.id
        }));

        await trx('user_roles').insert(roleAssignments);
      }
    });

    // Log role update
    await db('system_logs').insert({
      level: 'info',
      action: 'user_roles_updated',
      message: `Roles updated for user: ${user.email}`,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'users',
      entity_type: 'users',
      entity_id: id,
      context: { new_role_ids: role_ids }
    });

    res.json({
      success: true,
      message: 'User roles updated successfully'
    });

  } catch (error) {
    console.error('Update user roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user roles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user permissions
const getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users')
      .select(
        'users.id', 'users.username', 'users.email',
        db.raw('array_agg(DISTINCT roles.name) as role_names'),
        db.raw('array_agg(DISTINCT permissions.slug) as permission_slugs'),
        db.raw('array_agg(DISTINCT permissions.name) as permission_names')
      )
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
      .leftJoin('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('users.id', id)
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
    user.permission_slugs = user.permission_slugs.filter(slug => slug !== null);
    user.permission_names = user.permission_names.filter(name => name !== null);

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users').where('id', id).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await db('users')
      .where('id', id)
      .update({
        is_active: true,
        updated_at: db.fn.now()
      });

    // Log user activation
    await db('system_logs').insert({
      level: 'info',
      action: 'user_activated',
      message: `User activated: ${user.email}`,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'users',
      entity_type: 'users',
      entity_id: id
    });

    res.json({
      success: true,
      message: 'User activated successfully'
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Deactivate user
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users').where('id', id).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deactivation
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    await db('users')
      .where('id', id)
      .update({
        is_active: false,
        updated_at: db.fn.now()
      });

    // Log user deactivation
    await db('system_logs').insert({
      level: 'info',
      action: 'user_deactivated',
      message: `User deactivated: ${user.email}`,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'users',
      entity_type: 'users',
      entity_id: id
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { term } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!term || term.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters long'
      });
    }

    const users = await db('users')
      .select(
        'users.id', 'users.username', 'users.email', 
        'users.first_name', 'users.last_name', 'users.is_active'
      )
      .where(function() {
        this.where('users.username', 'ilike', `%${term}%`)
          .orWhere('users.email', 'ilike', `%${term}%`)
          .orWhere(db.raw("CONCAT(users.first_name, ' ', users.last_name)"), 'ilike', `%${term}%`);
      })
      .limit(limit)
      .orderBy('users.first_name');

    res.json({
      success: true,
      data: { users, count: users.length }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total users
      db('users').count('id as count').first(),
      // Active users
      db('users').where('is_active', true).count('id as count').first(),
      // Users registered today
      db('users')
        .where(db.raw('DATE(created_at) = CURRENT_DATE'))
        .count('id as count')
        .first(),
      // Users registered this month
      db('users')
        .where(db.raw('EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)'))
        .where(db.raw('EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)'))
        .count('id as count')
        .first(),
      // User roles distribution
      db('user_roles')
        .select('roles.name as role_name')
        .count('user_roles.id as count')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .groupBy('roles.name')
        .orderBy('count', 'desc')
    ]);

    const [
      totalUsers,
      activeUsers,
      todayRegistrations,
      monthlyRegistrations,
      roleDistribution
    ] = stats;

    res.json({
      success: true,
      data: {
        total_users: parseInt(totalUsers.count),
        active_users: parseInt(activeUsers.count),
        inactive_users: parseInt(totalUsers.count) - parseInt(activeUsers.count),
        today_registrations: parseInt(todayRegistrations.count),
        monthly_registrations: parseInt(monthlyRegistrations.count),
        role_distribution: roleDistribution.map(item => ({
          role: item.role_name,
          count: parseInt(item.count)
        }))
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  updateUserRoles,
  getUserPermissions,
  activateUser,
  deactivateUser,
  searchUsers,
  getUserStats
};