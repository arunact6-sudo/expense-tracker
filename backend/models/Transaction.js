const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  date: { type: Date, default: Date.now },
  time: { type: String },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'debit_card', 'upi', 'other'],
    default: 'cash'
  },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  toWallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  notes: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  receiptUrl: { type: String },
  merchantName: { type: String, trim: true },
  location: { type: String, trim: true },
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] },
    nextDate: { type: Date },
    endDate: { type: Date }
  },
  isRecurringGenerated: { type: Boolean, default: false }
}, { timestamps: true });

transactionSchema.index({ user: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
