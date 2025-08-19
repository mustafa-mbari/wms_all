/**
 * Usage Examples for the Model Classes
 * 
 * This file shows how to use the model classes in your application
 */

const { Product, User, Role, Permission, UnitsOfMeasure, ProductCategory } = require('./models');

// Example usage in async functions
async function exampleUsage() {
  
  // === BASIC CRUD OPERATIONS ===
  
  // Create new instances
  const userModel = new User();
  const productModel = new Product();
  const roleModel = new Role();
  
  try {
    // 1. CREATE - Add new user
    const newUser = await userModel.create({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'securepassword123',
      first_name: 'John',
      last_name: 'Doe'
    });
    console.log('Created user:', newUser);

    // 2. READ - Get all users
    const allUsers = await userModel.findAll();
    console.log('All users:', allUsers);

    // 3. READ - Get user by ID
    const user = await userModel.findById(1);
    console.log('User by ID:', user);

    // 4. READ - Get user with roles
    const userWithRoles = await userModel.findWithRoles(1);
    console.log('User with roles:', userWithRoles);

    // 5. UPDATE - Update user
    const updatedUser = await userModel.update(1, {
      first_name: 'John Updated',
      phone: '+1234567890'
    });
    console.log('Updated user:', updatedUser);

    // 6. DELETE - Delete user
    await userModel.delete(1);
    console.log('User deleted');

    // === ADVANCED OPERATIONS ===

    // Search users
    const searchResults = await userModel.search('john');
    console.log('Search results:', searchResults);

    // Pagination
    const paginatedUsers = await userModel.paginate(1, 10, { is_active: true });
    console.log('Paginated users:', paginatedUsers);

    // === PRODUCT EXAMPLES ===

    // Create product
    const newProduct = await productModel.create({
      name: 'Wireless Headphones',
      sku: 'WH-001',
      barcode: '1234567890123',
      description: 'High-quality wireless headphones',
      price: 99.99,
      cost: 50.00,
      stock_quantity: 100,
      min_stock_level: 10,
      status: 'active'
    });
    console.log('Created product:', newProduct);

    // Get products with relations
    const productsWithRelations = await productModel.findAllWithRelations({
      status: 'active',
      min_price: 50
    });
    console.log('Products with relations:', productsWithRelations);

    // Search products
    const productSearchResults = await productModel.search('headphones', {
      status: 'active'
    });
    console.log('Product search results:', productSearchResults);

    // Update stock
    await productModel.updateStock(1, 5, 'add'); // Add 5 to stock
    await productModel.updateStock(1, 3, 'subtract'); // Subtract 3 from stock
    await productModel.updateStock(1, 50, 'set'); // Set stock to 50

    // Get low stock products
    const lowStockProducts = await productModel.getLowStock();
    console.log('Low stock products:', lowStockProducts);

    // === ROLE & PERMISSION EXAMPLES ===

    // Create role with permissions
    const newRole = await roleModel.create({
      name: 'Product Manager',
      slug: 'product-manager',
      description: 'Can manage products and inventory'
    });

    // Assign permissions to role
    await roleModel.assignPermissions(newRole.id, [1, 2, 3, 4]); // Permission IDs

    // Get role with permissions
    const roleWithPermissions = await roleModel.findWithPermissions(newRole.id);
    console.log('Role with permissions:', roleWithPermissions);

    // Assign role to user
    await userModel.assignRole(1, newRole.id, 1); // user_id, role_id, assigned_by

    // === CATEGORY EXAMPLES ===

    const categoryModel = new ProductCategory();

    // Get category tree
    const categoryTree = await categoryModel.getTree();
    console.log('Category tree:', categoryTree);

    // Get category path (breadcrumb)
    const categoryPath = await categoryModel.getCategoryPath(5);
    console.log('Category path:', categoryPath);

    // Get product count for category
    const productCount = await categoryModel.getProductCount(1, true); // Include subcategories
    console.log('Product count:', productCount);

  } catch (error) {
    console.error('Error in example usage:', error);
  }
}

// === USING IN EXPRESS ROUTE HANDLERS ===

async function exampleRouteHandler(req, res) {
  try {
    const productModel = new Product();
    
    // Get query parameters
    const { page = 1, limit = 10, search, category_id } = req.query;
    
    let products;
    if (search) {
      // Search products
      products = await productModel.search(search, { category_id });
      res.json({ data: products });
    } else {
      // Get paginated products
      products = await productModel.paginate(page, limit, { category_id });
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// === USING IN SERVICE CLASSES ===

class ProductService {
  constructor() {
    this.productModel = new Product();
    this.categoryModel = new ProductCategory();
    this.unitModel = new UnitsOfMeasure();
  }

  async createProductWithValidation(productData) {
    // Validate SKU uniqueness
    const isSkuUnique = await this.productModel.isSkuUnique(productData.sku);
    if (!isSkuUnique) {
      throw new Error('SKU already exists');
    }

    // Validate category exists
    if (productData.category_id) {
      const category = await this.categoryModel.findById(productData.category_id);
      if (!category) {
        throw new Error('Category not found');
      }
    }

    // Validate unit exists
    if (productData.unit_id) {
      const unit = await this.unitModel.findById(productData.unit_id);
      if (!unit) {
        throw new Error('Unit of measure not found');
      }
    }

    // Create product
    return await this.productModel.create(productData);
  }

  async getProductsWithInventoryAlert() {
    const lowStockProducts = await this.productModel.getLowStock();
    const totalInventoryValue = await this.productModel.getTotalInventoryValue();
    
    return {
      low_stock_products: lowStockProducts,
      total_inventory_value: totalInventoryValue,
      alert_count: lowStockProducts.length
    };
  }
}

module.exports = {
  exampleUsage,
  exampleRouteHandler,
  ProductService
};
