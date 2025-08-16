const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');

// Import middleware
const { validate, userSchemas } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', 
  validate(userSchemas.register),
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login',
  validate(userSchemas.login),
  authController.login
);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile',
  verifyToken,
  authController.getProfile
);

/**
 * @route POST /api/auth/logout
 * @desc User logout
 * @access Private
 */
router.post('/logout',
  verifyToken,
  authController.logout
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh',
  verifyToken,
  (req, res) => {
    try {
      const jwt = require('jsonwebtoken');
      const newToken = jwt.sign(
        { userId: req.user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token: newToken }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password',
  verifyToken,
  validate(userSchemas.changePassword),
  async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const db = require('../config/database');
      const { current_password, new_password } = req.body;

      // Get current user
      const user = await db('users')
        .select('password_hash')
        .where('id', req.user.id)
        .first();

      // Verify current password
      const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 10;
      const new_password_hash = await bcrypt.hash(new_password, saltRounds);

      // Update password
      await db('users')
        .where('id', req.user.id)
        .update({
          password_hash: new_password_hash,
          updated_at: db.fn.now()
        });

      // Log password change
      await db('system_logs').insert({
        level: 'info',
        action: 'password_changed',
        message: `User changed password: ${req.user.email}`,
        user_id: req.user.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        module: 'auth',
        entity_type: 'users',
        entity_id: req.user.id
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const crypto = require('crypto');
    const db = require('../config/database');
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name')
      .where('email', email)
      .where('is_active', true)
      .first();

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await db('users')
      .where('id', user.id)
      .update({
        reset_token: resetToken,
        reset_token_expires_at: resetTokenExpires,
        updated_at: db.fn.now()
      });

    // Log password reset request
    await db('system_logs').insert({
      level: 'info',
      action: 'password_reset_requested',
      message: `Password reset requested for: ${email}`,
      user_id: user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'auth',
      entity_type: 'users',
      entity_id: user.id
    });

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await emailService.sendPasswordResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // Include token in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using token
 * @access Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const db = require('../config/database');
    const { token, new_password } = req.body;

    // Validate input
    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by reset token
    const user = await db('users')
      .select('id', 'email', 'reset_token_expires_at')
      .where('reset_token', token)
      .where('is_active', true)
      .first();

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // Update password and clear reset token
    await db('users')
      .where('id', user.id)
      .update({
        password_hash,
        reset_token: null,
        reset_token_expires_at: null,
        updated_at: db.fn.now()
      });

    // Log password reset
    await db('system_logs').insert({
      level: 'info',
      action: 'password_reset_completed',
      message: `Password reset completed for: ${user.email}`,
      user_id: user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      module: 'auth',
      entity_type: 'users',
      entity_id: user.id
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;