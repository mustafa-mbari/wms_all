const db = require('../config/database');

/**
 * Get all roles
 */
exports.getRoles = async (req, res) => {
  try {
    const roles = await db('roles')
      .select('*')
      .orderBy('name');

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    });
  }
};

/**
 * Get role by ID
 */
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await db('roles')
      .where('id', id)
      .first();

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Get role permissions
    const permissions = await db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', id)
      .select('permissions.*');

    role.permissions = permissions;

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role'
    });
  }
};

/**
 * Create new role
 */
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if role already exists
    const existingRole = await db('roles')
      .where('name', name)
      .first();

    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: 'Role name already exists'
      });
    }

    // Create role
    const [roleId] = await db('roles')
      .insert({
        name,
        description,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('id');

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      const rolePermissions = permissions.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));

      await db('role_permissions').insert(rolePermissions);
    }

    // Fetch the created role with permissions
    const newRole = await db('roles')
      .where('id', roleId)
      .first();

    const rolePermissions = await db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', roleId)
      .select('permissions.*');

    newRole.permissions = rolePermissions;

    res.status(201).json({
      success: true,
      data: newRole
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create role'
    });
  }
};

/**
 * Update role
 */
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role exists
    const existingRole = await db('roles')
      .where('id', id)
      .first();

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if new name conflicts with another role
    if (name && name !== existingRole.name) {
      const nameConflict = await db('roles')
        .where('name', name)
        .where('id', '!=', id)
        .first();

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          error: 'Role name already exists'
        });
      }
    }

    // Update role
    await db('roles')
      .where('id', id)
      .update({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        updated_at: new Date()
      });

    // Update permissions if provided
    if (permissions !== undefined) {
      // Remove existing permissions
      await db('role_permissions')
        .where('role_id', id)
        .del();

      // Add new permissions
      if (permissions.length > 0) {
        const rolePermissions = permissions.map(permissionId => ({
          role_id: id,
          permission_id: permissionId
        }));

        await db('role_permissions').insert(rolePermissions);
      }
    }

    // Fetch updated role with permissions
    const updatedRole = await db('roles')
      .where('id', id)
      .first();

    const rolePermissions = await db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', id)
      .select('permissions.*');

    updatedRole.permissions = rolePermissions;

    res.json({
      success: true,
      data: updatedRole
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    });
  }
};

/**
 * Delete role
 */
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await db('roles')
      .where('id', id)
      .first();

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if role is in use
    const usersWithRole = await db('users')
      .where('role_id', id)
      .count('id as count')
      .first();

    if (parseInt(usersWithRole.count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that is assigned to users'
      });
    }

    // Delete role permissions first
    await db('role_permissions')
      .where('role_id', id)
      .del();

    // Delete role
    await db('roles')
      .where('id', id)
      .del();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete role'
    });
  }
};

/**
 * Get role permissions
 */
exports.getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await db('roles')
      .where('id', id)
      .first();

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Get role permissions
    const permissions = await db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', id)
      .select('permissions.*');

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role permissions'
    });
  }
};

/**
 * Update role permissions
 */
exports.updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    // Check if role exists
    const role = await db('roles')
      .where('id', id)
      .first();

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Remove existing permissions
    await db('role_permissions')
      .where('role_id', id)
      .del();

    // Add new permissions
    if (permissions && permissions.length > 0) {
      const rolePermissions = permissions.map(permissionId => ({
        role_id: id,
        permission_id: permissionId
      }));

      await db('role_permissions').insert(rolePermissions);
    }

    // Fetch updated permissions
    const updatedPermissions = await db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', id)
      .select('permissions.*');

    res.json({
      success: true,
      data: updatedPermissions
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role permissions'
    });
  }
};

/**
 * Get users with specific role
 */
exports.getRoleUsers = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await db('roles')
      .where('id', id)
      .first();

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Get users with this role
    const users = await db('users')
      .where('role_id', id)
      .select('id', 'username', 'email', 'full_name', 'is_active', 'created_at');

    res.json({
      success: true,
      data: {
        role: role,
        users: users
      }
    });
  } catch (error) {
    console.error('Error fetching role users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role users'
    });
  }
};
