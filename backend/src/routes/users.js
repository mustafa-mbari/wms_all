const express = require('express');
const router = express.Router();

// Import controllers
const usersController = require('../controllers/usersController');

// Import middleware
const { validate, userSchemas } = require('../middleware/validation');
const { hasPermission } = require('../middleware/auth');

/**
 * @route GET /api/users
 * @desc Get all users with pagination and filtering
 * @access Private (requires users.view permission)
 */
router.get('/',
  hasPermission('users.view'),
  usersController.getUsers
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (requires users.view permission)
 */
router.get('/:id',
  hasPermission('users.view'),
  usersController.getUserById
);

/**
 * @route POST /api/users
 * @desc Create new user
 * @access Private (requires users.create permission)
 */
router.post('/',
  hasPermission('users.create'),
  validate(userSchemas.register),
  usersController.createUser
);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private (requires users.update permission)
 */
router.put('/:id',
  hasPermission('users.update'),
  validate(userSchemas.update),
  usersController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private (requires users.delete permission)
 */
router.delete('/:id',
  hasPermission('users.delete'),
  usersController.deleteUser
);

/**
 * @route PUT /api/users/:id/password
 * @desc Change user password (admin)
 * @access Private (requires users.update permission)
 */
router.put('/:id/password',
  hasPermission('users.update'),
  usersController.changeUserPassword
);

/**
 * @route PUT /api/users/:id/roles
 * @desc Update user roles
 * @access Private (requires users.update permission)
 */
router.put('/:id/roles',
  hasPermission('users.update'),
  usersController.updateUserRoles
);

/**
 * @route GET /api/users/:id/permissions
 * @desc Get user permissions
 * @access Private (requires users.view permission)
 */
router.get('/:id/permissions',
  hasPermission('users.view'),
  usersController.getUserPermissions
);

/**
 * @route PUT /api/users/:id/activate
 * @desc Activate user
 * @access Private (requires users.update permission)
 */
router.put('/:id/activate',
  hasPermission('users.update'),
  usersController.activateUser
);

/**
 * @route PUT /api/users/:id/deactivate
 * @desc Deactivate user
 * @access Private (requires users.update permission)
 */
router.put('/:id/deactivate',
  hasPermission('users.update'),
  usersController.deactivateUser
);

/**
 * @route GET /api/users/search/:term
 * @desc Search users
 * @access Private (requires users.view permission)
 */
router.get('/search/:term',
  hasPermission('users.view'),
  usersController.searchUsers
);

/**
 * @route GET /api/users/stats/overview
 * @desc Get user statistics
 * @access Private (requires users.view permission)
 */
router.get('/stats/overview',
  hasPermission('users.view'),
  usersController.getUserStats
);

module.exports = router;