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

  // Insert products
  const products = await knex('products').insert([
    // Electronics
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
      sku: 'SM-S23-256-WHT',
      name: 'Samsung Galaxy S23',
      description: 'Premium Android smartphone with excellent camera',
      short_description: 'Premium Android smartphone',
      category_id: electronics?.id,
      family_id: consumerElectronics?.id,
      unit_id: piece?.id,
      price: '899.99',
      cost: '650.00',
      weight: '0.168',
      length: '14.64',
      width: '7.06',
      height: '0.76',
      min_stock_level: 15,
      stock_quantity: 30,
      status: 'active',
      barcode: '123456789002',
      image_url: 'https://example.com/galaxy-s23.jpg'
    },
    {
      sku: 'MBP-16-512-SLV',
      name: 'MacBook Pro 16"',
      description: 'Powerful laptop for professionals with M2 Pro chip',
      short_description: 'Powerful laptop for professionals',
      category_id: electronics?.id,
      family_id: consumerElectronics?.id,
      unit_id: piece?.id,
      price: '2499.99',
      cost: '1800.00',
      weight: '2.15',
      length: '35.57',
      width: '24.81',
      height: '1.68',
      min_stock_level: 5,
      stock_quantity: 15,
      status: 'active',
      barcode: '123456789003',
      image_url: 'https://example.com/macbook-pro.jpg'
    },

    // Clothing
    {
      sku: 'NK-DRI-M-BLK',
      name: 'Nike Dri-FIT T-Shirt',
      description: 'Moisture-wicking athletic t-shirt for active lifestyle',
      short_description: 'Moisture-wicking athletic t-shirt',
      category_id: clothing?.id,
      family_id: fashionApparel?.id,
      unit_id: piece?.id,
      price: '29.99',
      cost: '15.00',
      weight: '0.15',
      min_stock_level: 50,
      stock_quantity: 200,
      status: 'active',
      barcode: '123456789004',
      image_url: 'https://example.com/nike-tshirt.jpg'
    },
    {
      sku: 'AD-UB22-10-WHT',
      name: 'Adidas Ultraboost 22',
      description: 'Premium running shoes with Boost midsole technology',
      short_description: 'Premium running shoes',
      category_id: clothing?.id,
      family_id: fashionApparel?.id,
      unit_id: piece?.id,
      price: '189.99',
      cost: '95.00',
      weight: '0.31',
      min_stock_level: 20,
      stock_quantity: 80,
      status: 'active',
      barcode: '123456789005',
      image_url: 'https://example.com/ultraboost.jpg'
    },

    // Home & Garden
    {
      sku: 'DY-V15-CRD',
      name: 'Dyson V15 Detect',
      description: 'Cordless vacuum with laser detection technology',
      short_description: 'Cordless vacuum with laser detection',
      category_id: homeGarden?.id,
      family_id: homeEssentials?.id,
      unit_id: piece?.id,
      price: '749.99',
      cost: '450.00',
      weight: '3.1',
      length: '125.4',
      width: '25.0',
      height: '26.5',
      min_stock_level: 8,
      stock_quantity: 25,
      status: 'active',
      barcode: '123456789006',
      image_url: 'https://example.com/dyson-v15.jpg'
    },

    // Sports & Outdoors
    {
      sku: 'YM-MAT-6MM-BLU',
      name: 'Yoga Mat Premium',
      description: 'Non-slip yoga mat with excellent grip and cushioning',
      short_description: 'Non-slip yoga mat',
      category_id: sportsOutdoors?.id,
      family_id: fitnessEquipment?.id,
      unit_id: piece?.id,
      price: '49.99',
      cost: '20.00',
      weight: '1.2',
      length: '183',
      width: '61',
      height: '0.6',
      min_stock_level: 30,
      stock_quantity: 100,
      status: 'active',
      barcode: '123456789007',
      image_url: 'https://example.com/yoga-mat.jpg'
    },
    {
      sku: 'DB-SET-20KG',
      name: 'Adjustable Dumbbell Set',
      description: 'Space-saving adjustable dumbbells 5-20kg per dumbbell',
      short_description: 'Adjustable dumbbells 5-20kg',
      category_id: sportsOutdoors?.id,
      family_id: fitnessEquipment?.id,
      unit_id: piece?.id,
      price: '299.99',
      cost: '150.00',
      weight: '40.0',
      min_stock_level: 5,
      stock_quantity: 15,
      status: 'active',
      barcode: '123456789008',
      image_url: 'https://example.com/dumbbells.jpg'
    },

    // Food & Beverage
    {
      sku: 'WB-SS-750ML-BLK',
      name: 'Stainless Steel Water Bottle',
      description: 'Insulated water bottle keeps drinks hot/cold for hours',
      short_description: 'Insulated water bottle',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: piece?.id,
      price: '24.99',
      cost: '12.00',
      weight: '0.35',
      length: '7.0',
      width: '7.0',
      height: '26.5',
      min_stock_level: 40,
      stock_quantity: 150,
      status: 'active',
      barcode: '123456789009',
      image_url: 'https://example.com/water-bottle.jpg'
    },
    {
      sku: 'ORG-GRN-TEA-100G',
      name: 'Organic Green Tea',
      description: 'Premium organic green tea leaves, 100g package',
      short_description: 'Premium organic green tea',
      category_id: foodBeverage?.id,
      family_id: beverages?.id,
      unit_id: box?.id,
      price: '15.99',
      cost: '8.00',
      weight: '0.1',
      min_stock_level: 25,
      stock_quantity: 75,
      status: 'active',
      barcode: '123456789010',
      image_url: 'https://example.com/green-tea.jpg'
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
  const nikeOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Nike' }).first();
  const adidasOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Adidas' }).first();
  const genericOption = await knex('product_attribute_options').where({ attribute_id: brandAttr.id, value: 'Generic' }).first();
  
  const oneYearOption = await knex('product_attribute_options').where({ attribute_id: warrantyAttr.id, value: '1 Year' }).first();
  const twoYearOption = await knex('product_attribute_options').where({ attribute_id: warrantyAttr.id, value: '2 Years' }).first();
  
  const gb128Option = await knex('product_attribute_options').where({ attribute_id: storageAttr.id, value: '128GB' }).first();
  const gb256Option = await knex('product_attribute_options').where({ attribute_id: storageAttr.id, value: '256GB' }).first();
  const gb512Option = await knex('product_attribute_options').where({ attribute_id: storageAttr.id, value: '512GB' }).first();

  // Insert product attribute values
  await knex('product_attribute_values').insert([
    // iPhone 14 Pro attributes
    { product_id: products[0].id, attribute_id: colorAttr.id, option_id: blackOption?.id, value: 'Black' },
    { product_id: products[0].id, attribute_id: brandAttr.id, option_id: appleOption?.id, value: 'Apple' },
    { product_id: products[0].id, attribute_id: warrantyAttr.id, option_id: oneYearOption?.id, value: '1 Year' },
    { product_id: products[0].id, attribute_id: storageAttr.id, option_id: gb128Option?.id, value: '128GB' },
    { product_id: products[0].id, attribute_id: attributes.find(a => a.slug === 'screen-size').id, option_id: null, value: '6.1' },

    // Samsung Galaxy S23 attributes  
    { product_id: products[1].id, attribute_id: colorAttr.id, option_id: whiteOption?.id, value: 'White' },
    { product_id: products[1].id, attribute_id: brandAttr.id, option_id: samsungOption?.id, value: 'Samsung' },
    { product_id: products[1].id, attribute_id: warrantyAttr.id, option_id: twoYearOption?.id, value: '2 Years' },
    { product_id: products[1].id, attribute_id: storageAttr.id, option_id: gb256Option?.id, value: '256GB' },
    { product_id: products[1].id, attribute_id: attributes.find(a => a.slug === 'screen-size').id, option_id: null, value: '6.1' },

    // MacBook Pro attributes
    { product_id: products[2].id, attribute_id: colorAttr.id, option_id: blackOption?.id, value: 'Black' },
    { product_id: products[2].id, attribute_id: brandAttr.id, option_id: appleOption?.id, value: 'Apple' },
    { product_id: products[2].id, attribute_id: warrantyAttr.id, option_id: oneYearOption?.id, value: '1 Year' },
    { product_id: products[2].id, attribute_id: storageAttr.id, option_id: gb512Option?.id, value: '512GB' },
    { product_id: products[2].id, attribute_id: attributes.find(a => a.slug === 'screen-size').id, option_id: null, value: '16.2' },

    // Nike T-Shirt attributes
    { product_id: products[3].id, attribute_id: colorAttr.id, option_id: blackOption?.id, value: 'Black' },
    { product_id: products[3].id, attribute_id: sizeAttr.id, option_id: mOption?.id, value: 'M' },
    { product_id: products[3].id, attribute_id: brandAttr.id, option_id: nikeOption?.id, value: 'Nike' },
    { product_id: products[3].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Polyester' },

    // Adidas Shoes attributes
    { product_id: products[4].id, attribute_id: colorAttr.id, option_id: whiteOption?.id, value: 'White' },
    { product_id: products[4].id, attribute_id: brandAttr.id, option_id: adidasOption?.id, value: 'Adidas' },
    { product_id: products[4].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Mesh/Rubber' },

    // Dyson Vacuum attributes
    { product_id: products[5].id, attribute_id: colorAttr.id, option_id: redOption?.id, value: 'Red' },
    { product_id: products[5].id, attribute_id: warrantyAttr.id, option_id: twoYearOption?.id, value: '2 Years' },

    // Yoga Mat attributes
    { product_id: products[6].id, attribute_id: colorAttr.id, option_id: blueOption?.id, value: 'Blue' },
    { product_id: products[6].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Generic' },
    { product_id: products[6].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'TPE' },

    // Dumbbell Set attributes
    { product_id: products[7].id, attribute_id: colorAttr.id, option_id: blackOption?.id, value: 'Black' },
    { product_id: products[7].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Generic' },
    { product_id: products[7].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Cast Iron' },

    // Water Bottle attributes
    { product_id: products[8].id, attribute_id: colorAttr.id, option_id: blackOption?.id, value: 'Black' },
    { product_id: products[8].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Generic' },
    { product_id: products[8].id, attribute_id: attributes.find(a => a.slug === 'material').id, option_id: null, value: 'Stainless Steel' },
    { product_id: products[8].id, attribute_id: attributes.find(a => a.slug === 'waterproof').id, option_id: null, value: 'true' },

    // Green Tea attributes
    { product_id: products[9].id, attribute_id: brandAttr.id, option_id: genericOption?.id, value: 'Generic' },
    { product_id: products[9].id, attribute_id: attributes.find(a => a.slug === 'weight').id, option_id: null, value: '0.1' }
  ]);

  console.log('Product seed data inserted successfully');
};
