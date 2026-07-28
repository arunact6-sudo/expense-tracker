const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  dueDate: { type: Date, required: true },
  isPaid: { type: Boolean, default: false },
  paidDate: { type: Date },
  isRecurring: { type: Boolean, default: false },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  notes: { type: String, trim: true },
  reminderDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

billSchema.index({ user: 1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ isPaid: 1 });

module.exports = mongoose.model('Bill', billSchema);
