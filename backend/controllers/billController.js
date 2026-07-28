const Bill = require('../models/Bill');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

exports.getBills = async (req, res) => {
  try {
    const { status, startDate, endDate, search } = req.query;
    const query = { user: req.user._id, isActive: true };

    if (status === 'paid') query.isPaid = true;
    else if (status === 'unpaid') query.isPaid = false;

    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const bills = await Bill.find(query)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type')
      .sort({ dueDate: 1 });

    res.json({ success: true, data: bills, count: bills.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const { title, amount, category, dueDate, isRecurring, frequency, wallet, notes, reminderDate } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ success: false, error: 'Title, amount, and due date are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than zero' });
    }

    const bill = await Bill.create({
      user: req.user._id,
      title,
      amount,
      category,
      dueDate,
      isRecurring: isRecurring || false,
      frequency,
      wallet,
      notes,
      reminderDate
    });

    const populated = await Bill.findById(bill._id)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    const { title, amount, category, dueDate, isRecurring, frequency, wallet, notes, reminderDate, isActive } = req.body;
    if (title !== undefined) bill.title = title;
    if (amount !== undefined) bill.amount = amount;
    if (category !== undefined) bill.category = category;
    if (dueDate !== undefined) bill.dueDate = dueDate;
    if (isRecurring !== undefined) bill.isRecurring = isRecurring;
    if (frequency !== undefined) bill.frequency = frequency;
    if (wallet !== undefined) bill.wallet = wallet;
    if (notes !== undefined) bill.notes = notes;
    if (reminderDate !== undefined) bill.reminderDate = reminderDate;
    if (isActive !== undefined) bill.isActive = isActive;

    await bill.save();

    const populated = await Bill.findById(bill._id)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    if (bill.isPaid) {
      return res.status(400).json({ success: false, error: 'Bill is already marked as paid' });
    }

    bill.isPaid = true;
    bill.paidDate = new Date();
    await bill.save();

    if (bill.wallet) {
      const wallet = await Wallet.findById(bill.wallet);
      if (wallet) {
        wallet.balance -= bill.amount;
        await wallet.save();
      }
    }

    if (bill.category) {
      await Transaction.create({
        user: req.user._id,
        title: bill.title,
        amount: bill.amount,
        type: 'expense',
        category: bill.category,
        date: new Date(),
        paymentMethod: 'bank_transfer',
        wallet: bill.wallet,
        notes: `Bill payment: ${bill.title}`,
        merchantName: bill.title
      });
    }

    if (bill.isRecurring && bill.frequency) {
      let nextDueDate = new Date(bill.dueDate);
      switch (bill.frequency) {
        case 'daily': nextDueDate.setDate(nextDueDate.getDate() + 1); break;
        case 'weekly': nextDueDate.setDate(nextDueDate.getDate() + 7); break;
        case 'monthly': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
        case 'quarterly': nextDueDate.setMonth(nextDueDate.getMonth() + 3); break;
        case 'yearly': nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); break;
      }

      await Bill.create({
        user: req.user._id,
        title: bill.title,
        amount: bill.amount,
        category: bill.category,
        dueDate: nextDueDate,
        isRecurring: true,
        frequency: bill.frequency,
        wallet: bill.wallet,
        notes: bill.notes,
        reminderDate: bill.reminderDate
      });
    }

    const populated = await Bill.findById(bill._id)
      .populate('category', 'name icon color')
      .populate('wallet', 'name type');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUpcomingBills = async (req, res) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bills = await Bill.find({
      user: req.user._id,
      isActive: true,
      isPaid: false,
      dueDate: { $gte: new Date(), $lte: nextWeek }
    })
      .populate('category', 'name icon color')
      .populate('wallet', 'name type')
      .sort({ dueDate: 1 });

    res.json({ success: true, data: bills, count: bills.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOverdueBills = async (req, res) => {
  try {
    const bills = await Bill.find({
      user: req.user._id,
      isActive: true,
      isPaid: false,
      dueDate: { $lt: new Date() }
    })
      .populate('category', 'name icon color')
      .populate('wallet', 'name type')
      .sort({ dueDate: 1 });

    res.json({ success: true, data: bills, count: bills.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
