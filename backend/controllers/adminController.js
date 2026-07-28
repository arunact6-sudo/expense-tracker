const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Wallet = require('../models/Wallet');
const { paginate } = require('../utils/helpers');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(lim),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page: pg, limit: lim, total, pages: Math.ceil(total / lim) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ success: false, error: 'isActive field is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalTransactions, totalIncome, totalExpenses, totalWallets] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Wallet.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalTransactions,
        totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
        totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
        totalWallets
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const recentUsers = await User.find().select('name email lastLogin createdAt').sort({ createdAt: -1 }).limit(20);
    const recentTransactions = await Transaction.find().select('title amount type date user').populate('user', 'name email').sort({ createdAt: -1 }).limit(20);

    const logs = [
      ...recentUsers.map(u => ({ type: 'user', action: 'registered', user: u.name, email: u.email, date: u.createdAt })),
      ...recentTransactions.map(t => ({ type: 'transaction', action: 'created', description: `${t.title} - ${t.amount}`, user: t.user ? t.user.name : 'Unknown', date: t.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(skip, skip + lim);

    res.json({ success: true, data: logs, pagination: { page: pg, limit: lim } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ isSystem: -1, name: 1 });
    res.json({ success: true, data: categories, count: categories.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSystemCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    if (!category.isSystem) {
      return res.status(400).json({ success: false, error: 'Can only update system categories' });
    }

    const { name, type, icon, color } = req.body;
    if (name) category.name = name;
    if (type) category.type = type;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
