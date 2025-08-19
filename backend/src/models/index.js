// Central export file for all models
const BaseModel = require('./BaseModel');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const UnitsOfMeasure = require('./UnitsOfMeasure');
const ClassType = require('./ClassType');
const Warehouse = require('./Warehouse');
const ProductCategory = require('./ProductCategory');
const ProductFamily = require('./ProductFamily');
const Product = require('./Product');

module.exports = {
  BaseModel,
  User,
  Role,
  Permission,
  UnitsOfMeasure,
  ClassType,
  Warehouse,
  ProductCategory,
  ProductFamily,
  Product
};

// Individual exports for convenience
module.exports.models = {
  BaseModel,
  User,
  Role,
  Permission,
  UnitsOfMeasure,
  ClassType,
  Warehouse,
  ProductCategory,
  ProductFamily,
  Product
};

// Create instances for immediate use
module.exports.instances = {
  user: new User(),
  role: new Role(),
  permission: new Permission(),
  unitsOfMeasure: new UnitsOfMeasure(),
  classType: new ClassType(),
  warehouse: new Warehouse(),
  productCategory: new ProductCategory(),
  productFamily: new ProductFamily(),
  product: new Product()
};
