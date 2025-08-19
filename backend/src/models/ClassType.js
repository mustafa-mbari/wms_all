const BaseModel = require('./BaseModel');

class ClassType extends BaseModel {
  constructor() {
    super('class_types');
  }

  // Find by name
  async findByName(name) {
    return await this.knex(this.tableName)
      .where('name', name)
      .first();
  }

  // Check if name is unique
  async isNameUnique(name, excludeId = null) {
    let query = this.knex(this.tableName).where('name', name);
    
    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }
    
    const existing = await query.first();
    return !existing;
  }

  // Get all active class types ordered by name
  async getActiveOrdered() {
    return await this.knex(this.tableName)
      .where('is_active', true)
      .orderBy('name')
      .select('*');
  }

  // Search class types
  async search(searchTerm) {
    return await super.search(['name', 'description'], searchTerm);
  }

  // Get usage count (how many products use this class type)
  async getUsageCount(id) {
    const result = await this.knex('products')
      .where('class_type_id', id)
      .count('id as count')
      .first();
    
    return parseInt(result.count);
  }

  // Get class types with usage statistics
  async getAllWithUsage() {
    return await this.knex(this.tableName)
      .leftJoin('products', 'class_types.id', 'products.class_type_id')
      .select('class_types.*')
      .count('products.id as usage_count')
      .groupBy('class_types.id')
      .orderBy('class_types.name');
  }
}

module.exports = ClassType;
