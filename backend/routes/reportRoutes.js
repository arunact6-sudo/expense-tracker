const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.use(protect);

router.get('/dashboard', reportController.getDashboardStats);
router.get('/daily', reportController.getDailyReport);
router.get('/weekly', reportController.getWeeklyReport);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/yearly', reportController.getYearlyReport);
router.get('/category', reportController.getCategoryReport);
router.get('/wallet', reportController.getWalletReport);
router.get('/income-vs-expense', reportController.getIncomeVsExpense);
router.get('/cash-flow', reportController.getCashFlowReport);
router.get('/budget-summary', reportController.getBudgetSummary);

module.exports = router;
