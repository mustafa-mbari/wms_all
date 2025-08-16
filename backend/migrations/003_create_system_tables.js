exports.up = function(knex) {
  return knex.schema
    // Create system_settings table
    .createTable('system_settings', table => {
      table.increments('id').primary();
      table.string('key', 100).notNullable().unique();
      table.text('value');
      table.string('type', 20).defaultTo('string'); // string, number, boolean, json
      table.text('description');
      table.string('group', 50); // For grouping settings
      table.boolean('is_public').defaultTo(false); // Can be accessed without auth
      table.boolean('is_editable').defaultTo(true);
      table.timestamps(true, true);
    })

    // Create system_logs table
    .createTable('system_logs', table => {
      table.increments('id').primary();
      table.string('level', 20).notNullable(); // info, warning, error, debug
      table.string('action', 100).notNullable();
      table.text('message').notNullable();
      table.json('context'); // Additional context data
      table.integer('user_id').unsigned();
      table.string('ip_address', 45);
      table.string('user_agent', 500);
      table.string('module', 50);
      table.string('entity_type', 50); // users, products, etc.
      table.integer('entity_id').unsigned();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.index(['level', 'created_at']);
      table.index(['user_id', 'created_at']);
      table.index(['entity_type', 'entity_id']);
    })

    // Create notifications table
    .createTable('notifications', table => {
      table.increments('id').primary();
      table.string('type', 50).notNullable(); // email, sms, push, system
      table.string('title', 200).notNullable();
      table.text('message').notNullable();
      table.json('data'); // Additional notification data
      table.integer('user_id').unsigned();
      table.string('email', 255); // For email notifications
      table.string('phone', 20); // For SMS notifications
      table.enum('status', ['pending', 'sent', 'delivered', 'failed', 'read']).defaultTo('pending');
      table.timestamp('sent_at');
      table.timestamp('read_at');
      table.integer('retry_count').defaultTo(0);
      table.text('error_message');
      table.string('priority', 10).defaultTo('normal'); // low, normal, high, urgent
      table.json('metadata'); // Provider-specific data
      table.timestamps(true, true);
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.index(['user_id', 'status']);
      table.index(['type', 'status']);
      table.index(['created_at', 'priority']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('notifications')
    .dropTableIfExists('system_logs')
    .dropTableIfExists('system_settings');
};