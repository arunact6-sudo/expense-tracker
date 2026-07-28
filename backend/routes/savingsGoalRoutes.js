const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const savingsGoalController = require('../controllers/savingsGoalController');

router.use(protect);

router.get('/', savingsGoalController.getSavingsGoals);

router.get('/:id/progress', savingsGoalController.getGoalProgress);

router.post('/', [
  body('name').notEmpty().withMessage('Goal name is required'),
  body('targetAmount').isFloat({ min: 0.01 }).withMessage('Target amount must be greater than zero')
], validate, savingsGoalController.createSavingsGoal);

router.put('/:id', savingsGoalController.updateSavingsGoal);

router.delete('/:id', savingsGoalController.deleteSavingsGoal);

router.post('/:id/contribute', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero')
], validate, savingsGoalController.contributeToGoal);

module.exports = router;
