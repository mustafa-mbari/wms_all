const express = require('express');
const router = express.Router();

// Import controllers
const rolesController = require('../controllers/rolesController');

// Import middleware
const { validate, roleSchemas } = require('../middleware/validation');
const { hasPermission } = require('../middleware/auth');

/**
 * @route GET /api/roles
 * @desc Get all roles
 * @access Private (requires roles.view permission)
 */
router.get('/',
  hasPermission('roles.view'),
  rolesController.getRoles
);

/**
 * @route GET /api/roles/:id
 * @desc Get role by ID
 * @access Private (requires roles.view permission)
 */
router.get('/:id',
  hasPermission('roles.view'),
  rolesController.getRoleById
);

/**
 * @route POST /api/roles
 * @desc Create new role
 * @access Private (requires roles.create permission)
 */
router.post('/',
  hasPermission('roles.create'),
  validate(roleSchemas.create),
  rolesController.createRole
);

/**
 * @route PUT /api/roles/:id
 * @desc Update role
 * @access Private (requires roles.update permission)
 */
router.put('/:id',
  hasPermission('roles.update'),
  validate(roleSchemas.update),
  rolesController.updateRole
);

/**
 * @route DELETE /api/roles/:id
 * @desc Delete role
 * @access Private (requires roles.delete permission)
 */
router.delete('/:id',
  hasPermission('roles.delete'),
  rolesController.deleteRole
);

/**
 * @route GET /api/roles/:id/permissions
 * @desc Get role permissions
 * @access Private (requires roles.view permission)
 */
router.get('/:id/permissions',
  hasPermission('roles.view'),
  rolesController.getRolePermissions
);

/**
 * @route PUT /api/roles/:id/permissions
 * @desc Update role permissions
 * @access Private (requires roles.update permission)
 */
router.put('/:id/permissions',
  hasPermission('roles.update'),
  rolesController.updateRolePermissions
);

/**
 * @route GET /api/roles/:id/users
 * @desc Get users with specific role
 * @access Private (requires roles.view permission)
 */
router.get('/:id/users',
  hasPermission('roles.view'),
  rolesController.getRoleUsers
);

module.exports = router;