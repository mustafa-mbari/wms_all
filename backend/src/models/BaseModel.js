const knex = require('../config/database');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.knex = knex;
  }

  // Get all records
  async findAll(filters = {}) {
    let query = this.knex(this.tableName);
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        query = query.where(key, filters[key]);
      }
    });
    
    return await query.select('*').orderBy('created_at', 'desc');
  }

  // Get single record by ID
  async findById(id) {
    return await this.knex(this.tableName)
      .where('id', id)
      .first();
  }

  // Create new record
  async create(data) {
    const [result] = await this.knex(this.tableName)
      .insert(data)
      .returning('*');
    return result;
  }

  // Update record
  async update(id, data) {
    const [result] = await this.knex(this.tableName)
      .where('id', id)
      .update({
        ...data,
        updated_at: this.knex.fn.now()
      })
      .returning('*');
    return result;
  }

  // Delete record
  async delete(id) {
    return await this.knex(this.tableName)
      .where('id', id)
      .del();
  }

  // Soft delete (if using is_active field)
  async softDelete(id) {
    return await this.update(id, { is_active: false });
  }

  // Get paginated results
  async paginate(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = this.knex(this.tableName);
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        query = query.where(key, filters[key]);
      }
    });
    
    const total = await query.clone().count('id as count').first();
    const data = await query.limit(limit).offset(offset).select('*');
    
    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(parseInt(total.count) / limit)
      }
    };
  }

  // Get active records (for tables with is_active field)
  async getActive() {
    return await this.knex(this.tableName)
      .where('is_active', true)
      .select('*')
      .orderBy('created_at', 'desc');
  }

  // Search records
  async search(searchFields, searchTerm) {
    let query = this.knex(this.tableName);
    
    query = query.where(function() {
      searchFields.forEach((field, index) => {
        if (index === 0) {
          this.where(field, 'like', `%${searchTerm}%`);
        } else {
          this.orWhere(field, 'like', `%${searchTerm}%`);
        }
      });
    });
    
    return await query.select('*');
  }
}

module.exports = BaseModel;
