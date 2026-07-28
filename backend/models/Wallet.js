const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['cash', 'bank_account', 'credit_card', 'debit_card', 'upi', 'other'],
    default: 'cash'
  },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: 'wallet' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

walletSchema.index({ user: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
