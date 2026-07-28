const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  period: { type: String, enum: ['monthly', 'weekly', 'yearly', 'custom'], default: 'monthly' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  startDate: { type: Date },
  endDate: { type: Date },
  alertThresholds: {
    warn: { type: Number, default: 80 },
    danger: { type: Number, default: 90 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

budgetSchema.index({ user: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
