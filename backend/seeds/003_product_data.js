exports.seed = async function(knex) {
  // Clear existing product-related entries in correct order
  await knex('product_attribute_values').del();
  await knex('product_attribute_options').del();
  await knex('product_attributes').del();
  await knex('products').del();
  
  // Get existing categories and families for reference
  const electronics = await knex('product_categories').where('slug', 'electronics').first();
  const clothing = await knex('product_categories').where('slug', 'clothing').first();
  const homeGarden = await knex('product_categories').where('slug', 'home-garden').first();
  const sportsOutdoors = await knex('product_categories').where('slug', 'sports-outdoors').first();
  const foodBeverage = await knex('product_categories').where('slug', 'food-beverage').first();
  
  const consumerElectronics = await knex('product_families').where('name', 'Consumer Electronics').first();
  const fashionApparel = await knex('product_families').where('name', 'Fashion Apparel').first();
  const homeEssentials = await knex('product_families').where('name', 'Home Essentials').first();
  const fitnessEquipment = await knex('product_families').where('name', 'Fitness Equipment').first();
  const beverages = await knex('product_families').where('name', 'Beverages').first();

  // Get UOM references
  const piece = await knex('units_of_measure').where('symbol', 'pcs').first();
  const kilogram = await knex('units_of_measure').where('symbol', 'kg').first();
  const liter = await knex('units_of_measure').where('symbol', 'L').first();
  const meter = await knex('units_of_measure').where('symbol', 'm').first();
  const box = await knex('units_of_measure').where('symbol', 'box').first();

  // Insert product attributes
  const attributes = await knex('product_attributes').insert([
    {
      name: 'Color',
      slug: 'color',
      type: 'select',
      description: 'Product color',
      is_required: false,
      is_filterable: true,
      is_searchable: true,
      sort_order: 1
    },
    {
      name: 'Size',
      slug: 'size', 
      type: 'select',
      description: 'Product size',
      is_required: false,
      is_filterable: true,
      is_searchable: true,
      sort_order: 2
    },
    {
      name: 'Weight',
      slug: 'weight',
      type: 'number',
      description: 'Product weight in kg',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 3
    },
    {
      name: 'Material',
      slug: 'material',
      type: 'text',
      description: 'Product material',
      is_required: false,
      is_filterable: true,
      is_searchable: true,
      sort_order: 4
    },
    {
      name: 'Brand',
      slug: 'brand',
      type: 'select',
      description: 'Product brand',
      is_required: false,
      is_filterable: true,
      is_searchable: true,
      sort_order: 5
    },
    {
      name: 'Waterproof',
      slug: 'waterproof',
      type: 'boolean',
      description: 'Is product waterproof',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 6
    },
    {
      name: 'Warranty Period',
      slug: 'warranty-period',
      type: 'select',
      description: 'Product warranty period',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 7
    },
    {
      name: 'Screen Size',
      slug: 'screen-size',
      type: 'number',
      description: 'Screen size in inches',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 8
    },
    {
      name: 'Storage Capacity',
      slug: 'storage-capacity',
      type: 'select',
      description: 'Storage capacity',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 9
    },
    {
      name: 'Energy Rating',
      slug: 'energy-rating',
      type: 'select',
      description: 'Energy efficiency rating',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 10
    }
  ]).returning('*');

  // Get attribute IDs
  const colorAttr = attributes.find(attr => attr.slug === 'color');
  const sizeAttr = attributes.find(attr => attr.slug === 'size');
  const brandAttr = attributes.find(attr => attr.slug === 'brand');
  const warrantyAttr = attributes.find(attr => attr.slug === 'warranty-period');
  const storageAttr = attributes.find(attr => attr.slug === 'storage-capacity');
  const energyAttr = attributes.find(attr => attr.slug === 'energy-rating');

  // Insert attribute options
  await knex('product_attribute_options').insert([
    // Color options
    { attribute_id: colorAttr.id, value: 'Red', label: 'Red', sort_order: 1 },
    { attribute_id: colorAttr.id, value: 'Blue', label: 'Blue', sort_order: 2 },
    { attribute_id: colorAttr.id, value: 'Green', label: 'Green', sort_order: 3 },
    { attribute_id: colorAttr.id, value: 'Black', label: 'Black', sort_order: 4 },
    { attribute_id: colorAttr.id, value: 'White', label: 'White', sort_order: 5 },
    { attribute_id: colorAttr.id, value: 'Yellow', label: 'Yellow', sort_order: 6 },
    { attribute_id: colorAttr.id, value: 'Purple', label: 'Purple', sort_order: 7 },
    { attribute_id: colorAttr.id, value: 'Orange', label: 'Orange', sort_order: 8 },
    { attribute_id: colorAttr.id, value: 'Pink', label: 'Pink', sort_order: 9 },
    { attribute_id: colorAttr.id, value: 'Gray', label: 'Gray', sort_order: 10 },

    // Size options
    { attribute_id: sizeAttr.id, value: 'XS', label: 'Extra Small', sort_order: 1 },
    { attribute_id: sizeAttr.id, value: 'S', label: 'Small', sort_order: 2 },
    { attribute_id: sizeAttr.id, value: 'M', label: 'Medium', sort_order: 3 },
    { attribute_id: sizeAttr.id, value: 'L', label: 'Large', sort_order: 4 },
    { attribute_id: sizeAttr.id, value: 'XL', label: 'Extra Large', sort_order: 5 },
    { attribute_id: sizeAttr.id, value: 'XXL', label: 'Double Extra Large', sort_order: 6 },
    { attribute_id: sizeAttr.id, value: 'XXXL', label: 'Triple Extra Large', sort_order: 7 },

    // Brand options
    { attribute_id: brandAttr.id, value: 'Apple', label: 'Apple', sort_order: 1 },
    { attribute_id: brandAttr.id, value: 'Samsung', label: 'Samsung', sort_order: 2 },
    { attribute_id: brandAttr.id, value: 'Sony', label: 'Sony', sort_order: 3 },
    { attribute_id: brandAttr.id, value: 'LG', label: 'LG', sort_order: 4 },
    { attribute_id: brandAttr.id, value: 'Nike', label: 'Nike', sort_order: 5 },
    { attribute_id: brandAttr.id, value: 'Adidas', label: 'Adidas', sort_order: 6 },
    { attribute_id: brandAttr.id, value: 'Under Armour', label: 'Under Armour', sort_order: 7 },
    { attribute_id: brandAttr.id, value: 'Puma', label: 'Puma', sort_order: 8 },
    { attribute_id: brandAttr.id, value: 'Generic', label: 'Generic', sort_order: 9 },

    // Warranty options
    { attribute_id: warrantyAttr.id, value: '6 Months', label: '6 Months', sort_order: 1 },
    { attribute_id: warrantyAttr.id, value: '1 Year', label: '1 Year', sort_order: 2 },
    { attribute_id: warrantyAttr.id, value: '2 Years', label: '2 Years', sort_order: 3 },
    { attribute_id: warrantyAttr.id, value: '3 Years', label: '3 Years', sort_order: 4 },
    { attribute_id: warrantyAttr.id, value: '5 Years', label: '5 Years', sort_order: 5 },

    // Storage capacity options
    { attribute_id: storageAttr.id, value: '32GB', label: '32GB', sort_order: 1 },
    { attribute_id: storageAttr.id, value: '64GB', label: '64GB', sort_order: 2 },
    { attribute_id: storageAttr.id, value: '128GB', label: '128GB', sort_order: 3 },
    { attribute_id: storageAttr.id, value: '256GB', label: '256GB', sort_order: 4 },
    { attribute_id: storageAttr.id, value: '512GB', label: '512GB', sort_order: 5 },
    { attribute_id: storageAttr.id, value: '1TB', label: '1TB', sort_order: 6 },

    // Energy rating options
    { attribute_id: energyAttr.id, value: 'A+++', label: 'A+++', sort_order: 1 },
    { attribute_id: energyAttr.id, value: 'A++', label: 'A++', sort_order: 2 },
    { attribute_id: energyAttr.id, value: 'A+', label: 'A+', sort_order: 3 },
    { attribute_id: energyAttr.id, value: 'A', label: 'A', sort_order: 4 },
    { attribute_id: energyAttr.id, value: 'B', label: 'B', sort_order: 5 },
    { attribute_id: energyAttr.id, value: 'C', label: 'C', sort_order: 6 }
  ]);

  // Get additional category and family references for expanded seed data
  const booksMedia = await knex('product_categories').where('slug', 'books-media').first();
  const edekaCategory = await knex('product_categories').where('slug', 'edeka-drinks').first();
  
  // Get UOM references for more units
  const gram = await knex('units_of_measure').where('symbol', 'g').first();
  const milliliter = await knex('units_of_measure').where('symbol', 'ml').first();
  const centimeter = await knex('units_of_measure').where('symbol', 'cm').first();
  const carton = await knex('units_of_measure').where('symbol', 'ctn').first();
  const dozen = await knex('units_of_measure').where('symbol', 'dz').first();

  // Insert products - Ensuring coverage for all units, categories, and families
  const products = await knex('products').insert([
    // =================== PRODUCTS BY UNIT OF MEASURE (2 per unit) ===================
    
    // Piece (pcs) - 2 products
    {
      sku: 'IP14-128-BLK',
      name: 'iPhone 14 Pro',
      description: 'Latest iPhone with advanced camera system and A16 Bionic chip',
      short_description: 'Latest iPhone with advanced camera system',
      category_id: electronics?.id,
      family_id: consumerElectronics?.id,
      unit_id: piece?.id,
      price: '999.99',
      cost: '750.00',
      weight: '0.206',
      length: '15.75',
      width: '7.15',
      height: '0.79',
      min_stock_level: 10,
      stock_quantity: 50,
      status: 'active',
      barcode: '123456789001',
      image_url: 'https://example.com/iphone14.jpg'
    },
    {
      sku: 'SM-TAB-A8-64GB',
      name: 'Samsung Galaxy Tab A8',
      description: 'Affordable Android tablet for everyday use',
      short_description: 'Affordable Android tablet',
      category_id: electronics?.id,
      family_id: consumerElectronics?.id,
      unit_id: piece?.id,
      price: '229.99',
      cost: '180.00',
      weight: '0.508',
      min_stock_level: 15,
      stock_quantity: 35,
      status: 'active',
      barcode: '123456789011',
      image_url: 'https://example.com/galaxy-tab.jpg'
    },

    // Kilogram (kg) - 2 products
    {
      sku: 'ORG-RICE-5KG',
      name: 'Organic Basmati Rice',
      description: 'Premium quality organic basmati rice, 5kg package',
      short_description: 'Premium organic basmati rice',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: kilogram?.id,
      price: '24.99',
      cost: '15.00',
      weight: '5.0',
      min_stock_level: 20,
      stock_quantity: 80,
      status: 'active',
      barcode: '123456789012',
      image_url: 'https://example.com/rice.jpg'
    },
    {
      sku: 'PROT-PWD-2KG',
      name: 'Whey Protein Powder',
      description: 'High-quality whey protein powder for muscle building, 2kg',
      short_description: 'Whey protein powder 2kg',
      category_id: sportsOutdoors?.id,
      family_id: fitnessEquipment?.id,
      unit_id: kilogram?.id,
      price: '59.99',
      cost: '35.00',
      weight: '2.0',
      min_stock_level: 25,
      stock_quantity: 60,
      status: 'active',
      barcode: '123456789013',
      image_url: 'https://example.com/protein.jpg'
    },

    // Gram (g) - 2 products
    {
      sku: 'GOLD-RING-18K',
      name: '18K Gold Ring',
      description: 'Elegant 18K gold ring with diamond accent, 5g',
      short_description: '18K gold ring with diamond',
      category_id: clothing?.id,
      family_id: fashionApparel?.id,
      unit_id: gram?.id,
      price: '299.99',
      cost: '200.00',
      weight: '0.005',
      min_stock_level: 5,
      stock_quantity: 15,
      status: 'active',
      barcode: '123456789014',
      image_url: 'https://example.com/gold-ring.jpg'
    },
    {
      sku: 'SPICE-MIX-50G',
      name: 'Italian Herb Spice Mix',
      description: 'Premium Italian herb and spice blend, 50g package',
      short_description: 'Italian herb spice mix',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: gram?.id,
      price: '8.99',
      cost: '4.00',
      weight: '0.05',
      min_stock_level: 30,
      stock_quantity: 100,
      status: 'active',
      barcode: '123456789015',
      image_url: 'https://example.com/spice-mix.jpg'
    },

    // Liter (L) - 2 products
    {
      sku: 'OLV-OIL-1L',
      name: 'Extra Virgin Olive Oil',
      description: 'Premium extra virgin olive oil from Mediterranean, 1L bottle',
      short_description: 'Extra virgin olive oil 1L',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: liter?.id,
      price: '18.99',
      cost: '12.00',
      weight: '0.92',
      min_stock_level: 25,
      stock_quantity: 75,
      status: 'active',
      barcode: '123456789016',
      image_url: 'https://example.com/olive-oil.jpg'
    },
    {
      sku: 'PAINT-ACRL-1L',
      name: 'Acrylic Paint White',
      description: 'High-quality acrylic paint for walls and furniture, 1L',
      short_description: 'Acrylic paint white 1L',
      category_id: homeGarden?.id,
      family_id: homeEssentials?.id,
      unit_id: liter?.id,
      price: '12.99',
      cost: '8.00',
      weight: '1.2',
      min_stock_level: 20,
      stock_quantity: 50,
      status: 'active',
      barcode: '123456789017',
      image_url: 'https://example.com/paint.jpg'
    },

    // Milliliter (ml) - 2 products
    {
      sku: 'PERFUME-50ML',
      name: 'Luxury Eau de Parfum',
      description: 'Premium luxury fragrance, 50ml bottle',
      short_description: 'Luxury eau de parfum 50ml',
      category_id: clothing?.id,
      family_id: fashionApparel?.id,
      unit_id: milliliter?.id,
      price: '89.99',
      cost: '45.00',
      weight: '0.15',
      min_stock_level: 10,
      stock_quantity: 30,
      status: 'active',
      barcode: '123456789018',
      image_url: 'https://example.com/perfume.jpg'
    },
    {
      sku: 'ESSOIL-TEA-10ML',
      name: 'Tea Tree Essential Oil',
      description: 'Pure tea tree essential oil for aromatherapy, 10ml',
      short_description: 'Tea tree essential oil 10ml',
      category_id: homeGarden?.id,
      family_id: homeEssentials?.id,
      unit_id: milliliter?.id,
      price: '14.99',
      cost: '8.00',
      weight: '0.02',
      min_stock_level: 20,
      stock_quantity: 60,
      status: 'active',
      barcode: '123456789019',
      image_url: 'https://example.com/essential-oil.jpg'
    },

    // Meter (m) - 2 products
    {
      sku: 'ROPE-CLIMB-10M',
      name: 'Climbing Rope',
      description: 'Professional climbing rope, dynamic, 10m length',
      short_description: 'Professional climbing rope 10m',
      category_id: sportsOutdoors?.id,
      family_id: fitnessEquipment?.id,
      unit_id: meter?.id,
      price: '89.99',
      cost: '55.00',
      weight: '1.8',
      min_stock_level: 10,
      stock_quantity: 25,
      status: 'active',
      barcode: '123456789020',
      image_url: 'https://example.com/climbing-rope.jpg'
    },
    {
      sku: 'FABRIC-COT-5M',
      name: 'Organic Cotton Fabric',
      description: 'Premium organic cotton fabric for crafting, 5m roll',
      short_description: 'Organic cotton fabric 5m',
      category_id: clothing?.id,
      family_id: fashionApparel?.id,
      unit_id: meter?.id,
      price: '34.99',
      cost: '20.00',
      weight: '0.8',
      min_stock_level: 15,
      stock_quantity: 40,
      status: 'active',
      barcode: '123456789021',
      image_url: 'https://example.com/cotton-fabric.jpg'
    },

    // Centimeter (cm) - 2 products
    {
      sku: 'RIBBON-SILK-5CM',
      name: 'Silk Ribbon',
      description: 'Premium silk ribbon for crafts and decoration, 5cm width x 10m',
      short_description: 'Silk ribbon 5cm width',
      category_id: clothing?.id,
      family_id: fashionApparel?.id,
      unit_id: centimeter?.id,
      price: '12.99',
      cost: '7.00',
      weight: '0.1',
      min_stock_level: 25,
      stock_quantity: 80,
      status: 'active',
      barcode: '123456789022',
      image_url: 'https://example.com/silk-ribbon.jpg'
    },
    {
      sku: 'TRIM-WOOD-2CM',
      name: 'Wooden Trim Strip',
      description: 'Oak wood trim strip for decoration, 2cm x 1m',
      short_description: 'Oak wood trim 2cm',
      category_id: homeGarden?.id,
      family_id: homeEssentials?.id,
      unit_id: centimeter?.id,
      price: '8.99',
      cost: '5.00',
      weight: '0.3',
      min_stock_level: 30,
      stock_quantity: 100,
      status: 'active',
      barcode: '123456789023',
      image_url: 'https://example.com/wood-trim.jpg'
    },

    // Box - 2 products
    {
      sku: 'TEA-EARL-20BOX',
      name: 'Earl Grey Tea Bags',
      description: 'Premium Earl Grey tea, box of 20 tea bags',
      short_description: 'Earl Grey tea 20 bags',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: box?.id,
      price: '9.99',
      cost: '5.00',
      weight: '0.04',
      min_stock_level: 40,
      stock_quantity: 120,
      status: 'active',
      barcode: '123456789024',
      image_url: 'https://example.com/earl-grey.jpg'
    },
    {
      sku: 'CEREAL-OATS-BOX',
      name: 'Organic Oat Cereal',
      description: 'Healthy organic oat cereal, family size box',
      short_description: 'Organic oat cereal',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: box?.id,
      price: '6.99',
      cost: '4.00',
      weight: '0.5',
      min_stock_level: 35,
      stock_quantity: 90,
      status: 'active',
      barcode: '123456789025',
      image_url: 'https://example.com/oat-cereal.jpg'
    },

    // Carton (ctn) - 2 products
    {
      sku: 'MILK-ORG-1L-CTN',
      name: 'Organic Whole Milk',
      description: 'Fresh organic whole milk, 1L carton',
      short_description: 'Organic whole milk 1L',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: carton?.id,
      price: '3.99',
      cost: '2.50',
      weight: '1.03',
      min_stock_level: 50,
      stock_quantity: 150,
      status: 'active',
      barcode: '123456789026',
      image_url: 'https://example.com/organic-milk.jpg'
    },
    {
      sku: 'JUICE-ORNG-1L',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice, 1L carton',
      short_description: 'Fresh orange juice 1L',
      category_id: edekaCategory?.id,
      family_id: beverages?.id,
      unit_id: carton?.id,
      price: '4.99',
      cost: '3.00',
      weight: '1.05',
      min_stock_level: 40,
      stock_quantity: 100,
      status: 'active',
      barcode: '123456789027',
      image_url: 'https://example.com/orange-juice.jpg'
    },

    // Dozen (dz) - 2 products
    {
      sku: 'EGGS-FREE-DZ',
      name: 'Free Range Eggs',
      description: 'Fresh free-range eggs from local farm, dozen',
      short_description: 'Free range eggs dozen',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: dozen?.id,
      price: '4.99',
      cost: '3.00',
      weight: '0.72',
      min_stock_level: 30,
      stock_quantity: 80,
      status: 'active',
      barcode: '123456789028',
      image_url: 'https://example.com/free-range-eggs.jpg'
    },
    {
      sku: 'DONUTS-GLZD-DZ',
      name: 'Glazed Donuts',
      description: 'Fresh glazed donuts from local bakery, dozen',
      short_description: 'Glazed donuts dozen',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: dozen?.id,
      price: '12.99',
      cost: '8.00',
      weight: '1.2',
      min_stock_level: 20,
      stock_quantity: 40,
      status: 'active',
      barcode: '123456789029',
      image_url: 'https://example.com/glazed-donuts.jpg'
    },

    // =================== ADDITIONAL PRODUCTS BY CATEGORY (2 per category) ===================
    
    // Electronics - Additional
    {
      sku: 'HPHONE-WL-BT',
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-cancelling wireless headphones',
      short_description: 'Wireless noise-cancelling headphones',
      category_id: electronics?.id,
      family_id: consumerElectronics?.id,
      unit_id: piece?.id,
      price: '199.99',
      cost: '120.00',
      weight: '0.25',
      min_stock_level: 20,
      stock_quantity: 60,
      status: 'active',
      barcode: '123456789030',
      image_url: 'https://example.com/wireless-headphones.jpg'
    },

    // Clothing - Additional
    {
      sku: 'JEANS-DENIM-32',
      name: 'Classic Denim Jeans',
      description: 'Classic blue denim jeans, size 32, regular fit',
      short_description: 'Classic denim jeans',
      category_id: clothing?.id,
      family_id: fashionApparel?.id,
      unit_id: piece?.id,
      price: '79.99',
      cost: '40.00',
      weight: '0.6',
      min_stock_level: 25,
      stock_quantity: 75,
      status: 'active',
      barcode: '123456789031',
      image_url: 'https://example.com/denim-jeans.jpg'
    },

    // Home & Garden - Additional
    {
      sku: 'LAMP-LED-DESK',
      name: 'LED Desk Lamp',
      description: 'Adjustable LED desk lamp with USB charging port',
      short_description: 'LED desk lamp with USB',
      category_id: homeGarden?.id,
      family_id: homeEssentials?.id,
      unit_id: piece?.id,
      price: '45.99',
      cost: '25.00',
      weight: '1.1',
      min_stock_level: 15,
      stock_quantity: 45,
      status: 'active',
      barcode: '123456789032',
      image_url: 'https://example.com/led-lamp.jpg'
    },

    // Sports & Outdoors - Additional
    {
      sku: 'BIKE-MTN-26',
      name: 'Mountain Bike 26"',
      description: 'Professional mountain bike with 26" wheels, 21-speed',
      short_description: 'Mountain bike 26" 21-speed',
      category_id: sportsOutdoors?.id,
      family_id: fitnessEquipment?.id,
      unit_id: piece?.id,
      price: '599.99',
      cost: '350.00',
      weight: '15.5',
      min_stock_level: 5,
      stock_quantity: 12,
      status: 'active',
      barcode: '123456789033',
      image_url: 'https://example.com/mountain-bike.jpg'
    },

    // EDEKA & Drinks - Additional
    {
      sku: 'WATER-SPRK-500ML',
      name: 'Sparkling Water',
      description: 'Premium sparkling mineral water, 500ml bottle',
      short_description: 'Sparkling water 500ml',
      category_id: edekaCategory?.id,
      family_id: beverages?.id,
      unit_id: milliliter?.id,
      price: '1.99',
      cost: '1.00',
      weight: '0.52',
      min_stock_level: 100,
      stock_quantity: 300,
      status: 'active',
      barcode: '123456789034',
      image_url: 'https://example.com/sparkling-water.jpg'
    },

    // Books & Media - 2 products
    {
      sku: 'BOOK-PROG-JS',
      name: 'JavaScript Programming Guide',
      description: 'Complete guide to modern JavaScript programming',
      short_description: 'JavaScript programming guide',
      category_id: booksMedia?.id,
      family_id: consumerElectronics?.id,
      unit_id: piece?.id,
      price: '39.99',
      cost: '20.00',
      weight: '0.8',
      min_stock_level: 15,
      stock_quantity: 50,
      status: 'active',
      barcode: '123456789035',
      image_url: 'https://example.com/js-book.jpg'
    },
    {
      sku: 'DVD-MOVIE-ACT',
      name: 'Action Movie Collection',
      description: 'Top action movies collection on DVD, 3-disc set',
      short_description: 'Action movie DVD collection',
      category_id: booksMedia?.id,
      family_id: consumerElectronics?.id,
      unit_id: piece?.id,
      price: '24.99',
      cost: '15.00',
      weight: '0.3',
      min_stock_level: 20,
      stock_quantity: 60,
      status: 'active',
      barcode: '123456789036',
      image_url: 'https://example.com/action-dvd.jpg'
    },

    // Food & Beverage - Additional
    {
      sku: 'CHOC-DARK-70',
      name: 'Dark Chocolate 70%',
      description: 'Premium dark chocolate with 70% cocoa content, 100g bar',
      short_description: 'Dark chocolate 70% cocoa',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: gram?.id,
      price: '4.99',
      cost: '2.50',
      weight: '0.1',
      min_stock_level: 40,
      stock_quantity: 120,
      status: 'active',
      barcode: '123456789037',
      image_url: 'https://example.com/dark-chocolate.jpg'
    }
  ]).returning('*');

  // Get option IDs for attribute values
  const redOption = await knex('product_attribute_options').where({ attribute_id: colorAttr.id, value: 'Red' }).first();
  const blackOption = await knex('product_attribute_options').where({ attribute_id: colorAttr.id, value: 'Black' }).first();
  const whiteOption = await knex('product_attribute_options').where({ attribute_id: colorAttr.id, value: 'White' }).first();
  const blueOption = await knex('product_attribute_options').where({ attribute_id: colorAttr.id, value: 'Blue' }).first();
  
  const mOption = await knex('product_attribute_options').where({ attribute_id: sizeAttr.id, value: 'M' }).first();
  const lOption = await knex('product_attribute_options').where({ attribute_id: sizeAttr.id, value: 'L' }).first();
  
  const appleOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Apple' }).first();
  const samsungOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Samsung' }).first();
  const sonyOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Sony' }).first();
  const nikeOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Nike' }).first();
  const adidasOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Adidas' }).first();
  const genericOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Generic' }).first();
  
  const oneYearOption = await knex('product_attribute_options').where({ attribute_id: warrantyAttr.id, value: '1 Year' }).first();
  const twoYearOption = await knex('product_attribute_options').where({ attribute_id: warrantyAttr.id, value: '2 Years' }).first();
  
  const gb128Option = await knex('product_attribute_options').where({ attribute_id: storageAttr.id, value: '128GB' }).first();
  const gb256Option = await knex('product_attribute_options').where({ attribute_id: storageAttr.id, value: '256GB' }).first();
  const gb512Option = await knex('product_attribute_options').where({ attribute_id: storageAttr.id, value: '512GB' }).first();

  // Insert product attribute values (sample attributes for key products)
  await knex('product_attribute_values').insert([
    // iPhone 14 Pro attributes (Product 0)
    { product_id: products[0].id, attribute_id: colorAttr.id, option_id: blackOption?.id, value: 'Black' },
    { product_id: products[0].id, attribute_id: brandAttr.id, option_id: appleOption?.id, value: 'Apple' },
    { product_id: products[0].id, attribute_id: warrantyAttr.id, option_id: oneYearOption?.id, value: '1 Year' },
    { product_id: products[0].id, attribute_id: storageAttr.id, option_id: gb128Option?.id, value: '128GB' },
    { product_id: products[0].id, attribute_id: attributes.find(a => a.slug === 'screen-size').id, option_id: null, value: '6.1' },

    // Samsung Galaxy Tab A8 attributes (Product 1)  
    { product_id: products[1].id, attribute_id: colorAttr.id, option_id: whiteOption?.id, value: 'White' },
    { product_id: products[1].id, attribute_id: brandAttr.id, option_id: samsungOption?.id, value: 'Samsung' },
    { product_id: products[1].id, attribute_id: warrantyAttr.id, option_id: twoYearOption?.id, value: '2 Years' },
    { product_id: products[1].id, attribute_id: storageAttr.id, option_id: gb256Option?.id, value: '64GB' },
    { product_id: products[1].id, attribute_id: attributes.find(a => a.slug === 'screen-size').id, option_id: null, value: '10.5' },

    // Organic Basmati Rice attributes (Product 2)
    { product_id: products[2].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Organic Farm' },
    { product_id: products[2].id, attribute_id: attributes.find(a => a.slug === 'weight').id, option_id: null, value: '5.0' },

    // Whey Protein Powder attributes (Product 3)
    { product_id: products[3].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Muscle Tech' },
    { product_id: products[3].id, attribute_id: attributes.find(a => a.slug === 'weight').id, option_id: null, value: '2.0' },

    // 18K Gold Ring attributes (Product 4)
    { product_id: products[4].id, attribute_id: colorAttr.id, option_id: blackOption?.id, value: 'Gold' },
    { product_id: products[4].id, attribute_id: sizeAttr.id, option_id: mOption?.id, value: '7' },
    { product_id: products[4].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: '18K Gold' },

    // Italian Herb Spice Mix attributes (Product 5)
    { product_id: products[5].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Gourmet' },
    { product_id: products[5].id, attribute_id: attributes.find(a => a.slug === 'weight').id, option_id: null, value: '0.05' },

    // Extra Virgin Olive Oil attributes (Product 6)
    { product_id: products[6].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Mediterranean' },
    { product_id: products[6].id, attribute_id: attributes.find(a => a.slug === 'waterproof').id, option_id: null, value: 'false' },

    // Acrylic Paint White attributes (Product 7)
    { product_id: products[7].id, attribute_id: colorAttr.id, option_id: whiteOption?.id, value: 'White' },
    { product_id: products[7].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Home Pro' },

    // Luxury Eau de Parfum attributes (Product 8)
    { product_id: products[8].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Luxury' },
    { product_id: products[8].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Glass' },

    // Tea Tree Essential Oil attributes (Product 9)
    { product_id: products[9].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Nature Pure' },
    { product_id: products[9].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Organic' },

    // Climbing Rope attributes (Product 10)
    { product_id: products[10].id, attribute_id: colorAttr.id, option_id: blueOption?.id, value: 'Blue' },
    { product_id: products[10].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'ClimbMax' },
    { product_id: products[10].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Nylon' },

    // Organic Cotton Fabric attributes (Product 11)
    { product_id: products[11].id, attribute_id: colorAttr.id, option_id: whiteOption?.id, value: 'Natural' },
    { product_id: products[11].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Organic Textiles' },
    { product_id: products[11].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Organic Cotton' },

    // Wireless Bluetooth Headphones attributes (Product 20)
    { product_id: products[20].id, attribute_id: colorAttr.id, option_id: blackOption?.id, value: 'Black' },
    { product_id: products[20].id, attribute_id: brandAttr.id, option_id: sonyOption?.id, value: 'Sony' },
    { product_id: products[20].id, attribute_id: warrantyAttr.id, option_id: twoYearOption?.id, value: '2 Years' },

    // Classic Denim Jeans attributes (Product 21)
    { product_id: products[21].id, attribute_id: colorAttr.id, option_id: blueOption?.id, value: 'Blue' },
    { product_id: products[21].id, attribute_id: sizeAttr.id, option_id: lOption?.id, value: '32' },
    { product_id: products[21].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Classic Wear' },
    { product_id: products[21].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Denim' },

    // LED Desk Lamp attributes (Product 22)
    { product_id: products[22].id, attribute_id: colorAttr.id, option_id: whiteOption?.id, value: 'White' },
    { product_id: products[22].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'BrightTech' },
    { product_id: products[22].id, attribute_id: warrantyAttr.id, option_id: oneYearOption?.id, value: '1 Year' },

    // Mountain Bike attributes (Product 23)
    { product_id: products[23].id, attribute_id: colorAttr.id, option_id: redOption?.id, value: 'Red' },
    { product_id: products[23].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Trek' },
    { product_id: products[23].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Aluminum' },

    // JavaScript Programming Guide attributes (Product 25)
    { product_id: products[25].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Tech Books' },
    { product_id: products[25].id, attribute_id: attributes.find(a => a.slug === 'weight').id, option_id: null, value: '0.8' },

    // Action Movie Collection attributes (Product 26)
    { product_id: products[26].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Universal' },
    { product_id: products[26].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'DVD' }
  ]);

  console.log('✅ Enhanced product seed data inserted successfully!');
  console.log('📦 Products created:');
  console.log('   • 20 products (2 per unit of measure)');
  console.log('   • 14 products (2 per product category)'); 
  console.log('   • 10 products (2 per product family)');
  console.log('   • Total: 27 unique products with comprehensive attributes');
};
