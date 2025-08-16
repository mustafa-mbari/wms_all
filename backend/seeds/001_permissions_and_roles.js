exports.seed = async function(knex) {
  // Clear existing entries
  await knex('role_permissions').del();
  await knex('user_roles').del();
  await knex('roles').del();
  await knex('permissions').del();

  // Insert permissions
  const permissions = await knex('permissions').insert([
    // User Management
    { name: 'View Users', slug: 'users.view', description: 'Can view users list', module: 'users' },
    { name: 'Create Users', slug: 'users.create', description: 'Can create new users', module: 'users' },
    { name: 'Update Users', slug: 'users.update', description: 'Can update user information', module: 'users' },
    { name: 'Delete Users', slug: 'users.delete', description: 'Can delete users', module: 'users' },
    
    // Role Management
    { name: 'View Roles', slug: 'roles.view', description: 'Can view roles list', module: 'roles' },
    { name: 'Create Roles', slug: 'roles.create', description: 'Can create new roles', module: 'roles' },
    { name: 'Update Roles', slug: 'roles.update', description: 'Can update role information', module: 'roles' },
    { name: 'Delete Roles', slug: 'roles.delete', description: 'Can delete roles', module: 'roles' },
    
    // Product Management
    { name: 'View Products', slug: 'products.view', description: 'Can view products list', module: 'products' },
    { name: 'Create Products', slug: 'products.create', description: 'Can create new products', module: 'products' },
    { name: 'Update Products', slug: 'products.update', description: 'Can update product information', module: 'products' },
    { name: 'Delete Products', slug: 'products.delete', description: 'Can delete products', module: 'products' },
    
    // Warehouse Management
    { name: 'View Warehouses', slug: 'warehouses.view', description: 'Can view warehouses list', module: 'warehouses' },
    { name: 'Create Warehouses', slug: 'warehouses.create', description: 'Can create new warehouses', module: 'warehouses' },
    { name: 'Update Warehouses', slug: 'warehouses.update', description: 'Can update warehouse information', module: 'warehouses' },
    { name: 'Delete Warehouses', slug: 'warehouses.delete', description: 'Can delete warehouses', module: 'warehouses' },
    
    // System Management
    { name: 'View System Logs', slug: 'system.logs.view', description: 'Can view system logs', module: 'system' },
    { name: 'Manage Settings', slug: 'system.settings.manage', description: 'Can manage system settings', module: 'system' },
    { name: 'Send Notifications', slug: 'notifications.send', description: 'Can send notifications', module: 'notifications' },
    { name: 'View All Notifications', slug: 'notifications.view.all', description: 'Can view all notifications', module: 'notifications' },
  ]).returning('id');

  // Insert roles
  const roles = await knex('roles').insert([
    { name: 'Super Admin', slug: 'super-admin', description: 'Full system access' },
    { name: 'Admin', slug: 'admin', description: 'Administrative access' },
    { name: 'Manager', slug: 'manager', description: 'Management level access' },
    { name: 'Employee', slug: 'employee', description: 'Basic employee access' },
    { name: 'Viewer', slug: 'viewer', description: 'Read-only access' }
  ]).returning('id');

  // Get permission and role IDs
  const allPermissions = await knex('permissions').select('id', 'slug');
  const allRoles = await knex('roles').select('id', 'slug');

  const getPermissionId = (slug) => allPermissions.find(p => p.slug === slug)?.id;
  const getRoleId = (slug) => allRoles.find(r => r.slug === slug)?.id;

  // Assign permissions to roles
  const rolePermissions = [];

  // Super Admin - All permissions
  allPermissions.forEach(permission => {
    rolePermissions.push({
      role_id: getRoleId('super-admin'),
      permission_id: permission.id
    });
  });

  // Admin - Most permissions except super admin specific
  const adminPermissions = [
    'users.view', 'users.create', 'users.update',
    'roles.view', 'products.view', 'products.create', 'products.update', 'products.delete',
    'warehouses.view', 'warehouses.create', 'warehouses.update',
    'system.logs.view', 'notifications.send', 'notifications.view.all'
  ];
  adminPermissions.forEach(slug => {
    const permId = getPermissionId(slug);
    if (permId) {
      rolePermissions.push({
        role_id: getRoleId('admin'),
        permission_id: permId
      });
    }
  });

  // Manager - Management level permissions
  const managerPermissions = [
    'users.view', 'products.view', 'products.create', 'products.update',
    'warehouses.view', 'warehouses.update', 'notifications.send'
  ];
  managerPermissions.forEach(slug => {
    const permId = getPermissionId(slug);
    if (permId) {
      rolePermissions.push({
        role_id: getRoleId('manager'),
        permission_id: permId
      });
    }
  });

  // Employee - Basic permissions
  const employeePermissions = [
    'users.view', 'products.view', 'warehouses.view'
  ];
  employeePermissions.forEach(slug => {
    const permId = getPermissionId(slug);
    if (permId) {
      rolePermissions.push({
        role_id: getRoleId('employee'),
        permission_id: permId
      });
    }
  });

  // Viewer - Read-only permissions
  const viewerPermissions = [
    'users.view', 'products.view', 'warehouses.view'
  ];
  viewerPermissions.forEach(slug => {
    const permId = getPermissionId(slug);
    if (permId) {
      rolePermissions.push({
        role_id: getRoleId('viewer'),
        permission_id: permId
      });
    }
  });

  // Insert role permissions
  if (rolePermissions.length > 0) {
    await knex('role_permissions').insert(rolePermissions);
  }
};