const BaseModel = require('./BaseModel');

class Product extends BaseModel {
  constructor() {
    super('products');
  }

  // Find product by SKU
  async findBySku(sku) {
    return await this.knex(this.tableName)
      .where('sku', sku)
      .first();
  }

  // Find product by barcode
  async findByBarcode(barcode) {
    return await this.knex(this.tableName)
      .where('barcode', barcode)
      .first();
  }

  // Check if SKU is unique
  async isSkuUnique(sku, excludeId = null) {
    let query = this.knex(this.tableName).where('sku', sku);
    
    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }
    
    const existing = await query.first();
    return !existing;
  }

  // Check if barcode is unique
  async isBarcodeUnique(barcode, excludeId = null) {
    if (!barcode) return true; // Barcode is optional
    
    let query = this.knex(this.tableName).where('barcode', barcode);
    
    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }
    
    const existing = await query.first();
    return !existing;
  }

  // Get products with all relations
  async findAllWithRelations(filters = {}) {
    let query = this.knex(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .leftJoin('product_families', 'products.family_id', 'product_families.id')
      .leftJoin('units_of_measure', 'products.unit_id', 'units_of_measure.id')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_categories.slug as category_slug',
        'product_families.name as family_name',
        'units_of_measure.name as unit_name',
        'units_of_measure.symbol as unit_symbol'
      );

    // Apply filters
    if (filters.category_id) {
      query = query.where('products.category_id', filters.category_id);
    }
    if (filters.family_id) {
      query = query.where('products.family_id', filters.family_id);
    }
    if (filters.status) {
      query = query.where('products.status', filters.status);
    }
    if (filters.min_price) {
      query = query.where('products.price', '>=', filters.min_price);
    }
    if (filters.max_price) {
      query = query.where('products.price', '<=', filters.max_price);
    }

    return await query.orderBy('products.created_at', 'desc');
  }

  // Get product with relations by ID
  async findWithRelations(id) {
    return await this.knex(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .leftJoin('product_families', 'products.family_id', 'product_families.id')
      .leftJoin('units_of_measure', 'products.unit_id', 'units_of_measure.id')
      .where('products.id', id)
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_categories.slug as category_slug',
        'product_families.name as family_name',
        'units_of_measure.name as unit_name',
        'units_of_measure.symbol as unit_symbol'
      )
      .first();
  }

  // Get low stock products
  async getLowStock() {
    return await this.knex(this.tableName)
      .whereRaw('stock_quantity <= min_stock_level')
      .where('track_stock', true)
      .where('status', 'active')
      .select('*')
      .orderBy('stock_quantity');
  }

  // Update stock quantity
  async updateStock(id, quantity, operation = 'set') {
    const product = await this.findById(id);
    if (!product) throw new Error('Product not found');

    let newQuantity;
    if (operation === 'add') {
      newQuantity = product.stock_quantity + quantity;
    } else if (operation === 'subtract') {
      newQuantity = Math.max(0, product.stock_quantity - quantity);
    } else {
      newQuantity = quantity;
    }

    return await this.knex(this.tableName)
      .where('id', id)
      .update({
        stock_quantity: newQuantity,
        updated_at: this.knex.fn.now()
      });
  }

  // Search products
  async search(searchTerm, filters = {}) {
    let query = this.knex(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .leftJoin('product_families', 'products.family_id', 'product_families.id')
      .where(function() {
        this.where('products.name', 'like', `%${searchTerm}%`)
            .orWhere('products.sku', 'like', `%${searchTerm}%`)
            .orWhere('products.barcode', 'like', `%${searchTerm}%`)
            .orWhere('products.description', 'like', `%${searchTerm}%`)
            .orWhere('products.short_description', 'like', `%${searchTerm}%`);
      });

    // Apply additional filters
    if (filters.category_id) {
      query = query.where('products.category_id', filters.category_id);
    }
    if (filters.family_id) {
      query = query.where('products.family_id', filters.family_id);
    }
    if (filters.status) {
      query = query.where('products.status', filters.status);
    }
    if (filters.min_price) {
      query = query.where('products.price', '>=', filters.min_price);
    }
    if (filters.max_price) {
      query = query.where('products.price', '<=', filters.max_price);
    }

    return await query.select(
      'products.*',
      'product_categories.name as category_name',
      'product_families.name as family_name'
    );
  }

  // Get products by category
  async getByCategory(categoryId) {
    return await this.knex(this.tableName)
      .where('category_id', categoryId)
      .where('status', 'active')
      .orderBy('name');
  }

  // Get products by family
  async getByFamily(familyId) {
    return await this.knex(this.tableName)
      .where('family_id', familyId)
      .where('status', 'active')
      .orderBy('name');
  }

  // Get active products
  async getActive() {
    return await this.knex(this.tableName)
      .where('status', 'active')
      .orderBy('name');
  }

  // Update product status
  async updateStatus(id, status) {
    const validStatuses = ['active', 'inactive', 'discontinued'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    return await this.knex(this.tableName)
      .where('id', id)
      .update({
        status,
        updated_at: this.knex.fn.now()
      });
  }

  // Get products with inventory value
  async getInventoryValue() {
    return await this.knex(this.tableName)
      .select(
        'id',
        'name',
        'sku',
        'stock_quantity',
        'cost',
        this.knex.raw('stock_quantity * cost as inventory_value')
      )
      .where('track_stock', true)
      .orderBy('inventory_value', 'desc');
  }

  // Get total inventory value
  async getTotalInventoryValue() {
    const result = await this.knex(this.tableName)
      .sum(this.knex.raw('stock_quantity * cost as total_value'))
      .where('track_stock', true)
      .where('status', 'active')
      .first();
    
    return parseFloat(result.total_value) || 0;
  }

  // Bulk update prices
  async bulkUpdatePrices(updates) {
    const trx = await this.knex.transaction();
    
    try {
      for (const update of updates) {
        await trx(this.tableName)
          .where('id', update.id)
          .update({
            price: update.price,
            cost: update.cost,
            updated_at: this.knex.fn.now()
          });
      }
      
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = Product;
