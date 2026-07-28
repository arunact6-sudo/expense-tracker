const express = require('express');
const router = express.Router();
const { protect, adminCheck } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(protect);
router.use(adminCheck);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/stats', adminController.getSystemStats);
router.get('/logs', adminController.getSystemLogs);
router.get('/categories', adminController.getAllCategories);
router.put('/categories/:id', adminController.updateSystemCategory);

module.exports = router;
