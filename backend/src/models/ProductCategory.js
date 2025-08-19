const BaseModel = require('./BaseModel');

class ProductCategory extends BaseModel {
  constructor() {
    super('product_categories');
  }

  // Find by slug
  async findBySlug(slug) {
    return await this.knex(this.tableName)
      .where('slug', slug)
      .first();
  }

  // Check if slug is unique
  async isSlugUnique(slug, excludeId = null) {
    let query = this.knex(this.tableName).where('slug', slug);
    
    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }
    
    const existing = await query.first();
    return !existing;
  }

  // Get category tree (parent-child structure)
  async getTree() {
    const categories = await this.getActive();
    return this.buildTree(categories);
  }

  // Helper to build tree structure
  buildTree(categories, parentId = null) {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(cat => ({
        ...cat,
        children: this.buildTree(categories, cat.id)
      }));
  }

  // Get all children of a category
  async getChildren(parentId) {
    return await this.knex(this.tableName)
      .where('parent_id', parentId)
      .where('is_active', true)
      .orderBy('sort_order')
      .select('*');
  }

  // Get category path (breadcrumb)
  async getCategoryPath(id) {
    const category = await this.findById(id);
    if (!category) return [];

    const path = [category];
    let currentCategory = category;

    while (currentCategory.parent_id) {
      currentCategory = await this.findById(currentCategory.parent_id);
      if (currentCategory) {
        path.unshift(currentCategory);
      }
    }

    return path;
  }

  // Get products count for category
  async getProductCount(id, includeSubcategories = false) {
    let query = this.knex('products').where('category_id', id);
    
    if (includeSubcategories) {
      const subcategoryIds = await this.getAllSubcategoryIds(id);
      if (subcategoryIds.length > 0) {
        query = query.orWhereIn('category_id', subcategoryIds);
      }
    }
    
    const result = await query.count('id as count').first();
    return parseInt(result.count);
  }

  // Get all subcategory IDs recursively
  async getAllSubcategoryIds(parentId) {
    const children = await this.getChildren(parentId);
    let ids = children.map(child => child.id);
    
    for (const child of children) {
      const grandchildren = await this.getAllSubcategoryIds(child.id);
      ids = ids.concat(grandchildren);
    }
    
    return ids;
  }

  // Get root categories (no parent)
  async getRootCategories() {
    return await this.knex(this.tableName)
      .whereNull('parent_id')
      .where('is_active', true)
      .orderBy('sort_order')
      .select('*');
  }

  // Update sort order
  async updateSortOrder(id, sortOrder) {
    return await this.knex(this.tableName)
      .where('id', id)
      .update({
        sort_order: sortOrder,
        updated_at: this.knex.fn.now()
      });
  }

  // Move category to new parent
  async moveToParent(id, newParentId) {
    // Check if new parent is not a descendant
    if (newParentId) {
      const path = await this.getCategoryPath(newParentId);
      if (path.some(cat => cat.id === id)) {
        throw new Error('Cannot move category to its own descendant');
      }
    }

    return await this.knex(this.tableName)
      .where('id', id)
      .update({
        parent_id: newParentId,
        updated_at: this.knex.fn.now()
      });
  }

  // Search categories
  async search(searchTerm) {
    return await super.search(['name', 'slug', 'description'], searchTerm);
  }

  // Get categories with product counts
  async getAllWithProductCounts() {
    return await this.knex(this.tableName)
      .leftJoin('products', 'product_categories.id', 'products.category_id')
      .select('product_categories.*')
      .count('products.id as product_count')
      .groupBy('product_categories.id')
      .orderBy('product_categories.name');
  }
}

module.exports = ProductCategory;
