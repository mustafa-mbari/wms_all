const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear existing entries (except permissions and roles)
  await knex('user_roles').del();
  await knex('users').del();
  await knex('units_of_measure').del();
  await knex('product_categories').del();
  await knex('product_families').del();
  await knex('class_types').del();
  await knex('system_settings').del();

  // Insert default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const users = await knex('users').insert([
    {
      username: 'admin',
      email: 'admin@example.com',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      phone: '+1234567890',
      is_active: true,
      email_verified: true,
      email_verified_at: knex.fn.now()
    },
    {
      username: 'manager',
      email: 'manager@example.com',
      password_hash: await bcrypt.hash('manager123', 10),
      first_name: 'John',
      last_name: 'Manager',
      phone: '+1234567891',
      is_active: true,
      email_verified: true,
      email_verified_at: knex.fn.now()
    },
    {
      username: 'employee',
      email: 'employee@example.com',
      password_hash: await bcrypt.hash('employee123', 10),
      first_name: 'Jane',
      last_name: 'Employee',
      phone: '+1234567892',
      is_active: true,
      email_verified: true,
      email_verified_at: knex.fn.now()
    },
    {
      username: 'mustafa',
      email: 'mustafa3mhk@gmail.com',
      password_hash: await bcrypt.hash('mhk123', 10),
      first_name: 'Mustafa',
      last_name: 'Mbari',
      phone: '+4915563266600',
      is_active: true,
      email_verified: true,
      email_verified_at: knex.fn.now()
    }
  ]).returning('id');

  // Get role IDs
  const superAdminRole = await knex('roles').where('slug', 'super-admin').first();
  const managerRole = await knex('roles').where('slug', 'manager').first();
  const employeeRole = await knex('roles').where('slug', 'employee').first();

  // Assign roles to users
  await knex('user_roles').insert([
    { user_id: users[0].id || users[0], role_id: superAdminRole.id, assigned_by: users[0].id || users[0] },
    { user_id: users[1].id || users[1], role_id: managerRole.id, assigned_by: users[0].id || users[0] },
    { user_id: users[2].id || users[2], role_id: employeeRole.id, assigned_by: users[0].id || users[0] },
    { user_id: users[3].id || users[3], role_id: superAdminRole.id, assigned_by: users[0].id || users[0] }
  ]);

  // Insert units of measure
  await knex('units_of_measure').insert([
    { name: 'Piece', symbol: 'pcs', description: 'Individual items' },
    { name: 'Kilogram', symbol: 'kg', description: 'Weight measurement' },
    { name: 'Gram', symbol: 'g', description: 'Weight measurement' },
    { name: 'Liter', symbol: 'L', description: 'Volume measurement' },
    { name: 'Milliliter', symbol: 'ml', description: 'Volume measurement' },
    { name: 'Meter', symbol: 'm', description: 'Length measurement' },
    { name: 'Centimeter', symbol: 'cm', description: 'Length measurement' },
    { name: 'Box', symbol: 'box', description: 'Package unit' },
    { name: 'Carton', symbol: 'ctn', description: 'Package unit' },
    { name: 'Dozen', symbol: 'dz', description: 'Set of 12 items' }
  ]);

  // Insert class types
  await knex('class_types').insert([
    { name: 'Standard Product', description: 'Regular physical products' },
    { name: 'Digital Product', description: 'Digital/downloadable products' },
    { name: 'Service', description: 'Service-based products' },
    { name: 'Bundle', description: 'Product bundles or sets' },
    { name: 'Subscription', description: 'Recurring subscription products' }
  ]);

  // Insert product categories
  const categories = await knex('product_categories').insert([
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Home and garden products' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports and outdoor equipment' },
    { name: 'EDEKA & Drinks', slug: 'edeka-drinks', description: 'Drinks products by EDEKA' },
    { name: 'Books & Media', slug: 'books-media', description: 'Books, movies, and media' },
    { name: 'Food & Beverage', slug: 'food-beverage', description: 'Food and drink products' }
    
  ]).returning('id');

  // Insert subcategories
  await knex('product_categories').insert([
    { name: 'Smartphones', slug: 'smartphones', parent_id: categories[0].id || categories[0], description: 'Mobile phones and accessories' },
    { name: 'Laptops', slug: 'laptops', parent_id: categories[0].id || categories[0], description: 'Laptop computers' },
    { name: 'Mens Clothing', slug: 'mens-clothing', parent_id: categories[1].id || categories[1], description: 'Clothing for men' },
    { name: 'Womens Clothing', slug: 'womens-clothing', parent_id: categories[1].id || categories[1], description: 'Clothing for women' },
    { name: 'Water Bottles', slug: 'water-bottles', parent_id: categories[4].id || categories[4], description: 'Water bottles and hydration products' }
  ]);

  // Insert product families
  await knex('product_families').insert([
    { name: 'Consumer Electronics', description: 'Consumer electronic devices', category_id: categories[0].id || categories[0] },
    { name: 'Fashion Apparel', description: 'Fashion and clothing items', category_id: categories[1].id || categories[1] },
    { name: 'Home Essentials', description: 'Essential home products', category_id: categories[2].id || categories[2] },
    { name: 'Fitness Equipment', description: 'Exercise and fitness gear', category_id: categories[3].id || categories[3] },
    { name: 'Beverages', description: 'Drinks and beverages', category_id: categories[6].id || categories[6] }
  ]);

  // Insert system settings
  await knex('system_settings').insert([
    { key: 'app_name', value: 'User Management System', type: 'string', description: 'Application name', group: 'general', is_public: true },
    { key: 'app_version', value: '1.0.0', type: 'string', description: 'Application version', group: 'general', is_public: true },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Enable maintenance mode', group: 'system' },
    { key: 'max_login_attempts', value: '5', type: 'number', description: 'Maximum login attempts before lockout', group: 'security' },
    { key: 'session_timeout', value: '3600', type: 'number', description: 'Session timeout in seconds', group: 'security' },
    { key: 'email_notifications', value: 'true', type: 'boolean', description: 'Enable email notifications', group: 'notifications', is_public: false },
    { key: 'default_currency', value: 'USD', type: 'string', description: 'Default system currency', group: 'general', is_public: true },
    { key: 'timezone', value: 'UTC', type: 'string', description: 'System timezone', group: 'general', is_public: true }
  ]);
};