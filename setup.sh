#!/bin/bash

echo "🚀 Setting up User Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js (v16 or higher) and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version $NODE_VERSION is not supported. Please install Node.js v16 or higher."
    exit 1
fi

print_status "Node.js version $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed or not in PATH."
    print_info "Please install PostgreSQL and make sure it's running before proceeding."
fi

# Create project directory structure
print_info "Creating project directory structure..."

mkdir -p config middleware controllers routes models services utils public tests
mkdir -p migrations seeds

print_status "Directory structure created"

# Install npm dependencies
print_info "Installing npm dependencies..."

if npm install; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create .env file from example
if [ ! -f .env ]; then
    print_info "Creating .env file from example..."
    cp .env.example .env
    print_status ".env file created"
    print_warning "Please edit .env file with your database credentials"
else
    print_info ".env file already exists"
fi

# Create database (optional)
read -p "Do you want to create the PostgreSQL database? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database name (default: user_management_db): " DB_NAME
    DB_NAME=${DB_NAME:-user_management_db}
    
    if createdb "$DB_NAME" 2>/dev/null; then
        print_status "Database '$DB_NAME' created successfully"
    else
        print_warning "Failed to create database or database already exists"
    fi
fi

# Run migrations
read -p "Do you want to run database migrations now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Running database migrations..."
    if npm run migrate:latest; then
        print_status "Migrations completed successfully"
    else
        print_error "Migration failed. Please check your database connection."
        exit 1
    fi
fi

# Run seeds
read -p "Do you want to run database seeds now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Running database seeds..."
    if npm run seed:run; then
        print_status "Seeds completed successfully"
    else
        print_error "Seeding failed. Please check the migration status."
        exit 1
    fi
fi

echo
print_status "Setup completed successfully!"
echo
print_info "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Run 'npm run migrate:latest' if you haven't run migrations yet"
echo "3. Run 'npm run seed:run' if you haven't run seeds yet"
echo "4. Start the development server with 'npm run dev'"
echo
print_info "Default admin credentials:"
echo "Email: admin@example.com"
echo "Password: admin123"
echo
print_info "API Documentation: http://localhost:3000/api/docs"
print_info "Health Check: http://localhost:3000/health"
echo
print_status "Happy coding! 🎉"