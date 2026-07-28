const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const backupController = require('../controllers/backupController');

router.use(protect);

router.get('/backup', backupController.backupData);
router.post('/restore', backupController.restoreData);
router.get('/export/csv', backupController.exportToCSV);
router.get('/export/excel', backupController.exportToExcel);

module.exports = router;
