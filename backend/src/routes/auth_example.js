// Example: Using shared constants in backend routes
const express = require('express');
// Import from shared (this would work after proper setup)
// import { API_ROUTES, HTTP_STATUS } from '../../../shared/constants/index.js';
// import { loginSchema } from '../../../shared/validation/index.js';

const router = express.Router();

// Example route using shared constants
router.post('/login', async (req, res) => {
  try {
    // Use shared validation schema
    // const { username, password } = loginSchema.parse(req.body);
    
    // Business logic here...
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { /* user data */ }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
