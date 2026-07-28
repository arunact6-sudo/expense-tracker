const SavingsGoal = require('../models/SavingsGoal');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

exports.getSavingsGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    const goalsWithProgress = goals.map(goal => {
      const percentage = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 10000) / 100 : 0;
      return { ...goal.toObject(), percentage, remaining: Math.max(0, goal.targetAmount - goal.currentAmount) };
    });
    res.json({ success: true, data: goalsWithProgress, count: goalsWithProgress.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSavingsGoal = async (req, res) => {
  try {
    const { name, targetAmount, icon, color, deadline, category } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ success: false, error: 'Name and target amount are required' });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Target amount must be greater than zero' });
    }

    const goal = await SavingsGoal.create({
      user: req.user._id,
      name,
      targetAmount,
      icon: icon || 'target',
      color: color || '#6366f1',
      deadline,
      category: category || 'custom'
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Savings goal not found' });
    }

    const { name, targetAmount, currentAmount, icon, color, deadline, category, isCompleted } = req.body;
    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (icon !== undefined) goal.icon = icon;
    if (color !== undefined) goal.color = color;
    if (deadline !== undefined) goal.deadline = deadline;
    if (category !== undefined) goal.category = category;
    if (isCompleted !== undefined) {
      goal.isCompleted = isCompleted;
      if (isCompleted) goal.completedDate = new Date();
    }

    await goal.save();

    const percentage = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 10000) / 100 : 0;
    res.json({ success: true, data: { ...goal.toObject(), percentage, remaining: Math.max(0, goal.targetAmount - goal.currentAmount) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Savings goal not found' });
    }

    await SavingsGoal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Savings goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.contributeToGoal = async (req, res) => {
  try {
    const { amount, walletId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'A positive amount is required' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Savings goal not found' });
    }

    if (goal.isCompleted) {
      return res.status(400).json({ success: false, error: 'This savings goal is already completed' });
    }

    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.completedDate = new Date();
      goal.currentAmount = goal.targetAmount;
    }
    await goal.save();

    if (walletId) {
      const wallet = await Wallet.findById(walletId);
      if (wallet) {
        wallet.balance -= amount;
        await wallet.save();
      }

      await Transaction.create({
        user: req.user._id,
        title: `Savings: ${goal.name}`,
        amount,
        type: 'expense',
        date: new Date(),
        wallet: walletId,
        notes: `Contribution to savings goal: ${goal.name}`
      });
    }

    const percentage = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 10000) / 100 : 0;

    res.json({ success: true, data: { ...goal.toObject(), percentage, remaining: Math.max(0, goal.targetAmount - goal.currentAmount) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGoalProgress = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Savings goal not found' });
    }

    const percentage = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 10000) / 100 : 0;
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    let daysLeft = null;
    if (goal.deadline) {
      const diff = new Date(goal.deadline) - new Date();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.json({
      success: true,
      data: {
        ...goal.toObject(),
        percentage,
        remaining,
        daysLeft
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
