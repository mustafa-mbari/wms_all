# WarehousePro - Monorepo

A full-stack warehouse management system built with TypeScript, Express.js, React, and PostgreSQL.

## 📁 Project Structure

```
/WarehousePro
├── /backend                 # Express.js API Server
│   ├── /src
│   │   ├── /config         # Database configuration
│   │   ├── /controllers    # Business logic
│   │   ├── /middleware     # Authentication & validation
│   │   ├── /models         # Database models
│   │   ├── /routes         # API endpoints
│   │   └── /utils          # Backend utilities
│   ├── /migrations         # Database migrations
│   ├── /seeds              # Database seeders
│   ├── server.js           # Main server file
│   ├── knexfile.js         # Knex configuration
│   └── package.json
├── /frontend               # React Frontend
│   ├── /client             # Vite + React app
│   ├── /src                # Source code
│   └── package.json
├── /shared                 # Shared code between frontend & backend
│   ├── /types              # TypeScript type definitions
│   ├── /constants          # API routes, status codes, etc.
│   ├── /utils              # Utility functions
│   ├── /validation         # Zod validation schemas
│   └── package.json
└── package.json            # Root package.json with workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm 8+

### Installation

1. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   
   # Frontend environment  
   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with your API URL
   ```

3. **Set up the database**
   ```bash
   # Run migrations
   npm run migrate
   
   # Seed the database
   npm run seed
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run dev:backend  # Backend on http://localhost:3000
   npm run dev:frontend # Frontend on http://localhost:5173
   ```

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all packages
- `npm run start` - Start both frontend and backend in production mode
- `npm run install:all` - Install dependencies for all packages
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database

### Backend
- `npm run dev:backend` - Start backend in development mode
- `npm run start:backend` - Start backend in production mode

### Frontend
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production

## 📚 Usage Examples

### Using Shared Types and Constants

**Frontend (React + TypeScript)**
```typescript
// frontend/src/hooks/useUsers.ts
import { User, ApiResponse, UserQuery } from '../../../shared/types';
import { API_ROUTES } from '../../../shared/constants';

export const useUsers = () => {
  const fetchUsers = async (query: UserQuery): Promise<ApiResponse<User[]>> => {
    const response = await fetch(`${API_ROUTES.USERS.BASE}?${new URLSearchParams(query)}`);
    return response.json();
  };
  
  // ...rest of the hook
};
```

**Backend (Express.js + CommonJS)**
```javascript
// backend/src/controllers/userController.js
const { API_ROUTES, HTTP_STATUS } = require('../../../shared/constants');

exports.getUsers = async (req, res) => {
  try {
    // Business logic here...
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message
    });
  }
};
```

## 🏗️ Architecture

### Backend Architecture
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Knex.js** - Query builder and migrations
- **JWT** - Authentication
- **Joi** - Input validation

### Frontend Architecture
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Query** - Data fetching

### Shared Architecture
- **TypeScript** - Type definitions
- **Zod** - Runtime validation
- **Utility functions** - Common helpers

## 📝 Development Guidelines

1. **Shared Code**: Place common types, constants, and utilities in `/shared`
2. **Import Paths**: Use relative paths like `../../../shared/types`
3. **Type Safety**: Use TypeScript throughout the application
4. **Validation**: Use Zod schemas from shared for validation
5. **API Routes**: Define all API routes in shared constants
6. **Error Handling**: Use consistent error response format

## 📄 License

MIT License - see LICENSE file for details
