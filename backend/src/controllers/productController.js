const { Product, ProductCategory, ProductFamily, UnitsOfMeasure } = require('../models');

class ProductController {
  // Get all products with pagination and filters
  static async index(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        category_id, 
        family_id, 
        status = 'active',
        min_price,
        max_price 
      } = req.query;

      const productModel = new Product();
      const filters = {
        category_id,
        family_id,
        status,
        min_price: min_price ? parseFloat(min_price) : undefined,
        max_price: max_price ? parseFloat(max_price) : undefined
      };

      let products;
      if (search) {
        products = await productModel.search(search, filters);
        // If searching, return all results without pagination
        res.json({ data: products, pagination: null });
      } else {
        products = await productModel.paginate(page, limit, filters);
        res.json(products);
      }
    } catch (error) {
      console.error('Product index error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get single product with relations
  static async show(req, res) {
    try {
      const { id } = req.params;
      const productModel = new Product();
      
      const product = await productModel.findWithRelations(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Product show error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Create new product
  static async store(req, res) {
    try {
      const productModel = new Product();
      
      // Validate required fields
      const { name, sku, price = 0, cost = 0 } = req.body;
      
      if (!name || !sku) {
        return res.status(400).json({ 
          error: 'Name and SKU are required' 
        });
      }

      // Check if SKU is unique
      const isSkuUnique = await productModel.isSkuUnique(sku);
      if (!isSkuUnique) {
        return res.status(400).json({ 
          error: 'SKU already exists' 
        });
      }

      // Check if barcode is unique (if provided)
      if (req.body.barcode) {
        const isBarcodeUnique = await productModel.isBarcodeUnique(req.body.barcode);
        if (!isBarcodeUnique) {
          return res.status(400).json({ 
            error: 'Barcode already exists' 
          });
        }
      }

      const product = await productModel.create({
        ...req.body,
        price: parseFloat(price),
        cost: parseFloat(cost)
      });
      
      // Return product with relations
      const productWithRelations = await productModel.findWithRelations(product.id);
      
      res.status(201).json(productWithRelations);
    } catch (error) {
      console.error('Product store error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Update product
  static async update(req, res) {
    try {
      const { id } = req.params;
      const productModel = new Product();
      
      // Check if product exists
      const existingProduct = await productModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Validate SKU uniqueness if changing
      if (req.body.sku && req.body.sku !== existingProduct.sku) {
        const isSkuUnique = await productModel.isSkuUnique(req.body.sku, id);
        if (!isSkuUnique) {
          return res.status(400).json({ 
            error: 'SKU already exists' 
          });
        }
      }

      // Validate barcode uniqueness if changing
      if (req.body.barcode && req.body.barcode !== existingProduct.barcode) {
        const isBarcodeUnique = await productModel.isBarcodeUnique(req.body.barcode, id);
        if (!isBarcodeUnique) {
          return res.status(400).json({ 
            error: 'Barcode already exists' 
          });
        }
      }

      const product = await productModel.update(id, req.body);
      
      // Return product with relations
      const productWithRelations = await productModel.findWithRelations(id);
      
      res.json(productWithRelations);
    } catch (error) {
      console.error('Product update error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Delete product
  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const productModel = new Product();
      
      const product = await productModel.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await productModel.delete(id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Product destroy error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Update stock
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation = 'set' } = req.body;
      
      const productModel = new Product();
      
      await productModel.updateStock(id, quantity, operation);
      const product = await productModel.findWithRelations(id);
      
      res.json(product);
    } catch (error) {
      console.error('Product updateStock error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get low stock products
  static async lowStock(req, res) {
    try {
      const productModel = new Product();
      const products = await productModel.getLowStock();
      
      res.json(products);
    } catch (error) {
      console.error('Product lowStock error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get inventory value
  static async inventoryValue(req, res) {
    try {
      const productModel = new Product();
      const products = await productModel.getInventoryValue();
      const totalValue = await productModel.getTotalInventoryValue();
      
      res.json({
        products,
        total_value: totalValue
      });
    } catch (error) {
      console.error('Product inventoryValue error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;
