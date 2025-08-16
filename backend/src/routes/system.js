const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { hasPermission, hasRole } = require('../middleware/auth');

router.get('/settings', hasPermission('system.read'), systemController.getSettings);
router.put('/settings', hasPermission('system.update'), systemController.updateSettings);
router.get('/logs', hasRole('admin'), systemController.getLogs);
router.get('/stats', hasPermission('system.read'), systemController.getStats);
router.get('/health', systemController.healthCheck);

module.exports = router;