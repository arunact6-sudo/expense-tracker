const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');
const Bill = require('../models/Bill');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Notification = require('../models/Notification');

exports.backupData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [transactions, wallets, categories, bills, budgets, savingsGoals, notifications] = await Promise.all([
      Transaction.find({ user: userId }).populate('category', 'name').populate('wallet', 'name').populate('toWallet', 'name'),
      Wallet.find({ user: userId }),
      Category.find({ user: userId }),
      Bill.find({ user: userId }).populate('category', 'name').populate('wallet', 'name'),
      Budget.find({ user: userId }).populate('category', 'name').populate('wallet', 'name'),
      SavingsGoal.find({ user: userId }),
      Notification.find({ user: userId })
    ]);

    const backupData = {
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        preferences: req.user.preferences
      },
      transactions,
      wallets,
      categories,
      bills,
      budgets,
      savingsGoals,
      notifications,
      backupDate: new Date(),
      version: '1.0'
    };

    res.setHeader('Content-Disposition', `attachment; filename=expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.json(backupData);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.restoreData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, error: 'No data provided for restoration' });
    }

    if (data.transactions && Array.isArray(data.transactions)) {
      await Transaction.deleteMany({ user: userId });
      const transactions = data.transactions.map(t => ({ ...t, user: userId, _id: undefined }));
      if (transactions.length > 0) await Transaction.insertMany(transactions);
    }

    if (data.wallets && Array.isArray(data.wallets)) {
      await Wallet.deleteMany({ user: userId });
      const wallets = data.wallets.map(w => ({ ...w, user: userId, _id: undefined }));
      if (wallets.length > 0) await Wallet.insertMany(wallets);
    }

    if (data.categories && Array.isArray(data.categories)) {
      await Category.deleteMany({ user: userId });
      const categories = data.categories.map(c => ({ ...c, user: userId, _id: undefined, isSystem: false }));
      if (categories.length > 0) await Category.insertMany(categories);
    }

    if (data.bills && Array.isArray(data.bills)) {
      await Bill.deleteMany({ user: userId });
      const bills = data.bills.map(b => ({ ...b, user: userId, _id: undefined }));
      if (bills.length > 0) await Bill.insertMany(bills);
    }

    if (data.budgets && Array.isArray(data.budgets)) {
      await Budget.deleteMany({ user: userId });
      const budgets = data.budgets.map(b => ({ ...b, user: userId, _id: undefined }));
      if (budgets.length > 0) await Budget.insertMany(budgets);
    }

    if (data.savingsGoals && Array.isArray(data.savingsGoals)) {
      await SavingsGoal.deleteMany({ user: userId });
      const goals = data.savingsGoals.map(g => ({ ...g, user: userId, _id: undefined }));
      if (goals.length > 0) await SavingsGoal.insertMany(goals);
    }

    if (data.notifications && Array.isArray(data.notifications)) {
      await Notification.deleteMany({ user: userId });
      const notifications = data.notifications.map(n => ({ ...n, user: userId, _id: undefined }));
      if (notifications.length > 0) await Notification.insertMany(notifications);
    }

    res.json({ success: true, message: 'Data restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportToCSV = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;
    if (category) query.category = category;

    const transactions = await Transaction.find(query)
      .populate('category', 'name')
      .populate('wallet', 'name')
      .sort({ date: -1 });

    const headers = 'Date,Title,Amount,Type,Category,Wallet,Payment Method,Notes,Tags,Merchant,Location';
    const rows = transactions.map(t => {
      const date = new Date(t.date).toLocaleDateString();
      const title = `"${(t.title || '').replace(/"/g, '""')}"`;
      const amount = t.amount;
      const type = t.type;
      const categoryName = t.category ? `"${t.category.name}"` : '';
      const walletName = t.wallet ? `"${t.wallet.name}"` : '';
      const paymentMethod = t.paymentMethod || '';
      const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;
      const tags = `"${(t.tags || []).join(', ')}"`;
      const merchant = `"${(t.merchantName || '').replace(/"/g, '""')}"`;
      const location = `"${(t.location || '').replace(/"/g, '""')}"`;
      return `${date},${title},${amount},${type},${categoryName},${walletName},${paymentMethod},${notes},${tags},${merchant},${location}`;
    });

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportToExcel = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;
    if (category) query.category = category;

    const transactions = await Transaction.find(query)
      .populate('category', 'name')
      .populate('wallet', 'name')
      .sort({ date: -1 });

    const headers = 'Date\tTitle\tAmount\tType\tCategory\tWallet\tPayment Method\tNotes\tTags\tMerchant\tLocation';
    const rows = transactions.map(t => {
      const date = new Date(t.date).toLocaleDateString();
      const title = t.title || '';
      const amount = t.amount;
      const type = t.type;
      const categoryName = t.category ? t.category.name : '';
      const walletName = t.wallet ? t.wallet.name : '';
      const paymentMethod = t.paymentMethod || '';
      const notes = t.notes || '';
      const tags = (t.tags || []).join(', ');
      const merchant = t.merchantName || '';
      const location = t.location || '';
      return `${date}\t${title}\t${amount}\t${type}\t${categoryName}\t${walletName}\t${paymentMethod}\t${notes}\t${tags}\t${merchant}\t${location}`;
    });

    const xlsContent = [headers, ...rows].join('\n');

    res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().slice(0, 10)}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(xlsContent);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
