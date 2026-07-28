const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .populate('category', 'name icon color')
      .populate('wallet', 'name type')
      .sort({ createdAt: -1 });

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const query = { user: req.user._id, type: 'expense' };
        if (budget.category) query.category = budget.category;
        if (budget.startDate) query.date = { $gte: budget.startDate };
        if (budget.endDate) query.date = { ...query.date, $lte: budget.endDate };

        const result = await Transaction.aggregate([
          { $match: query },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const spent = result.length > 0 ? result[0].total : 0;
        const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 10000) / 100 : 0;

        return {
          ...budget.toObject(),
          spent,
          percentage,
          remaining: Math.max(0, budget.amount - spent),
          isOverBudget: spent > budget.amount
        };
      })
    );

    res.json({ success: true, data: budgetsWithProgress, count: budgetsWithProgress.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { name, amount, period, category, wallet, startDate, endDate, alertThresholds } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ success: false, error: 'Budget name and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Budget amount must be greater than zero' });
    }

    const budget = await Budget.create({
      user: req.user._id,
      name,
      amount,
      period: period || 'monthly',
      category,
      wallet,
      startDate: startDate || new Date(),
      endDate,
      alertThresholds: alertThresholds || { warn: 80, danger: 90 }
    });

    const populated = await Budget.findById(budget._id)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }

    const { name, amount, period, category, wallet, startDate, endDate, alertThresholds, isActive } = req.body;
    if (name !== undefined) budget.name = name;
    if (amount !== undefined) budget.amount = amount;
    if (period !== undefined) budget.period = period;
    if (category !== undefined) budget.category = category;
    if (wallet !== undefined) budget.wallet = wallet;
    if (startDate !== undefined) budget.startDate = startDate;
    if (endDate !== undefined) budget.endDate = endDate;
    if (alertThresholds !== undefined) budget.alertThresholds = alertThresholds;
    if (isActive !== undefined) budget.isActive = isActive;

    await budget.save();

    const populated = await Budget.findById(budget._id)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBudgetProgress = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id })
      .populate('category', 'name icon color')
      .populate('wallet', 'name type');

    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }

    const query = { user: req.user._id, type: 'expense' };
    if (budget.category) query.category = budget.category;
    if (budget.startDate) query.date = { $gte: budget.startDate };
    if (budget.endDate) query.date = { ...query.date, $lte: budget.endDate };

    const result = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const spent = result.length > 0 ? result[0].total : 0;
    const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 10000) / 100 : 0;

    res.json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        percentage,
        remaining: Math.max(0, budget.amount - spent),
        isOverBudget: spent > budget.amount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.checkBudgetAlerts = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id, isActive: true })
      .populate('category', 'name icon color');

    const alerts = [];

    for (const budget of budgets) {
      const query = { user: req.user._id, type: 'expense' };
      if (budget.category) query.category = budget.category;
      if (budget.startDate) query.date = { $gte: budget.startDate };
      if (budget.endDate) query.date = { ...query.date, $lte: budget.endDate };

      const result = await Transaction.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const spent = result.length > 0 ? result[0].total : 0;
      const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 10000) / 100 : 0;

      if (percentage >= budget.alertThresholds.danger) {
        alerts.push({
          budgetId: budget._id,
          budgetName: budget.name,
          percentage,
          level: 'danger',
          message: `Budget "${budget.name}" has exceeded ${percentage}% of ${budget.amount}`
        });
      } else if (percentage >= budget.alertThresholds.warn) {
        alerts.push({
          budgetId: budget._id,
          budgetName: budget.name,
          percentage,
          level: 'warning',
          message: `Budget "${budget.name}" has reached ${percentage}% of ${budget.amount}`
        });
      }
    }

    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
