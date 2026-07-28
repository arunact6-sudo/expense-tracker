const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

router.use(protect);

router.get('/search', transactionController.searchTransactions);

router.get('/date-range', transactionController.getTransactionsByDateRange);

router.get('/', transactionController.getTransactions);

router.get('/:id', transactionController.getTransaction);

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero'),
  body('type').isIn(['income', 'expense', 'transfer']).withMessage('Type must be income, expense, or transfer')
], validate, transactionController.createTransaction);

router.put('/:id', transactionController.updateTransaction);

router.delete('/:id', transactionController.deleteTransaction);

router.post('/:id/duplicate', transactionController.duplicateTransaction);

router.post('/bulk-delete', transactionController.bulkDeleteTransactions);

module.exports = router;
