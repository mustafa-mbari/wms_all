const BaseModel = require('./BaseModel');

class Permission extends BaseModel {
  constructor() {
    super('permissions');
  }

  // Find permission by slug
  async findBySlug(slug) {
    return await this.knex(this.tableName)
      .where('slug', slug)
      .first();
  }

  // Get permissions by module
  async getByModule(module) {
    return await this.knex(this.tableName)
      .where('module', module)
      .where('is_active', true)
      .orderBy('name');
  }

  // Get all modules
  async getModules() {
    const result = await this.knex(this.tableName)
      .distinct('module')
      .whereNotNull('module')
      .orderBy('module');
    
    return result.map(row => row.module);
  }

  // Get permissions grouped by module
  async getGroupedByModule() {
    const permissions = await this.getActive();
    const grouped = {};

    permissions.forEach(permission => {
      const module = permission.module || 'General';
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(permission);
    });

    return grouped;
  }

  // Get roles that have this permission
  async getRoles(id) {
    return await this.knex('roles')
      .join('role_permissions', 'roles.id', 'role_permissions.role_id')
      .where('role_permissions.permission_id', id)
      .select('roles.*');
  }

  // Search permissions
  async search(searchTerm) {
    return await super.search(['name', 'slug', 'description', 'module'], searchTerm);
  }

  // Check if permission exists by slug
  async existsBySlug(slug, excludeId = null) {
    let query = this.knex(this.tableName).where('slug', slug);
    
    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }
    
    const permission = await query.first();
    return !!permission;
  }
}

module.exports = Permission;
