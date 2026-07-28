const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    res.json({ success: true, data: wallets, totalBalance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createWallet = async (req, res) => {
  try {
    const { name, type, balance, currency, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Wallet name is required' });
    }

    const wallet = await Wallet.create({
      user: req.user._id,
      name,
      type: type || 'cash',
      balance: balance || 0,
      currency: currency || 'USD',
      color: color || '#6366f1',
      icon: icon || 'wallet'
    });

    res.status(201).json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ _id: req.params.id, user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    const { name, type, balance, currency, color, icon, isActive } = req.body;
    if (name !== undefined) wallet.name = name;
    if (type !== undefined) wallet.type = type;
    if (balance !== undefined) wallet.balance = balance;
    if (currency !== undefined) wallet.currency = currency;
    if (color !== undefined) wallet.color = color;
    if (icon !== undefined) wallet.icon = icon;
    if (isActive !== undefined) wallet.isActive = isActive;

    await wallet.save();
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ _id: req.params.id, user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    if (wallet.balance !== 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete wallet with a non-zero balance. Transfer or spend the remaining balance first.' });
    }

    await Wallet.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Wallet deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.transferBetweenWallets = async (req, res) => {
  try {
    const { fromWalletId, toWalletId, amount, notes } = req.body;

    if (!fromWalletId || !toWalletId || !amount) {
      return res.status(400).json({ success: false, error: 'Source wallet, destination wallet, and amount are required' });
    }

    if (fromWalletId === toWalletId) {
      return res.status(400).json({ success: false, error: 'Cannot transfer to the same wallet' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than zero' });
    }

    const sourceWallet = await Wallet.findOne({ _id: fromWalletId, user: req.user._id });
    const destWallet = await Wallet.findOne({ _id: toWalletId, user: req.user._id });

    if (!sourceWallet || !destWallet) {
      return res.status(404).json({ success: false, error: 'One or both wallets not found' });
    }

    if (sourceWallet.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance in source wallet' });
    }

    sourceWallet.balance -= amount;
    destWallet.balance += amount;
    await sourceWallet.save();
    await destWallet.save();

    const transaction = await Transaction.create({
      user: req.user._id,
      title: `Transfer from ${sourceWallet.name} to ${destWallet.name}`,
      amount,
      type: 'transfer',
      date: new Date(),
      paymentMethod: 'bank_transfer',
      wallet: fromWalletId,
      toWallet: toWalletId,
      notes: notes || `Transfer from ${sourceWallet.name} to ${destWallet.name}`
    });

    const populated = await Transaction.findById(transaction._id)
      .populate('wallet', 'name type')
      .populate('toWallet', 'name type');

    res.status(201).json({ success: true, data: { transaction: populated, sourceWallet, destWallet } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWalletSummary = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user._id, isActive: true });

    const summary = {
      totalBalance: 0,
      byType: {},
      walletCount: wallets.length
    };

    wallets.forEach(w => {
      summary.totalBalance += w.balance;
      if (!summary.byType[w.type]) {
        summary.byType[w.type] = { count: 0, totalBalance: 0 };
      }
      summary.byType[w.type].count += 1;
      summary.byType[w.type].totalBalance += w.balance;
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
