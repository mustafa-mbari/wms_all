import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  productCategories, type ProductCategory, type InsertProductCategory,
  unitsOfMeasure, type UnitOfMeasure, type InsertUnitOfMeasure,
  inventory, type Inventory, type InsertInventory,
  stockMovements, type StockMovement, type InsertStockMovement,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  warehouses, type Warehouse, type InsertWarehouse,
  classTypes, type ClassType,
  tuOrientationTypes, type TuOrientationType
} from "@shared/schema";
import session from "express-session";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getAllProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;

  // Product Categories
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, category: Partial<ProductCategory>): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: number): Promise<boolean>;
  getAllProductCategories(): Promise<ProductCategory[]>;

  // Units of Measure
  getUnitOfMeasure(id: string): Promise<UnitOfMeasure | undefined>;
  createUnitOfMeasure(uom: InsertUnitOfMeasure): Promise<UnitOfMeasure>;
  updateUnitOfMeasure(id: string, uom: Partial<UnitOfMeasure>): Promise<UnitOfMeasure | undefined>;
  deleteUnitOfMeasure(id: string): Promise<boolean>;
  getAllUnitsOfMeasure(): Promise<UnitOfMeasure[]>;

  // Inventory
  getInventory(id: number): Promise<Inventory | undefined>;
  createInventory(inv: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, inv: Partial<Inventory>): Promise<Inventory | undefined>;
  deleteInventory(id: number): Promise<boolean>;
  getInventoryByProduct(productId: number): Promise<Inventory[]>;
  getInventoryByWarehouse(warehouseId: string): Promise<Inventory[]>;
  getAllInventory(): Promise<Inventory[]>;

  // Stock Movements
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  getStockMovementsByProduct(productId: number): Promise<StockMovement[]>;
  getStockMovementsByWarehouse(warehouseId: string): Promise<StockMovement[]>;
  getRecentStockMovements(limit?: number): Promise<StockMovement[]>;

  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getRecentOrders(limit?: number): Promise<Order[]>;

  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: number, item: Partial<OrderItem>): Promise<OrderItem | undefined>;
  deleteOrderItem(id: number): Promise<boolean>;

  // Warehouses
  getWarehouse(id: string): Promise<Warehouse | undefined>;
  getAllWarehouses(): Promise<Warehouse[]>;

  // Class Types
  getClassType(id: string): Promise<ClassType | undefined>;
  getAllClassTypes(): Promise<ClassType[]>;

  // Dashboard Data
  getInventoryValue(): Promise<number>;
  getLowStockItems(): Promise<{product: Product, inventory: Inventory}[]>;
  getInventoryLevelsByCategory(): Promise<{category: string, value: number}[]>;
  getOrderTrends(): Promise<{date: string, incoming: number, outgoing: number}[]>;

  // Session store
  sessionStore: any;
}

export class InMemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private products: Map<number, Product> = new Map();
  private productCategories: Map<number, ProductCategory> = new Map();
  private unitsOfMeasure: Map<string, UnitOfMeasure> = new Map();
  private inventory: Map<number, Inventory> = new Map();
  private stockMovements: Map<number, StockMovement> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private warehouses: Map<string, Warehouse> = new Map();
  private classTypes: Map<string, ClassType> = new Map();

  private nextUserId = 1;
  private nextProductId = 1;
  private nextCategoryId = 1;
  private nextInventoryId = 1;
  private nextStockMovementId = 1;
  private nextOrderId = 1;
  private nextOrderItemId = 1;

  sessionStore: any;

  constructor() {
    // Use memory store for sessions
    this.sessionStore = new session.MemoryStore();

    // Create a default admin user
    this.createDefaultUser();
  }

  private createDefaultUser() {
    const defaultUser: User = {
      id: 1,
      username: "admin",
      password: "$2a$10$hash", // This will be replaced with proper hash
      email: "admin@wms.com",
      firstName: "Admin",
      lastName: "User",
      phone: null,
      birthDate: null,
      gender: null,
      profilePicture: null,
      address: null,
      city: null,
      country: null,
      postalCode: null,
      languagePreference: null,
      timezone: null,
      defaultWarehouseId: null,
      isActive: true,
      isAdmin: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    this.users.set(1, defaultUser);
    this.nextUserId = 2;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    return user && !user.deletedAt ? user : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username && !user.deletedAt) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.nextUserId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser || existingUser.deletedAt) return undefined;

    const updatedUser = { ...existingUser, ...user, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    const deletedUser = { ...user, deletedAt: new Date() };
    this.users.set(id, deletedUser);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => !user.deletedAt);
  }

  // Products - Mock implementations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    for (const product of this.products.values()) {
      if (product.sku === sku && !product.deletedAt) {
        return product;
      }
    }
    return undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: this.nextProductId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      deletedBy: null,
    };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing || existing.deletedAt) return undefined;

    const updated = { ...existing, ...product, updatedAt: new Date() };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;

    const deleted = { ...product, deletedAt: new Date() };
    this.products.set(id, deleted);
    return true;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => !p.deletedAt);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      !p.deletedAt && 
      (p.name.toLowerCase().includes(lowerQuery) || p.sku.toLowerCase().includes(lowerQuery))
    );
  }

  // Product Categories - Mock implementations
  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    return this.productCategories.get(id);
  }

  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const newCategory: ProductCategory = {
      ...category,
      id: this.nextCategoryId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      deletedBy: null,
    };
    this.productCategories.set(newCategory.id, newCategory);
    return newCategory;
  }

  async updateProductCategory(id: number, category: Partial<ProductCategory>): Promise<ProductCategory | undefined> {
    const existing = this.productCategories.get(id);
    if (!existing || existing.deletedAt) return undefined;

    const updated = { ...existing, ...category, updatedAt: new Date() };
    this.productCategories.set(id, updated);
    return updated;
  }

  async deleteProductCategory(id: number): Promise<boolean> {
    const category = this.productCategories.get(id);
    if (!category) return false;

    const deleted = { ...category, deletedAt: new Date() };
    this.productCategories.set(id, deleted);
    return true;
  }

  async getAllProductCategories(): Promise<ProductCategory[]> {
    return Array.from(this.productCategories.values()).filter(c => !c.deletedAt);
  }

  // Mock implementations for remaining methods
  async getUnitOfMeasure(id: string): Promise<UnitOfMeasure | undefined> { return undefined; }
  async createUnitOfMeasure(uom: InsertUnitOfMeasure): Promise<UnitOfMeasure> { throw new Error("Not implemented"); }
  async updateUnitOfMeasure(id: string, uom: Partial<UnitOfMeasure>): Promise<UnitOfMeasure | undefined> { return undefined; }
  async deleteUnitOfMeasure(id: string): Promise<boolean> { return false; }
  async getAllUnitsOfMeasure(): Promise<UnitOfMeasure[]> { return []; }

  async getInventory(id: number): Promise<Inventory | undefined> { return undefined; }
  async createInventory(inv: InsertInventory): Promise<Inventory> { throw new Error("Not implemented"); }
  async updateInventory(id: number, inv: Partial<Inventory>): Promise<Inventory | undefined> { return undefined; }
  async deleteInventory(id: number): Promise<boolean> { return false; }
  async getInventoryByProduct(productId: number): Promise<Inventory[]> { return []; }
  async getInventoryByWarehouse(warehouseId: string): Promise<Inventory[]> { return []; }
  async getAllInventory(): Promise<Inventory[]> { return []; }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> { throw new Error("Not implemented"); }
  async getStockMovementsByProduct(productId: number): Promise<StockMovement[]> { return []; }
  async getStockMovementsByWarehouse(warehouseId: string): Promise<StockMovement[]> { return []; }
  async getRecentStockMovements(limit: number = 10): Promise<StockMovement[]> { return []; }

  async getOrder(id: number): Promise<Order | undefined> { return undefined; }
  async createOrder(order: InsertOrder): Promise<Order> { throw new Error("Not implemented"); }
  async updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined> { return undefined; }
  async deleteOrder(id: number): Promise<boolean> { return false; }
  async getAllOrders(): Promise<Order[]> { return []; }
  async getOrdersByStatus(status: string): Promise<Order[]> { return []; }
  async getRecentOrders(limit: number = 10): Promise<Order[]> { return []; }

  async getOrderItems(orderId: number): Promise<OrderItem[]> { return []; }
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> { throw new Error("Not implemented"); }
  async updateOrderItem(id: number, item: Partial<OrderItem>): Promise<OrderItem | undefined> { return undefined; }
  async deleteOrderItem(id: number): Promise<boolean> { return false; }

  async getWarehouse(id: string): Promise<Warehouse | undefined> { return undefined; }
  async getAllWarehouses(): Promise<Warehouse[]> { return []; }

  async getClassType(id: string): Promise<ClassType | undefined> { return undefined; }
  async getAllClassTypes(): Promise<ClassType[]> { return []; }

  async getInventoryValue(): Promise<number> { return 0; }
  async getLowStockItems(): Promise<{product: Product, inventory: Inventory}[]> { return []; }
  async getInventoryLevelsByCategory(): Promise<{category: string, value: number}[]> { return []; }
  async getOrderTrends(): Promise<{date: string, incoming: number, outgoing: number}[]> { 
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();

    return lastSixMonths.map(date => ({
      date,
      incoming: Math.floor(Math.random() * 100) + 50,
      outgoing: Math.floor(Math.random() * 100) + 30,
    }));
  }
}

export const storage = new InMemoryStorage();