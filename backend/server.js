require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./src/utils/logger');

// Import database for connection check
const db = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const roleRoutes = require('./src/routes/roles');
const productRoutes = require('./src/routes/products');
const warehouseRoutes = require('./src/routes/warehouses');
const systemRoutes = require('./src/routes/system');

// Import middleware
const { verifyToken } = require('./src/middleware/auth');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com']
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Static files (optional simple frontend)
app.use(express.static('public'));

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const healthCheck = {
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      server: 'healthy'
    }
  };

  try {
    // Check database connection
    await db.raw('SELECT 1');
    healthCheck.checks.database = 'healthy';
  } catch (error) {
    healthCheck.success = false;
    healthCheck.checks.database = 'unhealthy';
    healthCheck.error = error.message;
    return res.status(503).json(healthCheck);
  }

  res.json(healthCheck);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/roles', verifyToken, roleRoutes);
app.use('/api/products', verifyToken, productRoutes);
app.use('/api/warehouses', verifyToken, warehouseRoutes);
app.use('/api/system', verifyToken, systemRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to User Management System API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      products: '/api/products',
      warehouses: '/api/warehouses',
      system: '/api/system'
    }
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/login': 'User login',
        'GET /api/auth/profile': 'Get current user profile',
        'POST /api/auth/logout': 'User logout'
      },
      users: {
        'GET /api/users': 'Get all users (paginated)',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user',
        'PUT /api/users/:id/password': 'Change user password'
      },
      roles: {
        'GET /api/roles': 'Get all roles',
        'GET /api/roles/:id': 'Get role by ID',
        'POST /api/roles': 'Create new role',
        'PUT /api/roles/:id': 'Update role',
        'DELETE /api/roles/:id': 'Delete role'
      },
      products: {
        'GET /api/products': 'Get all products',
        'GET /api/products/:id': 'Get product by ID',
        'POST /api/products': 'Create new product',
        'PUT /api/products/:id': 'Update product',
        'DELETE /api/products/:id': 'Delete product'
      },
      warehouses: {
        'GET /api/warehouses': 'Get all warehouses',
        'GET /api/warehouses/:id': 'Get warehouse by ID',
        'POST /api/warehouses': 'Create new warehouse',
        'PUT /api/warehouses/:id': 'Update warehouse',
        'DELETE /api/warehouses/:id': 'Delete warehouse'
      },
      system: {
        'GET /api/system/settings': 'Get system settings',
        'PUT /api/system/settings': 'Update system settings',
        'GET /api/system/logs': 'Get system logs',
        'GET /api/system/stats': 'Get system statistics'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Database connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed'
    });
  }

  // JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Database connection check
async function checkDatabaseConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Start server with database check
async function startServer() {
  try {
    // Check database connection first
    await checkDatabaseConnection();

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`💻 Health Check: http://localhost:${PORT}/health`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });

    // Enhanced graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('🔴 HTTP server closed.');

        try {
          await db.destroy(); // Close database connections
          console.log('🗄️ Database connections closed.');
        } catch (error) {
          console.error('❌ Error closing database:', error.message);
        }

        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('🚨 Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Process signal handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
startServer();

module.exports = app;