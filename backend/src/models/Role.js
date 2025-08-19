const BaseModel = require('./BaseModel');

class Role extends BaseModel {
  constructor() {
    super('roles');
  }

  // Find role by slug
  async findBySlug(slug) {
    return await this.knex(this.tableName)
      .where('slug', slug)
      .first();
  }

  // Get role with permissions
  async findWithPermissions(id) {
    const role = await this.findById(id);
    if (!role) return null;

    const permissions = await this.knex('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', id)
      .select('permissions.*');

    return {
      ...role,
      permissions
    };
  }

  // Assign permissions to role
  async assignPermissions(roleId, permissionIds) {
    // Remove existing permissions
    await this.knex('role_permissions')
      .where('role_id', roleId)
      .del();

    // Add new permissions
    if (permissionIds && permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));

      return await this.knex('role_permissions').insert(rolePermissions);
    }
  }

  // Get users with this role
  async getUsers(id) {
    return await this.knex('users')
      .join('user_roles', 'users.id', 'user_roles.user_id')
      .where('user_roles.role_id', id)
      .select('users.*');
  }

  // Check if role has permission
  async hasPermission(roleId, permissionSlug) {
    const result = await this.knex('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', roleId)
      .where('permissions.slug', permissionSlug)
      .first();

    return !!result;
  }

  // Get all roles with permission counts
  async getAllWithPermissionCounts() {
    return await this.knex(this.tableName)
      .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
      .select('roles.*')
      .count('role_permissions.permission_id as permission_count')
      .groupBy('roles.id')
      .orderBy('roles.name');
  }

  // Search roles
  async search(searchTerm) {
    return await super.search(['name', 'slug', 'description'], searchTerm);
  }
}

module.exports = Role;
