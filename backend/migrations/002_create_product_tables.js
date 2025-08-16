exports.up = function(knex) {
  return knex.schema
    // Create products table
    .createTable('products', table => {
      table.increments('id').primary();
      table.string('name', 200).notNullable();
      table.string('sku', 100).notNullable().unique();
      table.string('barcode', 100).unique();
      table.text('description');
      table.text('short_description');
      table.integer('category_id').unsigned();
      table.integer('family_id').unsigned();
      table.integer('unit_id').unsigned();
      table.decimal('price', 12, 2).defaultTo(0);
      table.decimal('cost', 12, 2).defaultTo(0);
      table.integer('stock_quantity').defaultTo(0);
      table.integer('min_stock_level').defaultTo(0);
      table.decimal('weight', 8, 3);
      table.decimal('length', 8, 2);
      table.decimal('width', 8, 2);
      table.decimal('height', 8, 2);
      table.string('status', 20).defaultTo('active');
      table.boolean('is_digital').defaultTo(false);
      table.boolean('track_stock').defaultTo(true);
      table.string('image_url', 255);
      table.json('images'); // Array of image URLs
      table.json('tags'); // Array of tags
      table.timestamps(true, true);
      
      table.foreign('category_id').references('id').inTable('product_categories').onDelete('SET NULL');
      table.foreign('family_id').references('id').inTable('product_families').onDelete('SET NULL');
      table.foreign('unit_id').references('id').inTable('units_of_measure').onDelete('SET NULL');
      
      table.index(['sku', 'status']);
      table.index(['category_id', 'status']);
    })

    // Create product_attributes table
    .createTable('product_attributes', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('slug', 100).notNullable().unique();
      table.enum('type', ['text', 'number', 'boolean', 'select', 'multiselect', 'date']).notNullable();
      table.text('description');
      table.boolean('is_required').defaultTo(false);
      table.boolean('is_filterable').defaultTo(false);
      table.boolean('is_searchable').defaultTo(false);
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // Create product_attribute_options table
    .createTable('product_attribute_options', table => {
      table.increments('id').primary();
      table.integer('attribute_id').unsigned().notNullable();
      table.string('value', 200).notNullable();
      table.string('label', 200).notNullable();
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      
      table.foreign('attribute_id').references('id').inTable('product_attributes').onDelete('CASCADE');
      table.unique(['attribute_id', 'value']);
    })

    // Create product_attribute_values table
    .createTable('product_attribute_values', table => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().notNullable();
      table.integer('attribute_id').unsigned().notNullable();
      table.text('value');
      table.integer('option_id').unsigned(); // For select/multiselect attributes
      table.timestamps(true, true);
      
      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.foreign('attribute_id').references('id').inTable('product_attributes').onDelete('CASCADE');
      table.foreign('option_id').references('id').inTable('product_attribute_options').onDelete('SET NULL');
      table.unique(['product_id', 'attribute_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('product_attribute_values')
    .dropTableIfExists('product_attribute_options')
    .dropTableIfExists('product_attributes')
    .dropTableIfExists('products');
};