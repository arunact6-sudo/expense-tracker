const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Budget = require('../models/Budget');
const Category = require('../models/Category');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [wallets, totalIncome, totalExpenses, monthlyIncome, monthlyExpenses, recentTransactions, categoryBreakdown, monthlyData] = await Promise.all([
      Wallet.find({ user: userId, isActive: true }),
      Transaction.aggregate([
        { $match: { user: userId, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'income', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.find({ user: userId }).populate('category', 'name icon color').populate('wallet', 'name type').sort({ date: -1 }).limit(10),
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ]),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const income = totalIncome.length > 0 ? totalIncome[0].total : 0;
    const expenses = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
    const mIncome = monthlyIncome.length > 0 ? monthlyIncome[0].total : 0;
    const mExpenses = monthlyExpenses.length > 0 ? monthlyExpenses[0].total : 0;

    res.json({
      success: true,
      data: {
        totalBalance,
        totalIncome: income,
        totalExpenses: expenses,
        totalSavings: income - expenses,
        monthlyIncome: mIncome,
        monthlyExpenses: mExpenses,
        monthlySavings: mIncome - mExpenses,
        walletCount: wallets.length,
        recentTransactions,
        categoryBreakdown,
        monthlyData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

    const [transactions, summary] = await Promise.all([
      Transaction.find({ user: req.user._id, date: { $gte: start, $lte: end } })
        .populate('category', 'name icon color').populate('wallet', 'name type').sort({ date: -1 }),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({ success: true, data: { date: start, transactions, summary, count: transactions.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWeeklyReport = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [transactions, dailyData] = await Promise.all([
      Transaction.find({ user: req.user._id, date: { $gte: startOfWeek, $lte: endOfWeek } })
        .populate('category', 'name icon color').populate('wallet', 'name type').sort({ date: -1 }),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfWeek, $lte: endOfWeek } } },
        { $group: { _id: { day: { $dayOfWeek: '$date' }, type: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { '_id.day': 1 } }
      ])
    ]);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        startDate: startOfWeek,
        endDate: endOfWeek,
        transactions,
        dailyData,
        totalIncome,
        totalExpenses,
        count: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const [transactions, categoryData, dailyData] = await Promise.all([
      Transaction.find({ user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } })
        .populate('category', 'name icon color').populate('wallet', 'name type').sort({ date: -1 }),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth }, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { total: -1 } }
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: { day: { $dayOfMonth: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
        { $sort: { '_id.day': 1 } }
      ])
    ]);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth + 1,
        transactions,
        categoryData,
        dailyData,
        totalIncome,
        totalExpenses,
        savings: totalIncome - totalExpenses,
        count: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59);

    const [monthlyData, topCategories] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfYear, $lte: endOfYear } } },
        { $group: { _id: { month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { '_id.month': 1 } }
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfYear, $lte: endOfYear }, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ])
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    monthlyData.forEach(m => {
      if (m._id.type === 'income') totalIncome += m.total;
      if (m._id.type === 'expense') totalExpenses += m.total;
    });

    res.json({
      success: true,
      data: {
        year: targetYear,
        monthlyData,
        topCategories,
        totalIncome,
        totalExpenses,
        savings: totalIncome - totalExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCategoryReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;

    const categoryData = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 }, avgAmount: { $avg: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } }
    ]);

    const total = categoryData.reduce((sum, c) => sum + c.total, 0);
    const result = categoryData.map(c => ({
      ...c,
      percentage: total > 0 ? Math.round((c.total / total) * 10000) / 100 : 0
    }));

    res.json({ success: true, data: result, total });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWalletReport = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user._id, isActive: true });
    const walletData = await Promise.all(
      wallets.map(async (wallet) => {
        const [income, expenses] = await Promise.all([
          Transaction.aggregate([
            { $match: { user: req.user._id, wallet: wallet._id, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
          ]),
          Transaction.aggregate([
            { $match: { user: req.user._id, wallet: wallet._id, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
          ])
        ]);

        return {
          wallet: { _id: wallet._id, name: wallet.name, type: wallet.type, balance: wallet.balance },
          totalIncome: income.length > 0 ? income[0].total : 0,
          totalExpenses: expenses.length > 0 ? expenses[0].total : 0,
          incomeCount: income.length > 0 ? income[0].count : 0,
          expenseCount: expenses.length > 0 ? expenses[0].count : 0
        };
      })
    );

    res.json({ success: true, data: walletData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getIncomeVsExpense = async (req, res) => {
  try {
    const { period = 'monthly', count = 12 } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - parseInt(count));
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - (parseInt(count) * 7));
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - parseInt(count));
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - parseInt(count));
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12);
    }

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate } } },
      { $group: { _id: { period: '$date', type: '$type' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.period': 1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCashFlowReport = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - parseInt(months));

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyFlow = {};
    data.forEach(d => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, '0')}`;
      if (!monthlyFlow[key]) monthlyFlow[key] = { income: 0, expenses: 0, cashFlow: 0 };
      if (d._id.type === 'income') monthlyFlow[key].income = d.total;
      if (d._id.type === 'expense') monthlyFlow[key].expenses = d.total;
      monthlyFlow[key].cashFlow = monthlyFlow[key].income - monthlyFlow[key].expenses;
    });

    res.json({ success: true, data: monthlyFlow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBudgetSummary = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id, isActive: true })
      .populate('category', 'name icon color')
      .populate('wallet', 'name type');

    const summary = await Promise.all(
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
        const remaining = Math.max(0, budget.amount - spent);
        const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 10000) / 100 : 0;

        return {
          _id: budget._id,
          name: budget.name,
          amount: budget.amount,
          spent,
          remaining,
          percentage,
          isOverBudget: spent > budget.amount,
          period: budget.period,
          category: budget.category,
          wallet: budget.wallet
        };
      })
    );

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
