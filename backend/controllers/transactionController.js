const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { paginate } = require('../utils/helpers');

exports.getTransactions = async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder, type, category, wallet, startDate, endDate, minAmount, maxAmount, search } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page || 1, limit || 20);

    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (wallet) query.wallet = wallet;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { merchantName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy || 'date'] = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).populate('category', 'name icon color').populate('wallet', 'name type').populate('toWallet', 'name type').sort(sort).skip(skip).limit(lim),
      Transaction.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: { page: pg, limit: lim, total, pages: Math.ceil(total / lim) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id })
      .populate('category', 'name icon color')
      .populate('wallet', 'name type')
      .populate('toWallet', 'name type');

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, time, paymentMethod, wallet, toWallet, notes, tags, receiptUrl, merchantName, location, recurring } = req.body;

    if (!title || !amount || !type) {
      return res.status(400).json({ success: false, error: 'Title, amount, and type are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than zero' });
    }

    if (type === 'transfer' && !wallet) {
      return res.status(400).json({ success: false, error: 'Source wallet is required for transfers' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || new Date(),
      time,
      paymentMethod: paymentMethod || 'cash',
      wallet,
      toWallet: type === 'transfer' ? toWallet : undefined,
      notes,
      tags: tags || [],
      receiptUrl,
      merchantName,
      location,
      recurring: recurring || { isRecurring: false }
    });

    if (wallet && type !== 'transfer') {
      const walletDoc = await Wallet.findById(wallet);
      if (walletDoc) {
        if (type === 'expense') {
          walletDoc.balance -= amount;
        } else if (type === 'income') {
          walletDoc.balance += amount;
        }
        await walletDoc.save();
      }
    }

    if (type === 'transfer' && wallet && toWallet) {
      const sourceWallet = await Wallet.findById(wallet);
      const destWallet = await Wallet.findById(toWallet);
      if (sourceWallet && destWallet) {
        sourceWallet.balance -= amount;
        destWallet.balance += amount;
        await sourceWallet.save();
        await destWallet.save();
      }
    }

    const populated = await Transaction.findById(transaction._id)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type')
      .populate('toWallet', 'name type');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const existing = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const oldWallet = existing.wallet ? existing.wallet.toString() : null;
    const oldToWallet = existing.toWallet ? existing.toWallet.toString() : null;
    const oldAmount = existing.amount;
    const oldType = existing.type;

    const { title, amount, type, category, date, time, paymentMethod, wallet, toWallet, notes, tags, receiptUrl, merchantName, location, recurring } = req.body;

    if (oldWallet && oldType !== 'transfer') {
      const w = await Wallet.findById(oldWallet);
      if (w) {
        if (oldType === 'expense') w.balance += oldAmount;
        else if (oldType === 'income') w.balance -= oldAmount;
        await w.save();
      }
    }

    if (oldType === 'transfer' && oldWallet && oldToWallet) {
      const sw = await Wallet.findById(oldWallet);
      const dw = await Wallet.findById(oldToWallet);
      if (sw) { sw.balance += oldAmount; await sw.save(); }
      if (dw) { dw.balance -= oldAmount; await dw.save(); }
    }

    const newType = type || oldType;
    const newAmount = amount !== undefined ? amount : oldAmount;
    const newWallet = wallet || oldWallet;

    if (title !== undefined) existing.title = title;
    if (amount !== undefined) existing.amount = amount;
    if (type !== undefined) existing.type = type;
    if (category !== undefined) existing.category = category;
    if (date !== undefined) existing.date = date;
    if (time !== undefined) existing.time = time;
    if (paymentMethod !== undefined) existing.paymentMethod = paymentMethod;
    if (wallet !== undefined) existing.wallet = wallet;
    if (toWallet !== undefined) existing.toWallet = toWallet;
    if (notes !== undefined) existing.notes = notes;
    if (tags !== undefined) existing.tags = tags;
    if (receiptUrl !== undefined) existing.receiptUrl = receiptUrl;
    if (merchantName !== undefined) existing.merchantName = merchantName;
    if (location !== undefined) existing.location = location;
    if (recurring !== undefined) existing.recurring = recurring;

    await existing.save();

    if (newWallet && newType !== 'transfer') {
      const w = await Wallet.findById(newWallet);
      if (w) {
        if (newType === 'expense') w.balance -= newAmount;
        else if (newType === 'income') w.balance += newAmount;
        await w.save();
      }
    }

    if (newType === 'transfer' && newWallet) {
      const dest = toWallet || oldToWallet;
      if (dest) {
        const sw = await Wallet.findById(newWallet);
        const dw = await Wallet.findById(dest);
        if (sw) { sw.balance -= newAmount; await sw.save(); }
        if (dw) { dw.balance += newAmount; await dw.save(); }
      }
    }

    const populated = await Transaction.findById(existing._id)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type')
      .populate('toWallet', 'name type');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    if (transaction.wallet && transaction.type !== 'transfer') {
      const wallet = await Wallet.findById(transaction.wallet);
      if (wallet) {
        if (transaction.type === 'expense') wallet.balance += transaction.amount;
        else if (transaction.type === 'income') wallet.balance -= transaction.amount;
        await wallet.save();
      }
    }

    if (transaction.type === 'transfer' && transaction.wallet && transaction.toWallet) {
      const sw = await Wallet.findById(transaction.wallet);
      const dw = await Wallet.findById(transaction.toWallet);
      if (sw) { sw.balance += transaction.amount; await sw.save(); }
      if (dw) { dw.balance -= transaction.amount; await dw.save(); }
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.duplicateTransaction = async (req, res) => {
  try {
    const original = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!original) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const duplicate = await Transaction.create({
      user: req.user._id,
      title: `${original.title} (Copy)`,
      amount: original.amount,
      type: original.type,
      category: original.category,
      date: new Date(),
      paymentMethod: original.paymentMethod,
      wallet: original.wallet,
      toWallet: original.toWallet,
      notes: original.notes,
      tags: original.tags,
      merchantName: original.merchantName,
      location: original.location
    });

    if (duplicate.wallet && duplicate.type !== 'transfer') {
      const w = await Wallet.findById(duplicate.wallet);
      if (w) {
        if (duplicate.type === 'expense') w.balance -= duplicate.amount;
        else if (duplicate.type === 'income') w.balance += duplicate.amount;
        await w.save();
      }
    }

    const populated = await Transaction.findById(duplicate._id)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type')
      .populate('toWallet', 'name type');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkDeleteTransactions = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide an array of transaction IDs' });
    }

    const transactions = await Transaction.find({ _id: { $in: ids }, user: req.user._id });

    for (const t of transactions) {
      if (t.wallet && t.type !== 'transfer') {
        const w = await Wallet.findById(t.wallet);
        if (w) {
          if (t.type === 'expense') w.balance += t.amount;
          else if (t.type === 'income') w.balance -= t.amount;
          await w.save();
        }
      }
      if (t.type === 'transfer' && t.wallet && t.toWallet) {
        const sw = await Wallet.findById(t.wallet);
        const dw = await Wallet.findById(t.toWallet);
        if (sw) { sw.balance += t.amount; await sw.save(); }
        if (dw) { dw.balance -= t.amount; await dw.save(); }
      }
    }

    const result = await Transaction.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ success: true, message: `${result.deletedCount} transactions deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTransactionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Start date and end date are required' });
    }

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('category', 'name icon color').populate('wallet', 'name type').sort({ date: -1 });

    res.json({ success: true, data: transactions, count: transactions.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchTransactions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const transactions = await Transaction.find({
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
        { merchantName: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    }).populate('category', 'name icon color').populate('wallet', 'name type').sort({ date: -1 }).limit(50);

    res.json({ success: true, data: transactions, count: transactions.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
