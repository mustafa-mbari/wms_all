A comprehensive Node.js application with PostgreSQL and Knex for user management, role-based access control, product management, and warehouse operations.

## 🚀 Features

- **User Management**: Registration, authentication, profile management
- **Role-based Access Control**: Permissions and roles system
- **Product Management**: Complete product catalog with categories
- **Warehouse Management**: Multi-warehouse support
- **System Logging**: Comprehensive audit trails
- **Notifications**: Multi-channel notification system
- **RESTful API**: Clean and documented API endpoints
- **Database Migrations**: Version-controlled database schema

## 🛠 Technologies

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Knex.js (Query Builder)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd user-management-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb user_management_db

# Or using psql
psql -U postgres -c "CREATE DATABASE user_management_db;"
```

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 5. Run Migrations and Seeds
```bash
# Run database migrations
npm run migrate:latest

# Seed initial data
npm run seed:run
```

### 6. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_management_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 👥 Default Users

After running seeds, these users will be available:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | admin@example.com | admin123 | Super Admin |
| manager | manager@example.com | manager123 | Manager |
| employee | employee@example.com | employee123 | Employee |

## 🔐 API Authentication

### Login Request
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Using Authentication Token
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `POST /logout` - User logout

### Users (`/api/users`)
- `GET /` - Get all users (paginated)
- `GET /:id` - Get user by ID
- `POST /` - Create new user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user
- `PUT /:id/password` - Change user password

### Roles (`/api/roles`)
- `GET /` - Get all roles
- `GET /:id` - Get role by ID
- `POST /` - Create new role
- `PUT /:id` - Update role
- `DELETE /:id` - Delete role

### Products (`/api/products`)
- `GET /` - Get all products
- `GET /:id` - Get product by ID
- `POST /` - Create new product
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product

### System (`/api/system`)
- `GET /settings` - Get system settings
- `PUT /settings` - Update system settings
- `GET /logs` - Get system logs
- `GET /stats` - Get system statistics

## 🛡 Permissions System

### Available Permissions
- **Users**: `users.view`, `users.create`, `users.update`, `users.delete`
- **Roles**: `roles.view`, `roles.create`, `roles.update`, `roles.delete`
- **Products**: `products.view`, `products.create`, `products.update`, `products.delete`
- **Warehouses**: `warehouses.view`, `warehouses.create`, `warehouses.update`, `warehouses.delete`
- **System**: `system.logs.view`, `system.settings.manage`

### Role Hierarchy
1. **Super Admin** - All permissions
2. **Admin** - Most permissions
3. **Manager** - Management level permissions
4. **Employee** - Basic permissions
5. **Viewer** - Read-only access

## 📊 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `roles` - User roles
- `permissions` - System permissions
- `role_permissions` - Role-permission mapping
- `user_roles` - User-role assignments

### Product Management
- `products` - Product catalog
- `product_categories` - Product categorization
- `product_families` - Product grouping
- `product_attributes` - Dynamic product attributes
- `units_of_measure` - Measurement units

### System Tables
- `warehouses` - Warehouse locations
- `system_settings` - Application settings
- `system_logs` - Audit trail
- `notifications` - Notification system

## 🧪 Development

### Available Scripts
```bash
# Start development server
npm run dev

# Run migrations
npm run migrate:latest

# Rollback migrations
npm run migrate:rollback

# Create new migration
npm run migrate:make migration_name

# Run seeds
npm run seed:run

# Start production server
npm start
```

### Database Migrations
```bash
# Create a new migration
npm run migrate:make create_new_table

# Run pending migrations
npm run migrate:latest

# Rollback last migration batch
npm run migrate:rollback

# Rollback all migrations
npm run migrate:rollback --all
```

## 🔍 API Documentation

Visit `http://localhost:3000/api/docs` for complete API documentation.

## 📝 Request/Response Examples

### User Registration
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor application
pm2 monit

# View logs
pm2 logs
```

### Using Docker
```bash
# Build Docker image
docker build -t user-management-system .

# Run container
docker run -p 3000:3000 --env-file .env user-management-system
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- None currently reported

## 📞 Support

For support, please open an issue on the GitHub repository or contact the development team.

## 🔄 Changelog

### v1.0.0
- Initial release
- User management system
- Role-based access control
- Product management
- Warehouse management
- System logging and notifications
- RESTful API with comprehensive documentation