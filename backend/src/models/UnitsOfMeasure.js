const BaseModel = require('./BaseModel');

class UnitsOfMeasure extends BaseModel {
  constructor() {
    super('units_of_measure');
  }

  // Find by symbol
  async findBySymbol(symbol) {
    return await this.knex(this.tableName)
      .where('symbol', symbol)
      .first();
  }

  // Find by name
  async findByName(name) {
    return await this.knex(this.tableName)
      .where('name', name)
      .first();
  }

  // Check if name or symbol is unique
  async isUnique(name, symbol, excludeId = null) {
    let query = this.knex(this.tableName)
      .where('name', name)
      .orWhere('symbol', symbol);
    
    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }
    
    const existing = await query.first();
    return !existing;
  }

  // Get all active units ordered by name
  async getActiveOrdered() {
    return await this.knex(this.tableName)
      .where('is_active', true)
      .orderBy('name')
      .select('*');
  }

  // Search units of measure
  async search(searchTerm) {
    return await super.search(['name', 'symbol', 'description'], searchTerm);
  }

  // Get usage count (how many products use this unit)
  async getUsageCount(id) {
    const result = await this.knex('products')
      .where('unit_id', id)
      .count('id as count')
      .first();
    
    return parseInt(result.count);
  }

  // Get units with usage statistics
  async getAllWithUsage() {
    return await this.knex(this.tableName)
      .leftJoin('products', 'units_of_measure.id', 'products.unit_id')
      .select('units_of_measure.*')
      .count('products.id as usage_count')
      .groupBy('units_of_measure.id')
      .orderBy('units_of_measure.name');
  }
}

module.exports = UnitsOfMeasure;
