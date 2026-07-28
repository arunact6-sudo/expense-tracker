const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const billController = require('../controllers/billController');

router.use(protect);

router.get('/upcoming', billController.getUpcomingBills);

router.get('/overdue', billController.getOverdueBills);

router.get('/', billController.getBills);

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero'),
  body('dueDate').notEmpty().withMessage('Due date is required')
], validate, billController.createBill);

router.put('/:id', billController.updateBill);

router.delete('/:id', billController.deleteBill);

router.put('/:id/pay', billController.markAsPaid);

module.exports = router;
