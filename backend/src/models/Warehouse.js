const BaseModel = require('./BaseModel');

class Warehouse extends BaseModel {
  constructor() {
    super('warehouses');
  }

  // Find by code
  async findByCode(code) {
    return await this.knex(this.tableName)
      .where('code', code)
      .first();
  }

  // Check if code is unique
  async isCodeUnique(code, excludeId = null) {
    let query = this.knex(this.tableName).where('code', code);
    
    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }
    
    const existing = await query.first();
    return !existing;
  }

  // Get warehouse with manager info
  async findWithManager(id) {
    return await this.knex(this.tableName)
      .leftJoin('users', 'warehouses.manager_id', 'users.id')
      .where('warehouses.id', id)
      .select(
        'warehouses.*',
        'users.first_name as manager_first_name',
        'users.last_name as manager_last_name',
        'users.email as manager_email'
      )
      .first();
  }

  // Get all warehouses with manager info
  async getAllWithManagers() {
    return await this.knex(this.tableName)
      .leftJoin('users', 'warehouses.manager_id', 'users.id')
      .select(
        'warehouses.*',
        'users.first_name as manager_first_name',
        'users.last_name as manager_last_name',
        'users.email as manager_email'
      )
      .orderBy('warehouses.name');
  }

  // Get warehouses by country
  async getByCountry(country) {
    return await this.knex(this.tableName)
      .where('country', country)
      .where('is_active', true)
      .orderBy('name');
  }

  // Get warehouses by city
  async getByCity(city) {
    return await this.knex(this.tableName)
      .where('city', city)
      .where('is_active', true)
      .orderBy('name');
  }

  // Search warehouses
  async search(searchTerm) {
    return await super.search(['name', 'code', 'city', 'state', 'country'], searchTerm);
  }

  // Get inventory count for warehouse
  async getInventoryCount(id) {
    const result = await this.knex('inventory')
      .where('warehouse_id', id)
      .count('id as count')
      .first();
    
    return parseInt(result.count);
  }

  // Get total inventory value for warehouse
  async getTotalInventoryValue(id) {
    const result = await this.knex('inventory')
      .join('products', 'inventory.product_id', 'products.id')
      .where('inventory.warehouse_id', id)
      .sum(this.knex.raw('inventory.quantity * products.cost_price as total_value'))
      .first();
    
    return parseFloat(result.total_value) || 0;
  }

  // Set manager
  async setManager(warehouseId, managerId) {
    return await this.knex(this.tableName)
      .where('id', warehouseId)
      .update({
        manager_id: managerId,
        updated_at: this.knex.fn.now()
      });
  }

  // Remove manager
  async removeManager(warehouseId) {
    return await this.knex(this.tableName)
      .where('id', warehouseId)
      .update({
        manager_id: null,
        updated_at: this.knex.fn.now()
      });
  }
}

module.exports = Warehouse;
