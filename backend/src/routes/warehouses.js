const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { hasPermission } = require('../middleware/auth');
const { validate, warehouseSchemas } = require('../middleware/validation');

router.get('/', hasPermission('warehouses.read'), warehouseController.getAll);
router.get('/:id', hasPermission('warehouses.read'), warehouseController.getById);
router.post('/', hasPermission('warehouses.create'), validate(warehouseSchemas.create), warehouseController.create);
router.put('/:id', hasPermission('warehouses.update'), validate(warehouseSchemas.update), warehouseController.update);
router.delete('/:id', hasPermission('warehouses.delete'), warehouseController.delete);

module.exports = router;