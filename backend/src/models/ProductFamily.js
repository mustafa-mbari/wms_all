const BaseModel = require('./BaseModel');

class ProductFamily extends BaseModel {
  constructor() {
    super('product_families');
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

  // Get family with category info
  async findWithCategory(id) {
    return await this.knex(this.tableName)
      .leftJoin('product_categories', 'product_families.category_id', 'product_categories.id')
      .where('product_families.id', id)
      .select(
        'product_families.*',
        'product_categories.name as category_name',
        'product_categories.slug as category_slug'
      )
      .first();
  }

  // Get all families with category info
  async getAllWithCategories() {
    return await this.knex(this.tableName)
      .leftJoin('product_categories', 'product_families.category_id', 'product_categories.id')
      .select(
        'product_families.*',
        'product_categories.name as category_name',
        'product_categories.slug as category_slug'
      )
      .orderBy('product_families.name');
  }

  // Get families by category
  async getByCategory(categoryId) {
    return await this.knex(this.tableName)
      .where('category_id', categoryId)
      .where('is_active', true)
      .orderBy('name');
  }

  // Get products count for family
  async getProductCount(id) {
    const result = await this.knex('products')
      .where('family_id', id)
      .count('id as count')
      .first();
    
    return parseInt(result.count);
  }

  // Search families
  async search(searchTerm) {
    return await super.search(['name', 'description'], searchTerm);
  }

  // Get families with product counts
  async getAllWithProductCounts() {
    return await this.knex(this.tableName)
      .leftJoin('products', 'product_families.id', 'products.family_id')
      .leftJoin('product_categories', 'product_families.category_id', 'product_categories.id')
      .select(
        'product_families.*',
        'product_categories.name as category_name'
      )
      .count('products.id as product_count')
      .groupBy('product_families.id', 'product_categories.id')
      .orderBy('product_families.name');
  }

  // Assign to category
  async assignToCategory(familyId, categoryId) {
    return await this.knex(this.tableName)
      .where('id', familyId)
      .update({
        category_id: categoryId,
        updated_at: this.knex.fn.now()
      });
  }

  // Remove from category
  async removeFromCategory(familyId) {
    return await this.knex(this.tableName)
      .where('id', familyId)
      .update({
        category_id: null,
        updated_at: this.knex.fn.now()
      });
  }

  // Get all active families ordered by name
  async getActiveOrdered() {
    return await this.knex(this.tableName)
      .where('is_active', true)
      .orderBy('name')
      .select('*');
  }
}

module.exports = ProductFamily;
