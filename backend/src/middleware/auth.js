const jwt = require('jsonwebtoken');
const db = require('../config/database');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await db('users')
        .select('id', 'username', 'email', 'is_active')
        .where('id', decoded.userId)
        .first();

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not active'
      });
    }

    req.user = { userId: user.id, ...user };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userPermissions = await db('users')
          .select('permissions.slug')
          .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
          .leftJoin('roles', 'user_roles.role_id', 'roles.id')
          .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
          .leftJoin('permissions', 'role_permissions.permission_id', 'permissions.id')
          .where('users.id', req.user.userId);

      const hasPermission = userPermissions.some(p => p.slug === permission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

const hasRole = (role) => {
  return async (req, res, next) => {
    try {
      const userRoles = await db('users')
          .select('roles.slug')
          .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
          .leftJoin('roles', 'user_roles.role_id', 'roles.id')
          .where('users.id', req.user.userId);

      const hasRole = userRoles.some(r => r.slug === role);

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient role.'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
};

module.exports = {
  verifyToken,
  hasPermission,
  hasRole
};