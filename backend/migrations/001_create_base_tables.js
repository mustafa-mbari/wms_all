exports.up = function(knex) {
  return knex.schema
    // Create units_of_measure table
    .createTable('units_of_measure', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.string('symbol', 10).notNullable();
      table.text('description');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // Create class_types table
    .createTable('class_types', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.text('description');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // Create permissions table
    .createTable('permissions', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.string('slug', 100).notNullable().unique();
      table.text('description');
      table.string('module', 50);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // Create roles table
    .createTable('roles', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.string('slug', 100).notNullable().unique();
      table.text('description');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // Create role_permissions table
    .createTable('role_permissions', table => {
      table.increments('id').primary();
      table.integer('role_id').unsigned().notNullable();
      table.integer('permission_id').unsigned().notNullable();
      table.timestamps(true, true);
      
      table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
      table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
      table.unique(['role_id', 'permission_id']);
    })

    // Create users table
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('username', 50).notNullable().unique();
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('phone', 20);
      table.text('address');
      table.date('birth_date');
      table.enum('gender', ['male', 'female', 'other']);
      table.string('avatar_url', 255);
      table.boolean('is_active').defaultTo(true);
      table.boolean('email_verified').defaultTo(false);
      table.timestamp('email_verified_at');
      table.timestamp('last_login_at');
      table.string('reset_token', 255);
      table.timestamp('reset_token_expires_at');
      table.timestamps(true, true);
    })

    // Create user_roles table
    .createTable('user_roles', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('role_id').unsigned().notNullable();
      table.timestamp('assigned_at').defaultTo(knex.fn.now());
      table.integer('assigned_by').unsigned();
      table.timestamps(true, true);
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
      table.foreign('assigned_by').references('id').inTable('users').onDelete('SET NULL');
      table.unique(['user_id', 'role_id']);
    })

    // Create warehouses table
    .createTable('warehouses', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('code', 20).notNullable().unique();
      table.text('address');
      table.string('city', 100);
      table.string('state', 100);
      table.string('country', 100);
      table.string('postal_code', 20);
      table.string('phone', 20);
      table.string('email', 255);
      table.integer('manager_id').unsigned();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      
      table.foreign('manager_id').references('id').inTable('users').onDelete('SET NULL');
    })

    // Create product_categories table
    .createTable('product_categories', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('slug', 100).notNullable().unique();
      table.text('description');
      table.integer('parent_id').unsigned();
      table.string('image_url', 255);
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      
      table.foreign('parent_id').references('id').inTable('product_categories').onDelete('SET NULL');
    })

    // Create product_families table
    .createTable('product_families', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.text('description');
      table.integer('category_id').unsigned();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      
      table.foreign('category_id').references('id').inTable('product_categories').onDelete('SET NULL');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('product_families')
    .dropTableIfExists('product_categories')
    .dropTableIfExists('warehouses')
    .dropTableIfExists('user_roles')
    .dropTableIfExists('users')
    .dropTableIfExists('role_permissions')
    .dropTableIfExists('roles')
    .dropTableIfExists('permissions')
    .dropTableIfExists('class_types')
    .dropTableIfExists('units_of_measure');
};