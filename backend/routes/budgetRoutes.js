const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const budgetController = require('../controllers/budgetController');

router.use(protect);

router.get('/alerts', budgetController.checkBudgetAlerts);

router.get('/', budgetController.getBudgets);

router.get('/:id/progress', budgetController.getBudgetProgress);

router.post('/', [
  body('name').notEmpty().withMessage('Budget name is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero')
], validate, budgetController.createBudget);

router.put('/:id', budgetController.updateBudget);

router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
